"""
encryption.py - Encrypts and decrypts user API keys for BYOK

We use Fernet (symmetric encryption from Python's cryptography library).
The student's key is encrypted before saving to the database,
and only decrypted in memory right before calling Gemini.
"""

from cryptography.fernet import Fernet
from config import settings
import base64
import hashlib


def _get_fernet() -> Fernet:
    """
    Get or create a Fernet instance using settings.fernet_secret_key.
    If no key is configured, derives a stable key so local dev doesn't crash.
    """
    secret = settings.fernet_secret_key.strip() if settings.fernet_secret_key else ""
    if not secret:
        # Default dev seed
        secret = "yarn-voice-logbook-development-secret-key-32b"

    try:
        return Fernet(secret.encode())
    except Exception:
        # If the secret is not a valid 32-byte urlsafe base64 string, derive one safely
        derived = base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest())
        return Fernet(derived)


def encrypt_api_key(plain_key: str) -> str:
    """
    Encrypt a plain text API key.
    Returns the encrypted token as a string.
    """
    if not plain_key:
        return ""
    fernet = _get_fernet()
    encrypted_bytes = fernet.encrypt(plain_key.strip().encode("utf-8"))
    return encrypted_bytes.decode("utf-8")


def decrypt_api_key(encrypted_key: str) -> str:
    """
    Decrypt an encrypted API key token back into plain text.
    Returns the plain text API key.
    """
    if not encrypted_key:
        return ""
    fernet = _get_fernet()
    decrypted_bytes = fernet.decrypt(encrypted_key.strip().encode("utf-8"))
    return decrypted_bytes.decode("utf-8")
