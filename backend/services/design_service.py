from typing import Any, Dict

from pymongo.database import Database

from ai_models.panel_placement import suggest_panel_layout
from .external_apis import fetch_solar_radiation, reverse_geocode


def compute_design(payload, db: Database) -> Dict[str, Any]:
  """
  Compose external solar radiation data with a simple layout suggestion model.
  Persist a design document to MongoDB.
  """
  solar = fetch_solar_radiation(payload.latitude, payload.longitude)
  location = reverse_geocode(payload.latitude, payload.longitude)

  layout = suggest_panel_layout(
    latitude=payload.latitude,
    longitude=payload.longitude,
    roof_area_m2=payload.roof_area_m2,
    panel_type=payload.panel_type,
    global_horizontal_irradiance_kwh_m2_day=solar[
      "global_horizontal_irradiance_kwh_m2_day"
    ],
  )

  doc = {
    "type": "design",
    "input": payload.dict(),
    "location": location,
    "solar": solar,
    "summary": layout["summary"],
    "panel_layout": layout["panel_layout"],
  }
  db.designs.insert_one(doc)

  return {
    "summary": layout["summary"],
    "panel_layout": layout["panel_layout"],
  }


