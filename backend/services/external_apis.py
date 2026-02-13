"""
Lightweight wrappers around external APIs (maps, weather/dust, solar radiation).
These are intentionally stubbed with sample data for local development.
Replace URLs and response parsing with your production providers.
"""

from typing import Dict

import requests


def fetch_solar_radiation(latitude: float, longitude: float) -> Dict:
  # Stub: in reality call a solar radiation API (e.g. Solcast, PVGIS).
  # Here we just return a fixed average irradiance.
  return {
    "global_horizontal_irradiance_kwh_m2_day": 5.0,
  }


def fetch_dust_index(latitude: float, longitude: float) -> Dict:
  # Stub: call air quality / dust API (e.g. PM10, AQI).
  return {
    "dust_index": 0.35,  # 0 to 1 scale, 1 being very dusty
  }


def reverse_geocode(latitude: float, longitude: float) -> Dict:
  # Stub: could call OpenStreetMap Nominatim or Google Maps Geocoding.
  return {
    "city": "Sample City",
    "country": "Sample Country",
  }


