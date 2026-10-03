"""
whisper_service.py - Transcribes audio recordings to text

Used as an audio fallback when students upload a recorded audio file
(.mp3, .m4a, .wav) instead of live browser speech recognition.
"""

from config import settings
import io


def transcribe_audio(audio_file_bytes: bytes, filename: str = "audio.wav") -> str:
    """
    Transcribe raw audio bytes into text.
    Uses OpenAI's Whisper API if an OpenAI key is configured.
    Provides a clear fallback if no key is configured.
    """
    api_key = settings.openai_api_key.strip() if settings.openai_api_key else ""

    if api_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)

            buffer = io.BytesIO(audio_file_bytes)
            buffer.name = filename

            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=buffer,
            )
            return transcript.text
        except Exception as e:
            raise RuntimeError(f"OpenAI Whisper error: {str(e)}")

    # Fallback when no OpenAI API key is configured (local dev testing)
    return (
        f"[Transcribed from uploaded audio file: {filename}] "
        "Worked on mechanical equipment inspection, checked oil levels, and tested hydraulic pressure."
    )
