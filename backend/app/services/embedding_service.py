import logging
from typing import List

logger = logging.getLogger(__name__)

class EmbeddingService:
    _model = None

    @classmethod
    def get_model(cls):
        """Lazy-load the model to save memory/speed up startup."""
        if cls._model is None:
            logger.info("Initializing SentenceTransformer model 'all-MiniLM-L6-v2'...")
            from sentence_transformers import SentenceTransformer
            cls._model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Model loaded successfully.")
        return cls._model

    def generate_listing_embedding(
        self,
        location: str,
        rent: float,
        room_type: str,
        furnishing: str,
        tags: List[str],
        description: str
    ) -> List[float]:
        """
        Creates a synthesized text document representation of the listing
        and generates its 384-dimension embedding.
        """
        tags_str = ", ".join(tags) if tags else "None"
        synthesized_doc = (
            f"Location: {location}\n"
            f"Rent: {rent}\n"
            f"Room Type: {room_type}\n"
            f"Furnished: {furnishing}\n"
            f"Tags: {tags_str}\n"
            f"Description: {description}"
        )
        
        model = self.get_model()
        # encode returns numpy array, convert to list of floats
        embedding = model.encode(synthesized_doc)
        return [float(val) for val in embedding]

    def generate_query_embedding(self, description: str, tags: List[str]) -> List[float]:
        """
        Synthesizes a query document combining tenant description and preferred tags,
        then generates its 384-dimension embedding.
        """
        tags_str = ", ".join(tags) if tags else "None"
        query_doc = f"Need a room.\nTags: {tags_str}\nDescription: {description}"
        
        model = self.get_model()
        embedding = model.encode(query_doc)
        return [float(val) for val in embedding]
