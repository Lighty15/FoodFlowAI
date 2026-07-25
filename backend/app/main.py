from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.db.session import initialize_database
from backend.app.db import models
from backend.app.db.session import SessionLocal
from backend.app.services import auth_service

# Import routers
from backend.app.api import auth, donations, admin

app = FastAPI(title="FoodFlowAI Backend")





@app.on_event("startup")
async def startup_event():
    initialize_database()

    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(
            models.User.username == "admin"
        ).first()

        if admin is None:
            admin = models.User(
                username="admin",
                hashed_password=auth_service.get_password_hash("adminpass"),
                role="admin",
                is_active=1,
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin created")
        else:
            print("✅ Admin already exists")
    except Exception as e:
        print("❌ Admin creation failed:", e)
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://food-flow-ai-mu.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth")
app.include_router(donations.router, prefix="/api")
app.include_router(admin.router, prefix="/api/admin")

@app.get("/")
async def root():
    return {"message": "FoodFlowAI Backend is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}