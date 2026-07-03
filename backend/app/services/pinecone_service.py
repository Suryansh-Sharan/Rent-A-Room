import logging
from typing import List, Dict, Any
from pinecone import Pinecone
from app.config import settings

logger = logging.getLogger(__name__)

class PineconeService:
    def __init__(self):
        api_key = settings.PINECONE_API_KEY
        host = settings.PINECONE_HOST
        
        if api_key and host:
            try:
                self.pc = Pinecone(api_key=api_key)
                self.index = self.pc.Index(host=host)
                self.active = True
                logger.info("Pinecone service initialized and connected successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Pinecone: {str(e)}")
                self.active = False
        else:
            logger.warning("Pinecone API key or host missing in configuration. Pinecone service is disabled.")
            self.active = False

    def upsert_listing(
        self,
        listing_id: str,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> None:
        """
        Upserts a listing's vector embedding and metadata to Pinecone.
        Metadata includes: listing_id, location, rent, available_date,
        room_type, owner_id, tags, embedding_model, embedding_version.
        """
        if not self.active:
            logger.warning("Pinecone is inactive. Skipping listing upsert.")
            return

        metadata["embedding_model"] = "all-MiniLM-L6-v2"
        metadata["embedding_version"] = "v1"

        try:
            self.index.upsert(
                vectors=[
                    {
                        "id": str(listing_id),
                        "values": embedding,
                        "metadata": metadata
                    }
                ]
            )
            logger.info(f"Successfully upserted listing {listing_id} to Pinecone.")
        except Exception as e:
            logger.error(f"Pinecone upsert failed for listing {listing_id}: {str(e)}")
            raise e

    def delete_listing(self, listing_id: str) -> None:
        """
        Synchronously deletes a vector embedding from Pinecone.
        """
        if not self.active:
            logger.warning("Pinecone is inactive. Skipping listing deletion.")
            return

        try:
            self.index.delete(ids=[str(listing_id)])
            logger.info(f"Successfully deleted listing {listing_id} from Pinecone.")
        except Exception as e:
            logger.error(f"Pinecone deletion failed for listing {listing_id}: {str(e)}")
            raise e

    def update_listing(
        self,
        listing_id: str,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> None:
        """
        Updates a listing's embedding by performing an upsert.
        """
        self.upsert_listing(listing_id, embedding, metadata)

    def query_listings(
        self,
        query_embedding: List[float],
        candidate_ids: List[str],
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Queries Pinecone for similar listings. Limits candidates using a
        metadata filter on candidate_ids.
        """
        if not self.active:
            logger.warning("Pinecone is inactive. Returning empty query results.")
            return []

        # If there are no SQL candidate listings, return empty list
        if not candidate_ids:
            return []

        try:
            # Metadata filter to restrict vector search to SQL candidates
            pinecone_filter = {
                "listing_id": {"$in": [str(cid) for cid in candidate_ids]}
            }

            response = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                filter=pinecone_filter,
                include_metadata=True,
                _request_timeout=3.0
            )
            
            matches = []
            for match in response.get("matches", []):
                matches.append({
                    "id": match.get("id"),
                    "score": match.get("score"),  # cosine similarity
                    "metadata": match.get("metadata", {})
                })
            return matches
        except Exception as e:
            logger.warning(f"Pinecone query failed or timed out: {str(e)}. Falling back to SQL candidates.")
            return []
