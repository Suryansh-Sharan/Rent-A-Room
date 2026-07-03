from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings

# Create engine
# pool_pre_ping=True helps reconnect when the Supabase server closes idle connections
print("--- DEBUG DATABASE_URL ---")
print("DATABASE_URL:", settings.DATABASE_URL)
print("--------------------------")

engine = create_async_engine(
    settings.async_database_url,
    echo=True,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args={"statement_cache_size": 0}
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# DB Dependency for routes
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
