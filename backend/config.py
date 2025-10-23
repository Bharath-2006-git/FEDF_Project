from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase
    supabase_url: str
    supabase_service_role_key: str
    
    # JWT
    jwt_secret: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Server
    port: int = 5000
    host: str = "0.0.0.0"
    debug: bool = False
    
    class Config:
        # Look for .env in parent directory first, then current directory
        env_file = str(Path(__file__).parent.parent / ".env")
        env_file_encoding = 'utf-8'
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
