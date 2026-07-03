import logging
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import RentRequestModel, RoomModel, UserModel, CompatibilityScoreModel
from app.schemas import RentRequestCreate, RentRequestOut, RentRequestUpdateStatus
from app.auth.router import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/requests", tags=["Requests"])


def _build_request_out(req, room, tenant) -> dict:
    return {
        "id": req.id,
        "roomId": req.room_id,
        "tenantId": req.tenant_id,
        "status": req.status,
        "message": req.message,
        "ownerNote": req.owner_note,
        "created_at": req.created_at,
        "updated_at": req.updated_at,
        "roomTitle": room.title,
        "roomImage": room.images[0] if room.images else "",
        "roomLocation": room.location,
        "rent": float(room.rent),
        "compatibilityScore": None,
        "tenantName": f"{tenant.first_name} {tenant.last_name}",
        "tenantAvatar": tenant.avatar
    }


@router.post("", response_model=RentRequestOut, status_code=status.HTTP_201_CREATED)
async def create_request(
    request_in: RentRequestCreate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a request of interest for a specific room listing."""
    if current_user.role != "tenant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tenants can submit room interest requests."
        )

    # Verify room exists and get owner info
    room_result = await db.execute(
        select(RoomModel, UserModel)
        .join(UserModel, RoomModel.owner_id == UserModel.id)
        .where(RoomModel.id == request_in.room_id)
    )
    room_row = room_result.first()
    if not room_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room listing not found."
        )
    room, owner = room_row

    # Check if a request already exists for this tenant and room
    existing_result = await db.execute(
        select(RentRequestModel).where(
            RentRequestModel.room_id == request_in.room_id,
            RentRequestModel.tenant_id == current_user.id
        )
    )
    existing_req = existing_result.scalars().first()
    if existing_req:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a request for this room."
        )

    new_request = RentRequestModel(
        room_id=request_in.room_id,
        tenant_id=current_user.id,
        status="pending",
        message=request_in.message
    )

    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)

    # Check cached compatibility score for this tenant+room pair
    compat_result = await db.execute(
        select(CompatibilityScoreModel).where(
            CompatibilityScoreModel.tenant_id == current_user.id,
            CompatibilityScoreModel.room_id == request_in.room_id
        )
    )
    compat = compat_result.scalars().first()
    compatibility_score = compat.compatibility_score if compat else None

    # Fire email notification if score is high (≥ 80)
    if compatibility_score is not None and compatibility_score >= 80:
        from app.services.email_service import send_owner_interest_notification
        await send_owner_interest_notification(
            owner_email=owner.email,
            owner_name=f"{owner.first_name} {owner.last_name}",
            tenant_name=f"{current_user.first_name} {current_user.last_name}",
            room_title=room.title,
            compatibility_score=compatibility_score,
            message=request_in.message or ""
        )
    else:
        logger.info(
            f"[Requests] Skipping email to owner — score {compatibility_score} < 80 or not cached."
        )

    return {
        "id": new_request.id,
        "roomId": new_request.room_id,
        "tenantId": new_request.tenant_id,
        "status": new_request.status,
        "message": new_request.message,
        "ownerNote": new_request.owner_note,
        "created_at": new_request.created_at,
        "updated_at": new_request.updated_at,
        "roomTitle": room.title,
        "roomImage": room.images[0] if room.images else "",
        "roomLocation": room.location,
        "rent": float(room.rent),
        "compatibilityScore": compatibility_score,
        "tenantName": f"{current_user.first_name} {current_user.last_name}",
        "tenantAvatar": current_user.avatar
    }


@router.get("/tenant", response_model=List[RentRequestOut])
async def get_tenant_requests(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all rent requests submitted by the logged-in tenant."""
    if current_user.role != "tenant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tenants can view tenant requests."
        )

    query = (
        select(RentRequestModel, RoomModel, UserModel)
        .join(RoomModel, RentRequestModel.room_id == RoomModel.id)
        .join(UserModel, RentRequestModel.tenant_id == UserModel.id)
        .where(RentRequestModel.tenant_id == current_user.id)
        .order_by(RentRequestModel.created_at.desc())
    )

    result = await db.execute(query)
    out = []
    for req, room, tenant in result:
        # Lookup cached score
        compat_result = await db.execute(
            select(CompatibilityScoreModel).where(
                CompatibilityScoreModel.tenant_id == current_user.id,
                CompatibilityScoreModel.room_id == req.room_id
            )
        )
        compat = compat_result.scalars().first()

        out.append({
            **_build_request_out(req, room, tenant),
            "compatibilityScore": compat.compatibility_score if compat else None
        })
    return out


