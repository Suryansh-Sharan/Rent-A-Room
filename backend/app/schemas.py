from pydantic import BaseModel, EmailStr, Field, computed_field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str = "tenant"
    status: str = "active"
    avatar: Optional[str] = "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg"
    location: Optional[str] = ""
    bio: Optional[str] = ""
    rating: Optional[float] = 5.0
    verified: Optional[bool] = False
    preferences: Optional[List[str]] = Field(default_factory=list)

class UserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    phone: Optional[str] = None
    role: str = "tenant"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserOut(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @computed_field
    @property
    def joinedDate(self) -> str:
        return self.created_at.strftime("%Y-%m-%d")

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    preferences: Optional[List[str]] = None

from decimal import Decimal

class RoomCreate(BaseModel):
    title: str
    description: str
    rent: Decimal
    deposit: Decimal
    location: str
    city: str
    area: str
    roomType: str = Field(alias="roomType")
    furnishing: str
    images: List[str]
    availableFrom: str = Field(alias="availableFrom")
    amenities: List[str]
    floorArea: Optional[Decimal] = Field(default=None, alias="floorArea")
    floor: Optional[int] = None
    totalFloors: Optional[int] = Field(default=None, alias="totalFloors")

    class Config:
        populate_by_name = True

class RoomOut(BaseModel):
    id: UUID
    title: str
    description: str
    rent: float
    deposit: float
    location: str
    city: str
    area: str
    roomType: str = Field(alias="roomType")
    furnishing: str
    images: List[str]
    availableFrom: str = Field(alias="availableFrom")
    amenities: List[str]
    ownerId: UUID = Field(alias="ownerId")
    status: str
    views: int
    saves: int
    floorArea: Optional[float] = Field(default=None, alias="floorArea")
    floor: Optional[int] = None
    totalFloors: Optional[int] = Field(default=None, alias="totalFloors")
    created_at: datetime
    updated_at: datetime
    ownerName: str
    ownerAvatar: str
    ownerRating: float

    @computed_field
    @property
    def postedDate(self) -> str:
        return self.created_at.strftime("%Y-%m-%d")

    class Config:
        from_attributes = True
        populate_by_name = True


class RoomSearchOut(RoomOut):
    compatibility_score: Optional[int] = Field(default=None, alias="compatibilityScore")
    rule_score: Optional[int] = Field(default=None, alias="ruleScore")
    semantic_similarity: Optional[float] = Field(default=None, alias="semanticSimilarity")
    summary: Optional[str] = None
    strengths: Optional[List[str]] = Field(default_factory=list)
    missing_preferences: Optional[List[str]] = Field(default_factory=list, alias="missingPreferences")
    recommendation: Optional[str] = None

    class Config:
        populate_by_name = True


class RentRequestCreate(BaseModel):
    room_id: UUID = Field(alias="roomId")
    message: Optional[str] = None

    class Config:
        populate_by_name = True


class RentRequestUpdateStatus(BaseModel):
    status: str  # 'accepted' | 'rejected' | 'withdrawn'
    ownerNote: Optional[str] = Field(default=None, alias="ownerNote")

    class Config:
        populate_by_name = True


class RentRequestOut(BaseModel):
    id: UUID
    roomId: UUID = Field(alias="roomId")
    tenantId: UUID = Field(alias="tenantId")
    status: str
    message: Optional[str] = None
    ownerNote: Optional[str] = Field(default=None, alias="ownerNote")
    created_at: datetime
    updated_at: datetime
    
    # Extra fields for frontend usage
    roomTitle: str
    roomImage: str
    roomLocation: str
    rent: float
    compatibilityScore: Optional[int] = None
    tenantName: str
    tenantAvatar: str

    @computed_field
    @property
    def updatedAt(self) -> str:
        return self.updated_at.strftime("%Y-%m-%dT%H:%M:%S")

    class Config:
        from_attributes = True
        populate_by_name = True


class MessageOut(BaseModel):
    id: UUID
    senderId: UUID = Field(alias="senderId")
    receiverId: UUID = Field(alias="receiverId")
    content: str
    read: bool
    timestamp: str
    type: str = "text"

    class Config:
        populate_by_name = True


class ConversationOut(BaseModel):
    id: UUID
    participantIds: List[str] = Field(alias="participantIds")
    participantNames: List[str] = Field(alias="participantNames")
    participantAvatars: List[str] = Field(alias="participantAvatars")
    lastMessage: str = Field(alias="lastMessage")
    lastMessageTime: str = Field(alias="lastMessageTime")
    unreadCount: int = Field(alias="unreadCount")
    roomId: Optional[str] = Field(default=None, alias="roomId")
    roomTitle: Optional[str] = Field(default=None, alias="roomTitle")
    online: bool

    class Config:
        populate_by_name = True


class RoomStatusUpdate(BaseModel):
    status: str  # 'active' | 'filled'


