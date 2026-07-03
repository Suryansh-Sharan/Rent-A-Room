from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import router as auth_router
from app.rooms.router import router as rooms_router
from app.requests.router import router as requests_router
from app.chats.router import router as chats_router

app = FastAPI(
    title="Rent-A-Room API",
    description="Backend services for AI Rent & Flatmate Finder",
    version="1.0.0"
)

# CORS middleware configuration
# Next.js frontend runs on http://localhost:3000 by default
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(rooms_router)
app.include_router(requests_router)
app.include_router(chats_router)

@app.on_event("startup")
async def on_startup():
    from app.database import engine
    from app.models import Base
    from sqlalchemy import text
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Ensure 'read' column exists on messages table (migration for existing DBs)
        await conn.execute(text(
            "ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT FALSE"
        ))

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "message": "Rent-A-Room Backend API is up and running"
    }
