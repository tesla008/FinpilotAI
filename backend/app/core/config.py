"""Central app settings, loaded from environment variables (.env in dev)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"

    # SQLite fallback keeps local dev zero-config; set DATABASE_URL for Postgres.
    database_url: str = "sqlite:///./finpilot.db"

    cors_origins: list[str] = ["http://localhost:5173"]

    # Single-tenant local demo — no users table, so this is the only currency
    # setting in the system (still a setting, not hardcoded, per the brief).
    default_currency: str = "INR"

    # The only secret left after auth removal.
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"

    max_csv_upload_mb: int = 5


@lru_cache
def get_settings() -> Settings:
    return Settings()
