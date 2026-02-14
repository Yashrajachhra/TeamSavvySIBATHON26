from fastapi import APIRouter
import numpy as np
from services.model_loader import get_model
from schemas.models import RatePredictionRequest

router = APIRouter()


@router.post("/rate-prediction")
async def predict_electricity_rates(request: RatePredictionRequest):
    """Predict electricity rate trends for the next N years"""
    model = get_model("rate_predictor")
    current_year = 2025

    predictions = []
    for year_offset in range(request.years_to_predict + 1):
        year = current_year + year_offset
        if model:
            predicted_rate = float(model.predict(np.array([[year]]))[0])
        else:
            # Fallback: 3% annual increase
            predicted_rate = request.current_rate * (1 + 0.03) ** year_offset

        # Add seasonal variation
        monthly_rates = []
        for month in range(12):
            seasonal_factor = 1.0 + 0.05 * np.sin(2 * np.pi * month / 12)
            monthly_rates.append(round(predicted_rate * seasonal_factor, 2))

        predictions.append({
            "year": year,
            "averageRate": round(predicted_rate, 2),
            "monthlyRates": monthly_rates,
            "yoyChange": round((predicted_rate / (request.current_rate if year_offset == 0 else predictions[-2]["averageRate"]) - 1) * 100, 2) if year_offset > 0 else 0,
        })

    # Calculate cumulative impact
    total_increase = (predictions[-1]["averageRate"] / predictions[0]["averageRate"] - 1) * 100
    avg_annual_increase = total_increase / request.years_to_predict if request.years_to_predict > 0 else 0

    return {
        "success": True,
        "data": {
            "currentRate": request.current_rate,
            "region": request.region,
            "predictions": predictions,
            "summary": {
                "totalIncrease": round(total_increase, 1),
                "averageAnnualIncrease": round(avg_annual_increase, 1),
                "rateIn10Years": predictions[-1]["averageRate"] if predictions else request.current_rate,
                "modelType": "LinearRegression" if model else "fallback",
            },
        },
    }
