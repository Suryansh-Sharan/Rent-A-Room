import json
import logging
from uuid import UUID
from typing import List, Dict, Any, Optional, Set
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import aliased

from app.database import get_db, AsyncSessionLocal
from app.models import MessageModel, UserModel, RentRequestModel, RoomModel
from app.schemas import MessageOut, ConversationOut
from app.auth.router import get_current_user
from app.auth.utils import decode_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chats", tags=["Chats"])

class ConnectionManager:
    def __init__(self):
        # Maps user_id (UUID) -> set of active WebSockets
        self.active_connections: Dict[UUID, Set[WebSocket]] = {}

    async def connect(self, user_id: UUID, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"WebSocket connected for user {user_id}. Active connections: {len(self.active_connections[user_id])}")

    def disconnect(self, user_id: UUID, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            logger.info(f"WebSocket disconnected for user {user_id}.")

    async def broadcast_to_user(self, user_id: UUID, message: dict):
        if user_id in self.active_connections:
            for connection in list(self.active_connections[user_id]):
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Failed to send WebSocket message to user {user_id}: {str(e)}")
                    # Clean up broken connection
                    self.disconnect(user_id, connection)

manager = ConnectionManager()


async def can_chat(db: AsyncSession, user_a_id: UUID, user_b_id: UUID) -> bool:
    """Verify that user_a and user_b have at least one accepted rent request between them."""
    query = (
        select(RentRequestModel)
        .join(RoomModel, RentRequestModel.room_id == RoomModel.id)
        .where(
            RentRequestModel.status == "accepted",
            (
                (RentRequestModel.tenant_id == user_a_id) & (RoomModel.owner_id == user_b_id)
            ) | (
                (RentRequestModel.tenant_id == user_b_id) & (RoomModel.owner_id == user_a_id)
            )
        )
    )
    result = await db.execute(query)
    return result.scalars().first() is not None


@router.get("/conversations", response_model=List[ConversationOut])
async def get_conversations(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all conversations for the logged-in user where interest request is accepted."""
    TenantUser = aliased(UserModel)
    OwnerUser = aliased(UserModel)

    query = (
        select(RentRequestModel, RoomModel, TenantUser, OwnerUser)
        .join(RoomModel, RentRequestModel.room_id == RoomModel.id)
        .join(TenantUser, RentRequestModel.tenant_id == TenantUser.id)
        .join(OwnerUser, RoomModel.owner_id == OwnerUser.id)
        .where(
            RentRequestModel.status == "accepted",
            (RentRequestModel.tenant_id == current_user.id) | (RoomModel.owner_id == current_user.id)
        )
    )

    result = await db.execute(query)
    out = []

    for req, room, tenant, owner in result:
        # Determine who the other user is
        if current_user.id == tenant.id:
            other_user = owner
        else:
            other_user = tenant

        # Get last message
        msg_query = (
            select(MessageModel)
            .where(
                ((MessageModel.sender_id == current_user.id) & (MessageModel.receiver_id == other_user.id)) |
                ((MessageModel.sender_id == other_user.id) & (MessageModel.receiver_id == current_user.id))
            )
            .order_by(MessageModel.created_at.desc())
            .limit(1)
        )
        msg_result = await db.execute(msg_query)
        last_msg = msg_result.scalars().first()

        # Count unread messages sent by other_user to current_user
        unread_query = (
            select(func.count(MessageModel.id))
            .where(
                MessageModel.sender_id == other_user.id,
                MessageModel.receiver_id == current_user.id,
                MessageModel.read == False
            )
        )
        unread_result = await db.execute(unread_query)
        unread_count = unread_result.scalar() or 0

        last_message_content = last_msg.content if last_msg else (req.message or "No messages yet")
        last_message_time = last_msg.created_at.isoformat() if last_msg else req.updated_at.isoformat()

        # Check online status from manager
        other_online = other_user.id in manager.active_connections

        out.append({
            "id": str(req.id),
            "participantIds": [str(current_user.id), str(other_user.id)],
            "participantNames": [
                f"{current_user.first_name} {current_user.last_name}",
                f"{other_user.first_name} {other_user.last_name}"
            ],
            "participantAvatars": [current_user.avatar, other_user.avatar],
            "lastMessage": last_message_content,
            "lastMessageTime": last_message_time,
            "unreadCount": unread_count,
            "roomId": str(room.id),
            "roomTitle": room.title,
            "online": other_online
        })

    return out


@router.get("/messages/{other_user_id}", response_model=List[MessageOut])
async def get_messages(
    other_user_id: UUID,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve message history between current user and another user."""
    # First, verify that they are allowed to chat (accepted rent request exists)
    allowed = await can_chat(db, current_user.id, other_user_id)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to chat with this user."
        )

    # Mark incoming messages as read
    update_query = (
        select(MessageModel)
        .where(
            MessageModel.sender_id == other_user_id,
            MessageModel.receiver_id == current_user.id,
            MessageModel.read == False
        )
    )
    update_result = await db.execute(update_query)
    unread_messages = update_result.scalars().all()
    if unread_messages:
        for msg in unread_messages:
            msg.read = True
        await db.commit()

    # Fetch all messages between them
    query = (
        select(MessageModel)
        .where(
            ((MessageModel.sender_id == current_user.id) & (MessageModel.receiver_id == other_user_id)) |
            ((MessageModel.sender_id == other_user_id) & (MessageModel.receiver_id == current_user.id))
        )
        .order_by(MessageModel.created_at.asc())
    )
    result = await db.execute(query)
    messages = result.scalars().all()

    return [
        {
            "id": msg.id,
            "senderId": msg.sender_id,
            "receiverId": msg.receiver_id,
            "content": msg.content,
            "read": msg.read,
            "timestamp": msg.created_at.isoformat(),
            "type": "text"
        }
        for msg in messages
    ]


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None):
    """WebSocket endpoint for real-time messaging between tenant and owner."""
    if not token:
        logger.warning("WebSocket connection attempt rejected: missing token.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Authenticate user from token
    payload = decode_access_token(token)
    if not payload:
        logger.warning("WebSocket connection attempt rejected: invalid token.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    email = payload.get("sub")
    if not email:
        logger.warning("WebSocket connection attempt rejected: missing sub claim in token.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Fetch user from DB
    async with AsyncSessionLocal() as db:
        user_result = await db.execute(select(UserModel).where(UserModel.email == email))
        current_user = user_result.scalars().first()

    if not current_user:
        logger.warning(f"WebSocket connection attempt rejected: user {email} not found.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Connect to manager
    await manager.connect(current_user.id, websocket)

    try:
        while True:
            # Wait for incoming messages
            data = await websocket.receive_text()
            try:
                message_json = json.loads(data)
                receiver_id_str = message_json.get("receiver_id")
                content = message_json.get("content")

                if not receiver_id_str or not content:
                    logger.warning("Received invalid WebSocket payload: missing receiver_id or content.")
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Invalid message payload. Must contain receiver_id and content."
                    }))
                    continue

                receiver_id = UUID(receiver_id_str)

                async with AsyncSessionLocal() as db:
                    # Verify chat is permitted
                    allowed = await can_chat(db, current_user.id, receiver_id)
                    if not allowed:
                        logger.warning(f"Chat blocked: user {current_user.id} not authorized to message {receiver_id}.")
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "You are not authorized to chat with this user."
                        }))
                        continue

                    # Persist message to database
                    new_msg = MessageModel(
                        sender_id=current_user.id,
                        receiver_id=receiver_id,
                        content=content.strip(),
                        read=False
                    )
                    db.add(new_msg)
                    await db.commit()
                    await db.refresh(new_msg)

                    # Prepare outgoing payload
                    payload_out = {
                        "id": str(new_msg.id),
                        "senderId": str(new_msg.sender_id),
                        "receiverId": str(new_msg.receiver_id),
                        "content": new_msg.content,
                        "read": new_msg.read,
                        "timestamp": new_msg.created_at.isoformat(),
                        "type": "text"
                    }

                # Broadcast to receiver and to sender (for multi-tab synchronization)
                await manager.broadcast_to_user(receiver_id, payload_out)
                await manager.broadcast_to_user(current_user.id, payload_out)

            except json.JSONDecodeError:
                logger.error("Failed to parse incoming WebSocket message: not valid JSON.")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Message must be a valid JSON string."
                }))
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {str(e)}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": f"Server error handling message: {str(e)}"
                }))

    except WebSocketDisconnect:
        manager.disconnect(current_user.id, websocket)
    except Exception as e:
        logger.error(f"Unexpected error in WebSocket connection for user {current_user.id}: {str(e)}")
        manager.disconnect(current_user.id, websocket)
