import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    OPENAI_API_KEY: str = ""
    OPENAI_API_BASE: str = ""
    MODEL_NAME: str = "gpt-4o"
    SMALL_MODEL_NAME: str = "gpt-4o-mini"
    TAVILY_API_KEY: str = ""
    PORT: int = 8000
    HOST: str = "0.0.0.0"

settings = Settings()
