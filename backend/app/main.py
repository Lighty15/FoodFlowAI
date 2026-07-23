from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.db.database import engine
from backend.app.db.base import Base
from backend.app.db import models

Base.metadata.create_all(bind=engine)

from backend.app.api import auth, donations, admin, users, food, notifications
app = FastAPI(title="FoodFlowAI Backend")

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
app.include_router(users.router, prefix="/api/users")       
@app.get("/")
async def root():
    return {"message": "FoodFlowAI Backend is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}