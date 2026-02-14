from fastapi import APIRouter
import numpy as np
import math
import httpx
from schemas.models import PanelPlacementRequest
from config import get_settings

router = APIRouter()


async def fetch_solar_irradiance(lat: float, lng: float) -> dict:
    """Fetch solar irradiance from NASA POWER API or use calculated values"""
    settings = get_settings()

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                settings.NASA_POWER_API_URL,
                params={
                    "parameters": "ALLSKY_SFC_SW_DWN",
                    "community": "RE",
                    "longitude": lng,
                    "latitude": lat,
                    "start": 2020,
                    "end": 2023,
                    "format": "json",
                },
            )
            if response.status_code == 200:
                data = response.json()
                monthly = data.get("properties", {}).get("parameter", {}).get("ALLSKY_SFC_SW_DWN", {})
                if monthly:
                    values = [v for v in monthly.values() if isinstance(v, (int, float)) and v > 0]
                    if values:
                        return {
                            "annualAverage": round(sum(values) / len(values), 2),
                            "monthlyValues": [round(v, 2) for v in values[:12]],
                            "peakSunHours": round(sum(values) / len(values) / 1, 2),
                            "source": "NASA POWER API",
                        }
    except Exception:
        pass

    # Fallback: calculate based on latitude
    base_irradiance = 5.5  # kWh/m²/day global average
    lat_factor = 1.0 - abs(abs(lat) - 25) / 90  # Best at 25° latitude
    annual_avg = base_irradiance * max(0.5, lat_factor) * 1.1

    # Monthly variation (Northern hemisphere pattern)
    monthly_factors = [0.65, 0.75, 0.90, 1.05, 1.20, 1.25, 1.15, 1.10, 1.00, 0.85, 0.70, 0.60]
    if lat < 0:
        monthly_factors = monthly_factors[6:] + monthly_factors[:6]

    monthly_values = [round(annual_avg * f, 2) for f in monthly_factors]

    return {
        "annualAverage": round(annual_avg, 2),
        "monthlyValues": monthly_values,
        "peakSunHours": round(annual_avg, 1),
        "source": "calculated",
    }


def calculate_optimal_angles(lat: float):
    """Calculate optimal tilt and azimuth for solar panels"""
    optimal_tilt = abs(lat) * 0.87 + 3.1  # Validated approximation
    optimal_azimuth = 180 if lat >= 0 else 0  # South in NH, North in SH
    return round(optimal_tilt, 1), optimal_azimuth


def bin_pack_panels(usable_area: float, panel_width: float = 1.0, panel_height: float = 2.0,
                     row_spacing: float = 0.3, col_spacing: float = 0.1):
    """Bin-packing algorithm for panel layout on roof area"""
    # Assume rectangular usable area
    roof_width = math.sqrt(usable_area * 1.5)  # 3:2 aspect ratio
    roof_height = usable_area / roof_width

    effective_panel_w = panel_width + col_spacing
    effective_panel_h = panel_height + row_spacing

    cols = int(roof_width / effective_panel_w)
    rows = int(roof_height / effective_panel_h)

    layout = []
    for r in range(rows):
        for c in range(cols):
            layout.append({
                "row": r,
                "col": c,
                "x": round(c * effective_panel_w, 2),
                "y": round(r * effective_panel_h, 2),
                "width": panel_width,
                "height": panel_height,
                "orientation": "portrait",
            })

    return layout, cols, rows


@router.post("/panel-placement")
async def optimal_panel_placement(request: PanelPlacementRequest):
    """Calculate optimal solar panel placement"""
    irradiance = await fetch_solar_irradiance(request.lat, request.lng)
    optimal_tilt, optimal_azimuth = calculate_optimal_angles(request.lat)

    # Panel dimensions (standard 400W panel)
    panel_width = 1.0  # meters
    panel_height = 2.0  # meters
    panel_area = panel_width * panel_height
    panel_efficiency = 0.21  # 21% efficiency for modern panels

    # Inter-row shading spacing
    tilt_rad = math.radians(optimal_tilt)
    shadow_length = panel_height * math.sin(tilt_rad) / math.tan(math.radians(25))
    row_spacing = max(0.3, shadow_length * 0.5)

    layout, cols, rows = bin_pack_panels(
        request.usable_area, panel_width, panel_height, row_spacing
    )
    panel_count = len(layout)
    total_capacity = panel_count * request.panel_wattage / 1000  # kW

    # Energy production calculation
    peak_sun_hours = irradiance["peakSunHours"]

    # System losses vary based on tilt mismatch, latitude (temperature), and orientation
    inverter_loss = 0.04  # ~4% inverter loss
    wiring_loss = 0.02  # ~2% wiring
    soiling_loss = 0.02 + (0.03 if abs(request.lat) < 30 else 0.01)  # higher dust in tropics
    temp_loss = 0.03 + max(0, (35 - abs(request.lat)) * 0.001)  # hotter regions lose more
    tilt_mismatch = abs(request.roof_tilt - optimal_tilt) / max(optimal_tilt, 1) * 0.03
    total_loss_fraction = min(0.30, inverter_loss + wiring_loss + soiling_loss + temp_loss + tilt_mismatch)
    system_losses = 1.0 - total_loss_fraction
    tilt_factor = 1.0 + 0.05 * (1 - abs(request.roof_tilt - optimal_tilt) / max(optimal_tilt, 1))

    daily_production = total_capacity * peak_sun_hours * system_losses * min(tilt_factor, 1.1)
    annual_production = daily_production * 365

    # 25-year degradation schedule
    degradation = []
    for year in range(1, 26):
        year_efficiency = 100 - year * 0.5
        year_production = annual_production * year_efficiency / 100
        degradation.append({
            "year": year,
            "efficiency": round(year_efficiency, 1),
            "production": round(year_production, 0),
        })

    return {
        "success": True,
        "data": {
            "panelCount": panel_count,
            "panelWattage": request.panel_wattage,
            "totalCapacity": round(total_capacity, 2),
            "optimalTiltAngle": optimal_tilt,
            "actualTiltAngle": request.roof_tilt,
            "optimalAzimuth": optimal_azimuth,
            "estimatedAnnualProduction": round(annual_production, 0),
            "estimatedDailyProduction": round(daily_production, 1),
            "peakSunHours": peak_sun_hours,
            "systemLosses": round((1 - system_losses) * 100, 1),
            "layout": layout,
            "layoutDimensions": {"rows": rows, "cols": cols},
            "interRowSpacing": round(row_spacing, 2),
            "solarIrradiance": irradiance,
            "degradationSchedule": degradation,
        },
    }


@router.get("/solar-irradiance/{lat}/{lng}")
async def get_solar_irradiance(lat: float, lng: float):
    """Get solar irradiance data for a specific location"""
    irradiance = await fetch_solar_irradiance(lat, lng)
    return {"success": True, "data": irradiance}
