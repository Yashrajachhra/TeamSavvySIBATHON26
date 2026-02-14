from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    PORT: int = 8000
    ENV: str = "development"
    REDIS_URL: str = "redis://localhost:6379/0"
    NASA_POWER_API_URL: str = "https://power.larc.nasa.gov/api/temporal/monthly/point"
    OPENWEATHER_API_KEY: str = ""
    AQICN_API_KEY: str = ""
    MODEL_DIR: str = "./ml_models/saved"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5000"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
