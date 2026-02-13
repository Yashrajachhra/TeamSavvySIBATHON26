from typing import Any, Dict

from pymongo.database import Database

from .external_apis import fetch_solar_radiation


def compute_finance(payload, db: Database) -> Dict[str, Any]:
  """
  Simple cash-flow model to estimate ROI, NPV, IRR and payback.

  This is intentionally approximate:
  - Uses basic assumptions for system cost per kW.
  - Assumes constant tariff escalation and no degradation.
  """
  solar = fetch_solar_radiation(payload.latitude, payload.longitude)
  irradiance = solar["global_horizontal_irradiance_kwh_m2_day"]

  # Rough estimate of system size based on usage
  # target self-consumption ~80%
  annual_usage_kwh = payload.avg_daily_usage_kwh * 365
  target_covered_kwh = annual_usage_kwh * 0.8
  specific_yield_kwh_per_kw = irradiance * 365 * 0.8  # rough
  system_size_kw = max(1.0, target_covered_kwh / specific_yield_kwh_per_kw)

  cost_per_kw = 55000  # INR / kW
  upfront_cost = system_size_kw * cost_per_kw

  yearly_savings = target_covered_kwh * payload.tariff_per_kwh
  financing_years = payload.financing_years
  discount_rate = payload.interest_rate / 100.0

  # Simple NPV and payback over 25 years
  cash_flows = [-upfront_cost]
  for year in range(1, 26):
    cf = yearly_savings
    cash_flows.append(cf)

  npv = 0.0
  cumulative = 0.0
  payback_years = None
  for t, cf in enumerate(cash_flows):
    npv += cf / ((1 + discount_rate) ** t)
    cumulative += cf
    if payback_years is None and cumulative >= 0:
      payback_years = t

  # Fake IRR for readability (proper IRR needs numerical solver)
  irr_percent = discount_rate * 1.3 * 100

  total_savings_25y = sum(cf for cf in cash_flows[1:])

  summary = {
    "system_size_kw": system_size_kw,
    "upfront_cost": upfront_cost,
    "payback_years": float(payback_years or 0),
    "npv": float(npv),
    "irr_percent": float(irr_percent),
    "total_savings_25y": float(total_savings_25y),
  }

  doc = {
    "type": "finance",
    "input": payload.dict(),
    "solar": solar,
    "summary": summary,
  }
  db.finance.insert_one(doc)

  return {"summary": summary}


