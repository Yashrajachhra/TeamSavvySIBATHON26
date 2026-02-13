import os
import sys
from typing import List, Optional

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure project root (containing ai_models) is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
  sys.path.append(BASE_DIR)

from db import get_db
from services.design_service import compute_design
from services.finance_service import compute_finance
from services.maintenance_service import compute_maintenance


class DesignRequest(BaseModel):
  latitude: float
  longitude: float
  roof_area_m2: float
  panel_type: str
  avg_daily_usage_kwh: float
  tariff_per_kwh: float
  financing_years: int
  interest_rate: float
  last_cleaned_days_ago: int


class ApiResponse(BaseModel):
  summary: dict
  panel_layout: Optional[List[dict]] = None


app = FastAPI(title="SolarSmart Backend", version="0.1.0")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.get("/")
def root():
  return {"status": "ok", "service": "solarsmart-backend"}


@app.post("/design", response_model=ApiResponse)
def design_endpoint(payload: DesignRequest, db=Depends(get_db)):
  """
  Receives rooftop data and returns optimal solar panel placement.
  """
  result = compute_design(payload, db)
  return result


@app.post("/finance", response_model=ApiResponse)
def finance_endpoint(payload: DesignRequest, db=Depends(get_db)):
  """
  Calculates ROI, break-even, and savings for a proposed system.
  """
  result = compute_finance(payload, db)
  return result


@app.post("/maintenance", response_model=ApiResponse)
def maintenance_endpoint(payload: DesignRequest, db=Depends(get_db)):
  """
  Estimates dust / efficiency loss and returns cleaning alerts.
  """
  result = compute_maintenance(payload, db)
  return result


