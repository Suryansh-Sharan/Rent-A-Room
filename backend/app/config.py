import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    PINECONE_API_KEY: str
    PINECONE_HOST: str
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen3:4b"

    # Resend email API (optional — emails are skipped if not configured)
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "Rent-A-Room <onboarding@resend.dev>"

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        env_file_encoding = "utf-8"

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

settings = Settings()
