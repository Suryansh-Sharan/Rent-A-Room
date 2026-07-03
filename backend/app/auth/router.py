from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import UserModel
from app.schemas import UserCreate, UserLogin, UserOut, Token
from app.auth.utils import get_password_hash, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_db)
) -> UserModel:
    """Dependency to retrieve the currently logged-in user from the JWT token."""
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    result = await db.execute(select(UserModel).where(UserModel.email == email))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user in the system."""
    # Check if user already exists
    result = await db.execute(select(UserModel).where(UserModel.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Create new user model
    hashed_password = get_password_hash(user_in.password)
    new_user = UserModel(
        email=user_in.email,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        phone=user_in.phone,
        password_hash=hashed_password,
        role=user_in.role,
        status="active",
        verified=False
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login")
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate a user and return a JWT access token along with user details."""
    result = await db.execute(select(UserModel).where(UserModel.email == credentials.email))
    user = result.scalars().first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account has been {user.status}"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user)
    }

@router.get("/me", response_model=UserOut)
async def get_me(current_user: UserModel = Depends(get_current_user)):
    """Get the current authenticated user's details."""
    return current_user

from app.schemas import UserUpdate

@router.put("/me", response_model=UserOut)
async def update_me(
    user_update: UserUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the current authenticated user's profile details."""
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.location is not None:
        current_user.location = user_update.location
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.preferences is not None:
        current_user.preferences = user_update.preferences

    # Invalidate compatibility cache if matching criteria changes
    if (user_update.location is not None or 
        user_update.bio is not None or 
        user_update.preferences is not None):
        from app.services.compatibility_repository import CompatibilityRepository
        repo = CompatibilityRepository()
        await repo.invalidate_tenant_cache(db, current_user.id)

    await db.commit()
    await db.refresh(current_user)
    return current_user

