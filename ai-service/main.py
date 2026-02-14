from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

from routers import roof_analysis, panel_placement, dust_monitoring, rate_prediction
from services.model_loader import load_all_models


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models on startup"""
    print("[AI] Loading ML models...")
    load_all_models()
    print("[AI] All models loaded successfully")
    yield
    print("[AI] Shutting down AI service")


app = FastAPI(
    title="SmartSolar AI Service",
    description="AI/ML microservice for solar panel analysis, dust prediction, and rate forecasting",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(roof_analysis.router, prefix="/ai", tags=["Roof Analysis"])
app.include_router(panel_placement.router, prefix="/ai", tags=["Panel Placement"])
app.include_router(dust_monitoring.router, prefix="/ai", tags=["Dust Monitoring"])
app.include_router(rate_prediction.router, prefix="/ai", tags=["Rate Prediction"])


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "smartsolar-ai",
        "version": "1.0.0",
    }
