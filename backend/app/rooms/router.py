import asyncio
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
import cloudinary
import cloudinary.uploader

from app.database import get_db
from app.models import RoomModel, UserModel
from app.schemas import RoomCreate, RoomOut, RoomSearchOut, RoomStatusUpdate
from app.auth.router import get_current_user
from app.config import settings

# Initialize APIRouter
router = APIRouter(prefix="/api/rooms", tags=["Rooms"])

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def background_index_listing(
    room_id: str,
    title: str,
    description: str,
    rent: float,
    location: str,
    city: str,
    area: str,
    room_type: str,
    furnishing: str,
    available_from: str,
    amenities: List[str],
    owner_id: str
):
    """
    Generates embedding and upserts metadata for the listing in Pinecone in a background thread.
    """
    try:
        from app.services.embedding_service import EmbeddingService
        from app.services.pinecone_service import PineconeService

        embedding_service = EmbeddingService()
        pinecone_service = PineconeService()

        # Generate embedding for synthesized listing document
        embedding = embedding_service.generate_listing_embedding(
            location=location,
            rent=rent,
            room_type=room_type,
            furnishing=furnishing,
            tags=amenities,
            description=description
        )

        # Build Pinecone metadata
        metadata = {
            "listing_id": room_id,
            "location": location,
            "rent": rent,
            "available_date": available_from,
            "room_type": room_type,
            "owner_id": owner_id,
            "tags": amenities
        }

        # Upsert into Pinecone
        pinecone_service.upsert_listing(
            listing_id=room_id,
            embedding=embedding,
            metadata=metadata
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Background Pinecone indexing failed for room {room_id}: {str(e)}")

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user)
):
    """Upload a property image to Cloudinary and return the secure URL."""
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can upload property images."
        )
    
    # Read the file content
    contents = await file.read()
    
    # Run the synchronous Cloudinary upload function in a thread pool to avoid blocking the async event loop
    try:
        upload_result = await asyncio.to_thread(
            cloudinary.uploader.upload,
            contents,
            folder="rent_a_room/listings"
        )
        return {"url": upload_result.get("secure_url")}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cloudinary upload failed: {str(e)}"
        )

