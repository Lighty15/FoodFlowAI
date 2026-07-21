from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from backend.app.api import donations, auth, admin

app = FastAPI(title="FoodFlowAI Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth")
app.include_router(donations.router, prefix="/api")
app.include_router(admin.router, prefix="/api/admin")


@app.get("/health")
async def health():
    return {"status": "ok"}
