from pydantic import BaseModel, Field
from typing import Optional, List


class RoofAnalysisRequest(BaseModel):
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)
    roof_area: Optional[float] = Field(None, gt=0)
    roof_type: Optional[str] = Field(None, description="flat, gable, hip, shed, mansard, gambrel")


class Obstruction(BaseModel):
    type: str
    area: float
    position: dict


class RoofAnalysisResponse(BaseModel):
    success: bool = True
    data: dict


class PanelPlacementRequest(BaseModel):
    usable_area: float = Field(..., gt=0)
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    roof_tilt: float = Field(default=15, ge=0, le=90)
    roof_orientation: str = Field(default="south")
    panel_wattage: int = Field(default=400, ge=100, le=700)


class PanelPlacementResponse(BaseModel):
    success: bool = True
    data: dict


class DustPredictionRequest(BaseModel):
    lat: float
    lng: float
    days_since_cleaning: int = 15


class CleaningScheduleRequest(BaseModel):
    lat: float
    lng: float
    user_id: Optional[str] = None
    days_since_cleaning: int = 15
    capacity_kw: float = 5.0
    electricity_rate: Optional[float] = Field(None, description="Electricity rate in local currency per kWh. Defaults to region estimate.")
    cleaning_cost: Optional[float] = Field(None, description="Cost per cleaning in local currency. Defaults to region estimate.")


class RatePredictionRequest(BaseModel):
    region: str = "Pakistan"
    current_rate: float = 25.0  # Approx PKR rate
    years_to_predict: int = 10


class SolarIrradianceResponse(BaseModel):
    success: bool = True
    data: dict


class ShadowAnalysisRequest(BaseModel):
    lat: float
    lng: float
    roof_polygon: List[List[float]] = [[0, 0], [1, 0], [1, 1], [0, 1]]
    date: Optional[str] = None