@router.post("", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
async def create_room(
    room_in: RoomCreate,
    background_tasks: BackgroundTasks,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new room listing."""
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can create room listings."
        )
    
    new_room = RoomModel(
        title=room_in.title,
        description=room_in.description,
        rent=room_in.rent,
        deposit=room_in.deposit,
        location=room_in.location,
        city=room_in.city,
        area=room_in.area,
        room_type=room_in.roomType,
        furnishing=room_in.furnishing,
        images=room_in.images,
        available_from=room_in.availableFrom,
        amenities=room_in.amenities,
        owner_id=current_user.id,
        status="active",
        floor_area=room_in.floorArea,
        floor=room_in.floor,
        total_floors=room_in.totalFloors
    )
    
    db.add(new_room)
    await db.commit()
    await db.refresh(new_room)

    # Schedule background task to generate embedding and save to Pinecone
    background_tasks.add_task(
        background_index_listing,
        room_id=str(new_room.id),
        title=new_room.title,
        description=new_room.description,
        rent=float(new_room.rent),
        location=new_room.location,
        city=new_room.city,
        area=new_room.area,
        room_type=new_room.room_type,
        furnishing=new_room.furnishing,
        available_from=new_room.available_from,
        amenities=new_room.amenities,
        owner_id=str(new_room.owner_id)
    )
    
    return {
        "id": new_room.id,
        "title": new_room.title,
        "description": new_room.description,
        "rent": float(new_room.rent),
        "deposit": float(new_room.deposit),
        "location": new_room.location,
        "city": new_room.city,
        "area": new_room.area,
        "roomType": new_room.room_type,
        "furnishing": new_room.furnishing,
        "images": new_room.images,
        "availableFrom": new_room.available_from,
        "amenities": new_room.amenities,
        "ownerId": new_room.owner_id,
        "status": new_room.status,
        "views": new_room.views,
        "saves": new_room.saves,
        "floorArea": float(new_room.floor_area) if new_room.floor_area else None,
        "floor": new_room.floor,
        "totalFloors": new_room.total_floors,
        "created_at": new_room.created_at,
        "updated_at": new_room.updated_at,
        "ownerName": f"{current_user.first_name} {current_user.last_name}",
        "ownerAvatar": current_user.avatar,
        "ownerRating": float(current_user.rating)
    }

@router.get("/owner", response_model=List[RoomOut])
async def get_owner_rooms(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all room listings created by the logged-in owner/admin."""
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can query owner listings."
        )
    
    result = await db.execute(
        select(RoomModel)
        .where(RoomModel.owner_id == current_user.id)
        .order_by(RoomModel.created_at.desc())
    )
    rooms = result.scalars().all()
    
    rooms_out = []
    for r in rooms:
        rooms_out.append({
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "rent": float(r.rent),
            "deposit": float(r.deposit),
            "location": r.location,
            "city": r.city,
            "area": r.area,
            "roomType": r.room_type,
            "furnishing": r.furnishing,
            "images": r.images,
            "availableFrom": r.available_from,
            "amenities": r.amenities,
            "ownerId": r.owner_id,
            "status": r.status,
            "views": r.views,
            "saves": r.saves,
            "floorArea": float(r.floor_area) if r.floor_area else None,
            "floor": r.floor,
            "totalFloors": r.total_floors,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
            "ownerName": f"{current_user.first_name} {current_user.last_name}",
            "ownerAvatar": current_user.avatar,
            "ownerRating": float(current_user.rating)
        })
    return rooms_out

def format_room_search_response(r: RoomModel, owner: Optional[UserModel], compatibility_item: Optional[dict]) -> dict:
    owner_name = f"{owner.first_name} {owner.last_name}" if owner else "Unknown"
    owner_avatar = owner.avatar if owner else ""
    owner_rating = float(owner.rating) if owner else 5.0
    
    res = {
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "rent": float(r.rent),
        "deposit": float(r.deposit),
        "location": r.location,
        "city": r.city,
        "area": r.area,
        "roomType": r.room_type,
        "furnishing": r.furnishing,
        "images": r.images,
        "availableFrom": r.available_from,
        "amenities": r.amenities,
        "ownerId": r.owner_id,
        "status": r.status,
        "views": r.views,
        "saves": r.saves,
        "floorArea": float(r.floor_area) if r.floor_area else None,
        "floor": r.floor,
        "totalFloors": r.total_floors,
        "created_at": r.created_at,
        "updated_at": r.updated_at,
        "ownerName": owner_name,
        "ownerAvatar": owner_avatar,
        "ownerRating": owner_rating,
    }
    
    if compatibility_item:
        res["compatibilityScore"] = compatibility_item["compatibility_score"]
        res["ruleScore"] = compatibility_item["rule_score"]
        res["semanticSimilarity"] = compatibility_item["semantic_similarity"]
        res["summary"] = compatibility_item["summary"]
        res["strengths"] = compatibility_item["strengths"]
        res["missingPreferences"] = compatibility_item["missing_preferences"]
        res["recommendation"] = compatibility_item["recommendation"]
    else:
        res["compatibilityScore"] = None
        res["ruleScore"] = None
        res["semanticSimilarity"] = None
        res["summary"] = None
        res["strengths"] = []
        res["missingPreferences"] = []
        res["recommendation"] = None
        
    return res

@router.get("", response_model=List[RoomSearchOut])
async def list_rooms(
    city: Optional[str] = None,
    location: Optional[str] = None,
    budget: Optional[float] = None,
    availability: Optional[str] = None,
    tags: Optional[str] = None,
    description: Optional[str] = None,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve rooms, filtered by SQL criteria and ranked by Semantic Similarity & Compatibility Score."""
    # 1. SQL pre-filtering
    query = select(RoomModel, UserModel).join(UserModel, RoomModel.owner_id == UserModel.id)
    
    search_loc = location or city
    if search_loc and search_loc.strip():
        # Match case-insensitive city name, or partial location/area
        query = query.where(
            (func.lower(RoomModel.city) == search_loc.lower().strip()) |
            (func.lower(RoomModel.location).contains(search_loc.lower().strip())) |
            (func.lower(RoomModel.area).contains(search_loc.lower().strip()))
        )
        
    if budget is not None:
        query = query.where(RoomModel.rent <= budget)
        
    if availability and availability.strip():
        query = query.where(RoomModel.available_from <= availability.strip())
        
    query = query.where(RoomModel.status == "active")
    query = query.order_by(RoomModel.created_at.desc())
    
    result = await db.execute(query)
    rows = result.all()
    
    if not rows:
        return []
        
    candidate_rooms = [row[0] for row in rows]
    owner_map = {row[0].id: row[1] for row in rows}
    
    # Parse tags
    parsed_tags = None
    if tags and tags.strip():
        parsed_tags = [t.strip() for t in tags.split(",") if t.strip()]
        
    # 2. Semantic matching and AI compatibility score calculation
    from app.services.compatibility_service import CompatibilityService
    comp_service = CompatibilityService()
    
    ranked_results = await comp_service.get_ranked_listings(
        db=db,
        tenant_user=current_user,
        sql_candidate_rooms=candidate_rooms,
        search_description=description,
        preferred_tags=parsed_tags,
        max_budget=budget,
        move_in_date=availability
    )
    
    response_data = []
    # If Pinecone search didn't return matches or compatibility service is disabled, fallback to SQL candidates
    if not ranked_results:
        for r in candidate_rooms:
            owner = owner_map.get(r.id)
            response_data.append(format_room_search_response(r, owner, None))
        return response_data
        
    for item in ranked_results:
        r = item["room"]
        owner = owner_map.get(r.id)
        response_data.append(format_room_search_response(r, owner, item))
        
    return response_data

from uuid import UUID

@router.get("/{room_id}", response_model=RoomSearchOut)
async def get_room(
    room_id: UUID,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details of a single room listing by ID, along with personalized compatibility metrics."""
    query = select(RoomModel, UserModel).join(UserModel, RoomModel.owner_id == UserModel.id).where(RoomModel.id == room_id)
    result = await db.execute(query)
    row = result.first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room listing not found."
        )
    r, owner = row
    
    # Calculate or retrieve compatibility for this specific room and tenant
    from app.services.compatibility_service import CompatibilityService
    comp_service = CompatibilityService()
    
    ranked_results = await comp_service.get_ranked_listings(
        db=db,
        tenant_user=current_user,
        sql_candidate_rooms=[r],
        search_description=None,
        preferred_tags=None,
        max_budget=None,
        move_in_date=None
    )
    
    compatibility_item = None
    if ranked_results:
        compatibility_item = ranked_results[0]
        
    return format_room_search_response(r, owner, compatibility_item)

@router.put("/{room_id}", response_model=RoomOut)
async def update_room(
    room_id: UUID,
    room_in: RoomCreate,
    background_tasks: BackgroundTasks,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing room listing."""
    query = select(RoomModel).where(RoomModel.id == room_id)
    result = await db.execute(query)
    room = result.scalar_one_or_none()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room listing not found."
        )
        
    if current_user.role != "admin" and room.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this listing."
        )
        
    # Update SQL fields
    room.title = room_in.title
    room.description = room_in.description
    room.rent = room_in.rent
    room.deposit = room_in.deposit
    room.location = room_in.location
    room.city = room_in.city
    room.area = room_in.area
    room.room_type = room_in.roomType
    room.furnishing = room_in.furnishing
    room.images = room_in.images
    room.available_from = room_in.availableFrom
    room.amenities = room_in.amenities
    room.floor_area = room_in.floorArea
    room.floor = room_in.floor
    room.total_floors = room_in.totalFloors
    
    # Invalidate compatibility cache for this room in PostgreSQL
    from app.services.compatibility_repository import CompatibilityRepository
    repo = CompatibilityRepository()
    await repo.invalidate_room_cache(db, room_id)
    
    await db.commit()
    await db.refresh(room)
    
    # Schedule background task to update Pinecone vector
    background_tasks.add_task(
        background_index_listing,
        room_id=str(room.id),
        title=room.title,
        description=room.description,
        rent=float(room.rent),
        location=room.location,
        city=room.city,
        area=room.area,
        room_type=room.room_type,
        furnishing=room.furnishing,
        available_from=room.available_from,
        amenities=room.amenities,
        owner_id=str(room.owner_id)
    )
    
    return {
        "id": room.id,
        "title": room.title,
        "description": room.description,
        "rent": float(room.rent),
        "deposit": float(room.deposit),
        "location": room.location,
        "city": room.city,
        "area": room.area,
        "roomType": room.room_type,
        "furnishing": room.furnishing,
        "images": room.images,
        "availableFrom": room.available_from,
        "amenities": room.amenities,
        "ownerId": room.owner_id,
        "status": room.status,
        "views": room.views,
        "saves": room.saves,
        "floorArea": float(room.floor_area) if room.floor_area else None,
        "floor": room.floor,
        "totalFloors": room.total_floors,
        "created_at": room.created_at,
        "updated_at": room.updated_at,
        "ownerName": f"{current_user.first_name} {current_user.last_name}",
        "ownerAvatar": current_user.avatar,
        "ownerRating": float(current_user.rating)
    }

@router.delete("/{room_id}")
async def delete_room(
    room_id: UUID,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a room listing from SQL, the compatibility cache, and Pinecone."""
    query = select(RoomModel).where(RoomModel.id == room_id)
    result = await db.execute(query)
    room = result.scalar_one_or_none()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room listing not found."
        )
        
    if current_user.role != "admin" and room.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this listing."
        )
        
    # Invalidate compatibility cache for this room in PostgreSQL
    from app.services.compatibility_repository import CompatibilityRepository
    repo = CompatibilityRepository()
    await repo.invalidate_room_cache(db, room_id)

    # Best-effort Pinecone deletion with timeout — never block SQL delete on Pinecone failure
    from app.services.pinecone_service import PineconeService
    import logging as _log
    pinecone_service = PineconeService()
    try:
        await asyncio.wait_for(
            asyncio.to_thread(pinecone_service.delete_listing, str(room_id)),
            timeout=5.0
        )
    except Exception as e:
        _log.getLogger(__name__).warning(f"Pinecone vector deletion skipped for room {room_id}: {str(e)}")

    # Delete from SQL
    await db.delete(room)
    await db.commit()

    return None


