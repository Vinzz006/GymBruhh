from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "GYMBruhh AI Gym & Fitness Companion"
    API_V1_STR: str = "/api"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    DATABASE_URL: str = "sqlite:///./gym_bruhh.db"
    JWT_SECRET: str = "gym_bruhh_super_secure_jwt_secret_key_2026_fitness_ai_token"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: Union[str, List[str]] = "*"
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
