import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed_service import seed_database_if_empty

# Routers
from app.routers import (
    auth, profile, exercises, workouts,
    nutrition, progress, ai, settings as settings_router
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gym_bruhh")

# Initialize Database Schema & Seed Data
Base.metadata.create_all(bind=engine)
try:
    with SessionLocal() as db:
        seed_database_if_empty(db)
    logger.info("Database initialized & seeded successfully.")
except Exception as e:
    logger.error(f"Database seed initialization error: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS Configuration
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time, 4))
    return response

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(exercises.router, prefix=settings.API_V1_STR)
app.include_router(workouts.router, prefix=settings.API_V1_STR)
app.include_router(nutrition.router, prefix=settings.API_V1_STR)
app.include_router(progress.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "ai_engine": "Gemini API with Fallback Heuristics",
        "database": "Persistent Relational Engine"
    }
