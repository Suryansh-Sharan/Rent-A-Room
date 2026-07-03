import logging
import asyncio
from uuid import UUID
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.embedding_service import EmbeddingService
from app.services.pinecone_service import PineconeService
from app.services.compatibility_repository import CompatibilityRepository
from app.services.rule_engine import RuleEngine
from app.services.ollama_service import OllamaService

logger = logging.getLogger(__name__)

class CompatibilityService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.pinecone_service = PineconeService()
        self.repository = CompatibilityRepository()
        self.rule_engine = RuleEngine()
        self.ollama_service = OllamaService()

    async def get_ranked_listings(
        self,
        db: AsyncSession,
        tenant_user: Any,
        sql_candidate_rooms: List[Any],
        search_description: str,
        preferred_tags: List[str],
        max_budget: Optional[float] = None,
        move_in_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Coordinates the semantic retrieval and compatibility scoring pipeline:
        1. Formulates and embeds the search query.
        2. Retrieves the Top 10 vector matches from Pinecone within SQL candidates.
        3. Queries PostgreSQL database cache for compatibility results.
        4. For uncached candidates, calculates rule scores and runs Ollama reasoning.
        5. Persists newly generated scores to the DB cache.
        6. Merges, ranks, and returns the sorted listings.
        """
        if not sql_candidate_rooms:
            return []

        # Create mapping of room UUID -> RoomModel object
        room_map = {room.id: room for room in sql_candidate_rooms}
        candidate_ids = [str(room.id) for room in sql_candidate_rooms]

        # Formulate query text: prioritize search parameters, fallback to user profile details
        desc = search_description or tenant_user.bio or "Need a room"
        tags = preferred_tags if preferred_tags is not None else (tenant_user.preferences or [])

        # Generate query embedding in a thread pool to avoid blocking the event loop
        query_embedding = await asyncio.to_thread(
            self.embedding_service.generate_query_embedding, desc, tags
        )

        # Query Pinecone restricted to candidate IDs in a thread pool
        pinecone_matches = await asyncio.to_thread(
            self.pinecone_service.query_listings,
            query_embedding=query_embedding,
            candidate_ids=candidate_ids,
            top_k=10
        )

        if not pinecone_matches:
            logger.info("No matching records found in Pinecone. Falling back to SQL candidates for compatibility evaluation.")
            pinecone_matches = [
                {"id": str(r.id), "score": 0.0} for r in sql_candidate_rooms[:10]
            ]

        # Query compatibility cache for matching top 10 room IDs
        top_room_ids = [UUID(m["id"]) for m in pinecone_matches]
        cached_scores = await self.repository.get_cached_scores(db, tenant_user.id, top_room_ids)
        cache_map = {score.room_id: score for score in cached_scores}

        tenant_profile = {
            "location": tenant_user.location,
            "preferences": tenant_user.preferences or [],
            "bio": tenant_user.bio,
            "budget": max_budget
        }

        results = []

        for match in pinecone_matches:
            room_uuid = UUID(match["id"])
            similarity = match["score"]
            room = room_map.get(room_uuid)

            if not room:
                continue

            if room_uuid in cache_map:
                # Cache Hit
                cached = cache_map[room_uuid]
                llm_data = cached.llm_response
                results.append({
                    "room": room,
                    "compatibility_score": cached.compatibility_score,
                    "rule_score": cached.rule_score,
                    "semantic_similarity": float(similarity),
                    "summary": llm_data.get("summary", ""),
                    "strengths": llm_data.get("strengths", []),
                    "missing_preferences": llm_data.get("missing_preferences", []),
                    "recommendation": llm_data.get("recommendation", "")
                })
            else:
                # Cache Miss - Evaluate rules & run Ollama reasoning
                room_dict = {
                    "city": room.city,
                    "area": room.area,
                    "location": room.location,
                    "rent": float(room.rent),
                    "available_from": room.available_from,
                    "amenities": room.amenities or []
                }

                rule_score = self.rule_engine.calculate_rule_score(
                    room=room_dict,
                    tenant_profile=tenant_profile,
                    preferred_tags=tags,
                    max_budget=max_budget,
                    move_in_date=move_in_date
                )

                ai_result = await self.ollama_service.get_compatibility(
                    rule_score=rule_score,
                    tenant_profile=tenant_profile,
                    room_listing=room_dict
                )

                # Persist score to DB cache
                llm_response_dict = {
                    "summary": ai_result.summary,
                    "strengths": ai_result.strengths,
                    "missing_preferences": ai_result.missing_preferences,
                    "recommendation": ai_result.recommendation
                }

                await self.repository.save_compatibility_score(
                    db=db,
                    tenant_id=tenant_user.id,
                    room_id=room_uuid,
                    compatibility_score=ai_result.compatibility_score,
                    rule_score=rule_score,
                    semantic_similarity=float(similarity),
                    llm_response=llm_response_dict
                )

                results.append({
                    "room": room,
                    "compatibility_score": ai_result.compatibility_score,
                    "rule_score": rule_score,
                    "semantic_similarity": float(similarity),
                    "summary": ai_result.summary,
                    "strengths": ai_result.strengths,
                    "missing_preferences": ai_result.missing_preferences,
                    "recommendation": ai_result.recommendation
                })

        # Sort by compatibility score in descending order
        results.sort(key=lambda x: x["compatibility_score"], reverse=True)
        return results
