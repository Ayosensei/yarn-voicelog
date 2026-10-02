"""
gemini_service.py - Talks to Google Gemini AI

This is the file that actually calls the Gemini API.
It takes a prompt string and returns the AI's response.
Includes automatic fallback across available Flash models to handle temporary Google demand spikes.
"""

from google import genai

# List of Flash models to try in order of preference.
# If Google has a temporary demand spike on one model (503 UNAVAILABLE),
# the service seamlessly tries the next model in the fallback chain.
CANDIDATE_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
]


def call_gemini(prompt: str, api_key: str) -> dict:
    """
    Send a prompt to Google Gemini and get back a response.
    Includes fallback across Flash models to handle temporary 503 capacity issues.

    Args:
        prompt: The full assembled prompt (from prompt_builder.py).
        api_key: The Gemini API key to use (server key or user's own key).

    Returns:
        A dict with 'processed_text' and 'tokens_used'.
    """
    client = genai.Client(api_key=api_key)

    last_error: Exception | None = None
    for model_name in CANDIDATE_MODELS:
        try:
            print(f"[Gemini Service] Attempting call with model: {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )

            processed_text = response.text or ""
            tokens_used = (
                response.usage_metadata.total_token_count
                if response.usage_metadata
                else None
            )

            print(f"[Gemini Service] Success with model: {model_name}!")
            return {
                "processed_text": processed_text,
                "tokens_used": tokens_used,
            }
        except Exception as e:
            last_error = e
            error_str = str(e)
            print(f"[Gemini Service] Model {model_name} error: {error_str}")
            # If temporary demand spike or rate limit, fall back to next model
            if any(code in error_str for code in ("503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED", "404", "NOT_FOUND")):
                continue
            raise e

    if last_error:
        raise last_error
    raise RuntimeError("No candidate Gemini models were available to process the request.")
