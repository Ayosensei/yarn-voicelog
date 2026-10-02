"""
prompt_builder.py - Assembles the AI prompt dynamically

This is where we build the "instruction manual" that gets sent to Gemini.
Think of it like making a customized sandwich:
  - Bread = Base system prompt (same for everyone)
  - Filling 1 = Student's field-specific instructions
  - Filling 2 = Student's vocabulary terms
  - Filling 3 = The raw spoken notes
"""


# The base system prompt - this is the core instruction for Gemini
BASE_SYSTEM_PROMPT = """You are a logbook assistant for Nigerian SIWES (Student Industrial Work Experience Scheme) students. 
Convert spoken notes into clear, professional logbook entries.

Rules:
- Use basic English. No fancy words or complex grammar.
- Write in past tense, first person ("I did...", "I observed...").
- Be descriptive but concise (150-300 words).
- Structure the output with these sections:
  ### Date & Location
  ### Activities Performed
  ### Tools & Equipment Used
  ### Challenges & Learnings
  ### Next Steps / Remarks
- If information is missing, use [brackets] as placeholders (e.g., [location], [time]).
- Preserve technical terms exactly as spoken.
- Do NOT invent details that were not mentioned.
- Do NOT add opinions or speculation.
- Keep the tone professional but simple, like explaining to a colleague."""


def build_prompt(
    raw_transcript: str,
    custom_prompt: str | None = None,
    vocabulary_terms: list[str] | None = None,
    field_of_work: str | None = None,
) -> str:
    """
    Assembles the full prompt to send to Gemini.

    Args:
        raw_transcript: What the student actually said (the spoken notes).
        custom_prompt: The student's custom instructions (from their settings).
        vocabulary_terms: List of technical terms to preserve (e.g., ["FLIR", "CWSI"]).
        field_of_work: The student's field (e.g., "Mechanical Engineering").

    Returns:
        A single big string ready to send to Gemini.
    """
    parts = [BASE_SYSTEM_PROMPT]

    # Add field of work context (if the student set one)
    if field_of_work:
        parts.append(f"\nSTUDENT'S FIELD OF WORK:\n{field_of_work}")

    # Add the student's custom instructions (if they wrote any in settings)
    if custom_prompt:
        parts.append(f"\nADDITIONAL INSTRUCTIONS FROM STUDENT:\n{custom_prompt}")

    # Inject vocabulary terms so Gemini spells them correctly
    if vocabulary_terms:
        terms_str = ", ".join(vocabulary_terms)
        parts.append(f"\nTECHNICAL TERMS TO PRESERVE EXACTLY:\n{terms_str}")

    # Finally, add the actual spoken notes
    parts.append(f"\n---\nRAW SPOKEN NOTES TO CONVERT:\n{raw_transcript}")

    return "\n".join(parts)
