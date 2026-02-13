import os
from functools import lru_cache
from typing import Generator

from pymongo import MongoClient
from pymongo.database import Database
from dotenv import load_dotenv

load_dotenv()


class Settings:
  mongodb_uri: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
  mongodb_db_name: str = os.getenv("MONGODB_DB_NAME", "solarsmart")


@lru_cache
def get_settings() -> Settings:
  return Settings()


client: MongoClient | None = None


def get_client() -> MongoClient:
  global client
  if client is None:
    settings = get_settings()
    client = MongoClient(settings.mongodb_uri)
  return client


def get_db() -> Generator[Database, None, None]:
  settings = get_settings()
  db: Database = get_client()[settings.mongodb_db_name]
  try:
    yield db
  finally:
    # Keeping client reused across requests; no teardown needed here.
    pass


