import uuid
from sqlalchemy import Column, String, Boolean, Numeric, ARRAY, DateTime, Text, func, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="tenant")
    status = Column(String(20), nullable=False, default="active")
    avatar = Column(Text, default="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg")
    location = Column(String(255), default="")
    bio = Column(Text, default="")
    rating = Column(Numeric(3, 2), default=5.0)
    verified = Column(Boolean, default=False)
    preferences = Column(ARRAY(String), default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    rooms = relationship("RoomModel", back_populates="owner", cascade="all, delete-orphan")

class RoomModel(Base):
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    rent = Column(Numeric(10, 2), nullable=False)
    deposit = Column(Numeric(10, 2), nullable=False)
    location = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    area = Column(String(100), nullable=False)
    room_type = Column(String(50), nullable=False)  # 'single' | 'double' | 'studio' | 'shared' | 'penthouse'
    furnishing = Column(String(50), nullable=False)  # 'furnished' | 'semi-furnished' | 'unfurnished'
    images = Column(ARRAY(String), default=list)
    available_from = Column(String(50), nullable=False)
    amenities = Column(ARRAY(String), default=list)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), nullable=False, default="active")
    views = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    floor_area = Column(Numeric(10, 2), nullable=True)
    floor = Column(Integer, nullable=True)
    total_floors = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("UserModel", back_populates="rooms")


class RentRequestModel(Base):
    __tablename__ = "rent_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # 'pending' | 'accepted' | 'rejected' | 'withdrawn'
    message = Column(Text, nullable=True)
    owner_note = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    room = relationship("RoomModel")
    tenant = relationship("UserModel")


class CompatibilityScoreModel(Base):
    __tablename__ = "compatibility_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    compatibility_score = Column(Integer, nullable=False)
    rule_score = Column(Integer, nullable=False)
    semantic_similarity = Column(Numeric(4, 3), nullable=False)
    llm_response = Column(JSONB, nullable=False)
    cache_version = Column(String(20), nullable=False, default="v1")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("tenant_id", "room_id", name="uq_tenant_room"),
    )


class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("UserModel", foreign_keys=[sender_id])
    receiver = relationship("UserModel", foreign_keys=[receiver_id])


