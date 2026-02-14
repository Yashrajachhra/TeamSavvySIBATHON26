import os
import joblib
import numpy as np
from sklearn.linear_model import LinearRegression

_models = {}


def load_all_models():
    """Load or create all ML models"""
    model_dir = os.getenv("MODEL_DIR", "./ml_models/saved")
    os.makedirs(model_dir, exist_ok=True)

    # Rate prediction model
    rate_model_path = os.path.join(model_dir, "rate_predictor.joblib")
    if os.path.exists(rate_model_path):
        _models["rate_predictor"] = joblib.load(rate_model_path)
    else:
        _models["rate_predictor"] = _train_rate_model(model_dir)

    # Note: Dust prediction uses a physics-based soiling model (see dust_monitoring.py)
    # backed by IEA PVPS Task 13 research — no ML model needed.

    print(f"  [OK] Loaded {len(_models)} model(s)")


def get_model(name: str):
    """Get a loaded model by name"""
    return _models.get(name)


def _train_rate_model(model_dir: str):
    """Train electricity rate prediction model"""
    np.random.seed(42)

    # Historical electricity rates (India, INR/kWh, 2010-2024)
    years = np.array([2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017,
                       2018, 2019, 2020, 2021, 2022, 2023, 2024]).reshape(-1, 1)
    rates = np.array([3.5, 3.8, 4.1, 4.5, 4.9, 5.2, 5.5, 5.8,
                      6.2, 6.5, 6.8, 7.1, 7.5, 7.9, 8.3])

    model = LinearRegression()
    model.fit(years, rates)

    joblib.dump(model, os.path.join(model_dir, "rate_predictor.joblib"))
    print("  [OK] Trained and saved rate prediction model")
    return model
