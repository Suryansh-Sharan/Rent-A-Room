import logging
from uuid import UUID
from typing import List, Optional
from sqlalchemy import delete
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import CompatibilityScoreModel

logger = logging.getLogger(__name__)

class CompatibilityRepository:
    async def get_cached_scores(
        self,
        db: AsyncSession,
        tenant_id: UUID,
        room_ids: List[UUID]
    ) -> List[CompatibilityScoreModel]:
        """
        Retrieves cached compatibility scores for a given tenant and a list of room IDs.
        Filters by current cache version 'v1' to support simple cache invalidation/upgrades.
        """
        if not room_ids:
            return []
        
        try:
            query = select(CompatibilityScoreModel).where(
                CompatibilityScoreModel.tenant_id == tenant_id,
                CompatibilityScoreModel.room_id.in_(room_ids),
                CompatibilityScoreModel.cache_version == "v1"
            )
            result = await db.execute(query)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f"Error fetching cached compatibility scores: {str(e)}")
            return []

    async def save_compatibility_score(
        self,
        db: AsyncSession,
        tenant_id: UUID,
        room_id: UUID,
        compatibility_score: int,
        rule_score: int,
        semantic_similarity: float,
        llm_response: dict
    ) -> Optional[CompatibilityScoreModel]:
        """
        Saves or updates (upserts) a compatibility score in the PostgreSQL cache.
        """
        try:
            query = select(CompatibilityScoreModel).where(
                CompatibilityScoreModel.tenant_id == tenant_id,
                CompatibilityScoreModel.room_id == room_id
            )
            result = await db.execute(query)
            existing = result.scalar_one_or_none()
            
            if existing:
                existing.compatibility_score = compatibility_score
                existing.rule_score = rule_score
                existing.semantic_similarity = semantic_similarity
                existing.llm_response = llm_response
                existing.cache_version = "v1"
                score_model = existing
                logger.info(f"Updated cached compatibility for tenant {tenant_id} and room {room_id}.")
            else:
                score_model = CompatibilityScoreModel(
                    tenant_id=tenant_id,
                    room_id=room_id,
                    compatibility_score=compatibility_score,
                    rule_score=rule_score,
                    semantic_similarity=semantic_similarity,
                    llm_response=llm_response,
                    cache_version="v1"
                )
                db.add(score_model)
                logger.info(f"Created new cached compatibility for tenant {tenant_id} and room {room_id}.")
                
            await db.commit()
            return score_model
        except Exception as e:
            logger.error(f"Failed to cache compatibility score: {str(e)}")
            # Rollback to keep transaction clean
            await db.rollback()
            return None

    async def invalidate_room_cache(self, db: AsyncSession, room_id: UUID) -> None:
        """
        Invalidates (deletes) all cached scores for a modified or deleted room listing.
        """
        try:
            query = delete(CompatibilityScoreModel).where(CompatibilityScoreModel.room_id == room_id)
            await db.execute(query)
            await db.commit()
            logger.info(f"Invalidated cached compatibility scores for room {room_id}.")
        except Exception as e:
            logger.error(f"Failed to invalidate room cache: {str(e)}")
            await db.rollback()

    async def invalidate_tenant_cache(self, db: AsyncSession, tenant_id: UUID) -> None:
        """
        Invalidates (deletes) all cached scores for a tenant who updated their profile/preferences.
        """
        try:
            query = delete(CompatibilityScoreModel).where(CompatibilityScoreModel.tenant_id == tenant_id)
            await db.execute(query)
            await db.commit()
            logger.info(f"Invalidated cached compatibility scores for tenant {tenant_id}.")
        except Exception as e:
            logger.error(f"Failed to invalidate tenant cache: {str(e)}")
            await db.rollback()