@router.patch("/{room_id}/status", response_model=RoomOut)
async def update_room_status(
    room_id: UUID,
    status_in: RoomStatusUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a room listing as 'filled' or revert it to 'active'. Filled listings are hidden from search results."""
    if status_in.status not in ["active", "filled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be either 'active' or 'filled'."
        )

    result = await db.execute(select(RoomModel).where(RoomModel.id == room_id))
    room = result.scalar_one_or_none()

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room listing not found."
        )

    if current_user.role != "admin" and room.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this listing's status."
        )

    room.status = status_in.status
    await db.commit()
    await db.refresh(room)

    return {
        "id": room.id,
        "title": room.title,
        "description": room.description,
        "rent": float(room.rent),
        "deposit": float(room.deposit),
        "location": room.location,
        "city": room.city,
        "area": room.area,
        "roomType": room.room_type,
        "furnishing": room.furnishing,
        "images": room.images,
        "availableFrom": room.available_from,
        "amenities": room.amenities,
        "ownerId": room.owner_id,
        "status": room.status,
        "views": room.views,
        "saves": room.saves,
        "floorArea": float(room.floor_area) if room.floor_area else None,
        "floor": room.floor,
        "totalFloors": room.total_floors,
        "created_at": room.created_at,
        "updated_at": room.updated_at,
        "ownerName": f"{current_user.first_name} {current_user.last_name}",
        "ownerAvatar": current_user.avatar,
        "ownerRating": float(current_user.rating)
    }
