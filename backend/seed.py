import asyncio
import os
from sqlalchemy import text
from app.database import AsyncSessionLocal, engine, Base
from app.models import UserModel
from app.auth.utils import get_password_hash

# Mock users data matching frontend/lib/mock/users.ts
MOCK_USERS = [
    {
        "name": "Aryan Singh",
        "email": "aryan@example.com",
        "avatar": "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
        "role": "tenant",
        "status": "active",
        "phone": "+91 98765 43210",
        "location": "Bangalore",
        "bio": "Software engineer at a leading tech firm. Love reading, hiking, and clean workspaces. Vegetarian and non-smoker.",
        "verified": True,
        "preferences": ["WiFi", "Study Friendly", "Quiet Area", "Near Metro", "Non Smoking", "Vegetarian"],
        "rating": 5.0
    },
    {
        "name": "Rajesh Malhotra",
        "email": "rajesh@example.com",
        "avatar": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
        "role": "owner",
        "status": "active",
        "phone": "+91 99887 76655",
        "location": "Mumbai",
        "bio": "Property investor with 12+ years of experience. I maintain all properties to the highest standard.",
        "verified": True,
        "preferences": [],
        "rating": 4.8
    },
    {
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "avatar": "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
        "role": "owner",
        "status": "active",
        "phone": "+91 87654 32109",
        "location": "Bangalore",
        "bio": "I own a few well-maintained apartments in Bangalore. Always available for tenant queries.",
        "verified": True,
        "preferences": [],
        "rating": 4.6
    },
    {
        "name": "Arjun Kapoor",
        "email": "arjun@example.com",
        "avatar": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
        "role": "owner",
        "status": "active",
        "phone": "+91 76543 21098",
        "location": "Mumbai",
        "bio": "Luxury real estate owner. My properties come with premium amenities and exceptional views.",
        "verified": True,
        "preferences": [],
        "rating": 4.9
    },
    {
        "name": "Sunita Verma",
        "email": "sunita@example.com",
        "avatar": "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        "role": "owner",
        "status": "active",
        "phone": "+91 65432 10987",
        "location": "Delhi",
        "bio": "Retired professor renting out a portion of my home. Preference for students and researchers.",
        "verified": True,
        "preferences": [],
        "rating": 4.5
    },
    {
        "name": "Karan Mehta",
        "email": "karan@example.com",
        "avatar": "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg",
        "role": "owner",
        "status": "active",
        "phone": "+91 54321 09876",
        "location": "Bangalore",
        "bio": "Co-living enthusiast building premium shared spaces for young professionals.",
        "verified": False,
        "preferences": [],
        "rating": 4.3
    },
    {
        "name": "Ritu Agarwal",
        "email": "ritu@example.com",
        "avatar": "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg",
        "role": "owner",
        "status": "active",
        "phone": "+91 43210 98765",
        "location": "Delhi",
        "bio": "Heritage property owner in Central Delhi. Passionate about preserving old architecture.",
        "verified": True,
        "preferences": [],
        "rating": 4.7
    },
    {
        "name": "Admin User",
        "email": "admin@airentfinder.com",
        "avatar": "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg",
        "role": "admin",
        "status": "active",
        "phone": "+91 00000 00000",
        "location": "Delhi",
        "bio": "Platform administrator.",
        "verified": True,
        "preferences": [],
        "rating": 5.0
    },
    {
        "name": "Neha Patel",
        "email": "neha@example.com",
        "avatar": "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg",
        "role": "tenant",
        "status": "active",
        "phone": "+91 91234 56789",
        "location": "Pune",
        "bio": "MBA student looking for quiet accommodation near business hubs.",
        "verified": True,
        "preferences": ["WiFi", "Quiet Area", "Study Friendly", "Near Metro", "Non Smoking"],
        "rating": 5.0
    },
    {
        "name": "Vivek Nair",
        "email": "vivek@example.com",
        "avatar": "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg",
        "role": "tenant",
        "status": "pending",
        "phone": "+91 82345 67890",
        "location": "Hyderabad",
        "bio": "Data scientist. Love cooking, cycling, and co-working spaces.",
        "verified": False,
        "preferences": ["WiFi", "Kitchen", "Balcony", "Near Metro", "Pet Friendly"],
        "rating": 5.0
    }
]

async def seed_database():
    print("Connecting to Supabase Database...")
    async with AsyncSessionLocal() as session:
        # Load and run schema.sql
        schema_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")
        if os.path.exists(schema_path):
            print("Reading schema.sql...")
            with open(schema_path, "r") as f:
                schema_sql = f.read()
            
            print("Executing schema.sql on Supabase...")
            # We execute it in chunks separated by semicolons (simple parser)
            statements = schema_sql.split(";")
            for statement in statements:
                stmt_stripped = statement.strip()
                if stmt_stripped:
                    await session.execute(text(stmt_stripped))
            await session.commit()
            print("Schema executed successfully!")
        else:
            print("schema.sql not found, using SQLAlchemy metadata creation...")
            # Alternately create using metadata
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("SQLAlchemy tables created.")

        print("Seeding mock users...")
        demo_password_hash = get_password_hash("demo123")
        
        # Check if users table is empty or check individual users
        added_count = 0
        for user_data in MOCK_USERS:
            # Query if user already exists
            email = user_data["email"]
            res = await session.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email})
            exists = res.fetchone()
            
            if not exists:
                name_parts = user_data["name"].split(" ")
                first_name = name_parts[0]
                last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
                
                # Insert user using raw SQL or Model (using Model is safer)
                new_user = UserModel(
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    phone=user_data["phone"],
                    password_hash=demo_password_hash,
                    role=user_data["role"],
                    status=user_data["status"],
                    avatar=user_data["avatar"],
                    location=user_data["location"],
                    bio=user_data["bio"],
                    rating=user_data["rating"],
                    verified=user_data["verified"],
                    preferences=user_data["preferences"]
                )
                session.add(new_user)
                added_count += 1
        
        if added_count > 0:
            await session.commit()
            print(f"Successfully seeded {added_count} users!")
        else:
            print("Mock users already exist in the database.")
            
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_database())