@router.get("/owner", response_model=List[RentRequestOut])
async def get_owner_requests(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all rent requests received for rooms owned by the logged-in owner."""
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can view received requests."
        )

    query = (
        select(RentRequestModel, RoomModel, UserModel)
        .join(RoomModel, RentRequestModel.room_id == RoomModel.id)
        .join(UserModel, RentRequestModel.tenant_id == UserModel.id)
        .where(RoomModel.owner_id == current_user.id)
        .order_by(RentRequestModel.created_at.desc())
    )

    result = await db.execute(query)
    out = []
    for req, room, tenant in result:
        # Lookup cached score for this tenant+room
        compat_result = await db.execute(
            select(CompatibilityScoreModel).where(
                CompatibilityScoreModel.tenant_id == req.tenant_id,
                CompatibilityScoreModel.room_id == req.room_id
            )
        )
        compat = compat_result.scalars().first()

        out.append({
            **_build_request_out(req, room, tenant),
            "compatibilityScore": compat.compatibility_score if compat else None
        })
    return out


@router.put("/{request_id}", response_model=RentRequestOut)
async def update_request_status(
    request_id: UUID,
    status_update: RentRequestUpdateStatus,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update status of a rent request (withdraw, accept, or reject)."""
    query = (
        select(RentRequestModel, RoomModel, UserModel)
        .join(RoomModel, RentRequestModel.room_id == RoomModel.id)
        .join(UserModel, RentRequestModel.tenant_id == UserModel.id)
        .where(RentRequestModel.id == request_id)
    )
    result = await db.execute(query)
    row = result.first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rent request not found."
        )
    req, room, tenant = row

    # Authorization checks
    if current_user.role == "tenant":
        if req.tenant_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot modify another tenant's request."
            )
        if status_update.status != "withdrawn":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tenants can only withdraw their requests."
            )
    elif current_user.role in ["owner", "admin"]:
        if room.owner_id != current_user.id and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot modify requests for rooms you do not own."
            )
        if status_update.status not in ["accepted", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Owners can only accept or reject requests."
            )
        if status_update.ownerNote is not None:
            req.owner_note = status_update.ownerNote

    req.status = status_update.status
    await db.commit()
    await db.refresh(req)

    # Send email notification to tenant when owner accepts or rejects
    if status_update.status in ["accepted", "rejected"]:
        from app.services.email_service import send_tenant_status_notification
        await send_tenant_status_notification(
            tenant_email=tenant.email,
            tenant_name=f"{tenant.first_name} {tenant.last_name}",
            room_title=room.title,
            new_status=status_update.status,
            owner_note=status_update.ownerNote or ""
        )

    return {
        "id": req.id,
        "roomId": req.room_id,
        "tenantId": req.tenant_id,
        "status": req.status,
        "message": req.message,
        "ownerNote": req.owner_note,
        "created_at": req.created_at,
        "updated_at": req.updated_at,
        "roomTitle": room.title,
        "roomImage": room.images[0] if room.images else "",
        "roomLocation": room.location,
        "rent": float(room.rent),
        "compatibilityScore": None,
        "tenantName": f"{tenant.first_name} {tenant.last_name}",
        "tenantAvatar": tenant.avatar
    }
