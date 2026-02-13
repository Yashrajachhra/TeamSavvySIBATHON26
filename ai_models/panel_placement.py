from typing import Dict, List
import math


def suggest_panel_layout(
  latitude: float,
  longitude: float,
  roof_area_m2: float,
  panel_type: str,
  global_horizontal_irradiance_kwh_m2_day: float,
) -> Dict:
  """
  Suggest a simple grid layout based on roof area and irradiance.

  - Assume each panel is ~1.8 m2 and 400 W.
  - Panel count limited by roof area.
  - System size is panel_count * 0.4 kW.
  """
  panel_area = 1.8
  panel_kw = 0.4

  max_panels_from_area = int(roof_area_m2 // panel_area)
  panel_count = max(4, max_panels_from_area // 2)

  # Adjust for panel type efficiency in a simplistic way
  efficiency_factor = {
    "mono": 1.05,
    "poly": 1.0,
    "thinfilm": 0.9,
  }.get(panel_type, 1.0)

  system_size_kw = panel_count * panel_kw * efficiency_factor

  # Annual production: irradiance * 365 * area * panel efficiency factor * derate
  derate = 0.77
  annual_production_kwh = (
    global_horizontal_irradiance_kwh_m2_day
    * 365
    * roof_area_m2
    * 0.19  # nominal module efficiency
    * derate
  )

  # Fake spatial layout: a grid around the centroid
  # These bounds are not geospatially accurate, just good enough for visualization.
  side = int(math.ceil(math.sqrt(panel_count)))
  base_delta = 0.00005
  panel_layout: List[Dict] = []
  idx = 0
  for r in range(side):
    for c in range(side):
      if idx >= panel_count:
        break
      lat_offset = (r - side / 2) * base_delta
      lon_offset = (c - side / 2) * base_delta
      bounds = {
        "lat_min": latitude + lat_offset,
        "lat_max": latitude + lat_offset + base_delta,
        "lon_min": longitude + lon_offset,
        "lon_max": longitude + lon_offset + base_delta,
      }
      panel_layout.append({"id": idx, "bounds": bounds})
      idx += 1

  return {
    "summary": {
      "centroid": [latitude, longitude],
      "panel_count": panel_count,
      "system_size_kw": system_size_kw,
      "annual_production_kwh": annual_production_kwh,
      "irradiance_kwh_m2_day": global_horizontal_irradiance_kwh_m2_day,
    },
    "panel_layout": panel_layout,
  }


