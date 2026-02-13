from typing import Dict


def estimate_dust_loss(days_since_cleaning: int, dust_index: float) -> Dict:
  """
  Pure-Python heuristic to estimate efficiency loss due to dust.

  Approximates the old regression:
    loss % ~= days_since_cleaning * 0.15 + dust_index * 12
  and then clamps to [0, 35].
  """
  loss_percent = days_since_cleaning * 0.15 + dust_index * 12.0

  # Clamp to reasonable bounds
  loss_percent = max(0.0, min(loss_percent, 35.0))

  # Simple alert logic
  if loss_percent > 25:
    recommended_action = "Critical: Schedule immediate cleaning."
    next_clean_in_days = 0
  elif loss_percent > 15:
    recommended_action = "High loss: Clean within a week."
    next_clean_in_days = 7
  elif loss_percent > 8:
    recommended_action = "Moderate loss: Plan cleaning this month."
    next_clean_in_days = 30
  else:
    recommended_action = "Low loss: Cleaning can be deferred."
    next_clean_in_days = 45

  return {
    "efficiency_loss_percent": float(loss_percent),
    "recommended_action": recommended_action,
    "next_clean_in_days": next_clean_in_days,
  }


