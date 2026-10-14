"""
prompt_builder.py - Assembles the AI prompt dynamically for Nigerian university logbooks.

Tailors output based on student training program:
  - SWEP (Part 2 / 200L): 5-6 lines default (~60-90 words). Foundational workshop, safety, bench work, practical exercises.
  - SIWES (Part 3 / 300L): 2-3 lines default (~25-45 words). Compact daily summary, assisting field technicians, maintenance.
  - IT (Part 4 / 400L): 2-4 lines default (~35-55 words). Professional engineering/industry deliverables, technical workflows.

Allows each student to tweak their target physical logbook line count.
"""

PROGRAM_PROFILES = {
    "swep": {
        "title": "SWEP (Students Work Experience Programme - Part 2 / 200L)",
        "default_lines": "5-6 lines",
        "word_budget": "60-90 words",
        "guidance": (
            "Foundational workshop and laboratory training. Focus on practical bench work, "
            "introductory tool handling (lathe, welding, files, meters), workshop safety precautions, "
            "and materials used. Explain the step-by-step practical task completed in the workshop."
        ),
    },
    "siwes": {
        "title": "SIWES (Students Industrial Work Experience Scheme - Part 3 / 300L)",
        "default_lines": "2-3 lines",
        "word_budget": "25-45 words",
        "guidance": (
            "Introductory industrial work experience. Focus on everyday practical duties, routine maintenance, "
            "assisting technicians or supervisors, and equipment handled. Keep it concise, direct, and punchy."
        ),
    },
    "it": {
        "title": "IT (Industrial Training - Part 4 / 400L / 6 Months IT)",
        "default_lines": "2-4 lines",
        "word_budget": "35-55 words",
        "guidance": (
            "Substantial professional industry experience. Focus on real-world engineering/workplace projects, "
            "technical problem-solving, industry-standard tools/workflows, and deliverables. Tone must be "
            "technically rigorous and professional while remaining practical and direct."
        ),
    },
}


def build_prompt(
    raw_transcript: str,
    custom_prompt: str | None = None,
    vocabulary_terms: list[str] | None = None,
    field_of_work: str | None = None,
    training_type: str | None = "siwes",
    log_length_lines: str | None = None,
) -> str:
    """
    Assembles the customized prompt to send to Gemini.

    Args:
        raw_transcript: What the student actually said (the spoken notes).
        custom_prompt: The student's custom instructions (from their settings).
        vocabulary_terms: List of technical terms to preserve (e.g., ["FLIR", "CWSI"]).
        field_of_work: The student's field (e.g., "Mechanical Engineering").
        training_type: Student's program tier ('swep', 'siwes', 'it'). Defaults to 'siwes'.
        log_length_lines: Specific line count constraint (e.g., '2-3', '2-4', '5-6').
                          If None, defaults to the program tier's standard line length.

    Returns:
        A tailored instruction string ready to send to Gemini.
    """
    program_key = (training_type or "siwes").lower().strip()
    profile = PROGRAM_PROFILES.get(program_key, PROGRAM_PROFILES["siwes"])

    target_lines = log_length_lines.strip() if log_length_lines else profile["default_lines"]
    if not target_lines.endswith("lines") and not target_lines.endswith("line"):
        target_lines = f"{target_lines} lines"

    parts = [
        f"You are a logbook assistant for Nigerian university engineering and technology students.",
        f"The student is enrolled in: {profile['title']}.",
        f"\nPROGRAM FOCUS & TONE:\n{profile['guidance']}",
        f"\nPHYSICAL LOGBOOK LINE CONSTRAINT:\n"
        f"- Target length: Exactly {target_lines} of handwriting in the physical logbook.\n"
        f"- Approximate word limit: {profile['word_budget']}.\n"
        f"- Format: Write as either 2-3 concise bullet points or a single compact continuous paragraph that fits directly onto the ruled lines of a daily logbook box.\n"
        f"- IMPORTANT: Do NOT include multi-level markdown headers (e.g., '### Activities Performed', '### Tools Used', '### Challenges') because they waste precious lines in a physical logbook. Keep it ready to copy directly into the logbook lines.",
        f"\nCORE RULES:\n"
        f"- Write in plain, everyday English—a natural mix of practical work notes and largely informal phrasing, exactly like how students write in their physical logbooks.\n"
        f"- Write in past tense, first person ('Assisted with...', 'Checked...', 'We set up...', 'I calibrated...').\n"
        f"- Preserve technical terms and slang terms exactly as spoken.\n"
        f"- Do NOT invent details or activities that were not mentioned.\n"
        f"- If key info is missing, use concise [bracket] placeholders (e.g., [equipment model]).",
    ]

    # Add field of work context (if student set one)
    if field_of_work:
        parts.append(f"\nSTUDENT'S FIELD OF WORK:\n{field_of_work}")

    # Add student's custom instructions (if any)
    if custom_prompt:
        parts.append(f"\nADDITIONAL INSTRUCTIONS FROM STUDENT:\n{custom_prompt}")

    # Inject vocabulary terms so Gemini spells them correctly
    if vocabulary_terms:
        terms_str = ", ".join(vocabulary_terms)
        parts.append(f"\nTECHNICAL TERMS TO PRESERVE EXACTLY:\n{terms_str}")

    # Finally, add the actual spoken notes
    parts.append(f"\n---\nRAW SPOKEN NOTES TO CONVERT:\n{raw_transcript}")

    return "\n".join(parts)
