"""
config.py - Loads environment variables from .env file

Think of this as the "settings page" for our backend.
Instead of typing API keys directly in our code (dangerous!),
we read them from the .env file.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Each variable here maps to a line in the .env file.
    Example: GEMINI_API_KEY in .env -> settings.gemini_api_key in Python
    """

    # Google Gemini AI
    gemini_api_key: str = ""

    # Supabase Database (Femi will provide these later)
    supabase_url: str = ""
    supabase_key: str = ""

    # OpenAI Whisper (optional, for audio transcription fallback)
    openai_api_key: str = ""

    # Fernet encryption key (for encrypting user-provided API keys)
    fernet_secret_key: str = ""

    class Config:
        env_file = ".env"          # Tells Pydantic: "read from the .env file"
        env_file_encoding = "utf-8"


# Create one instance that the whole app can import and use
settings = Settings()
