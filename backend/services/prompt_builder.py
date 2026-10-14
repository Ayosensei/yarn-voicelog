"""
prompt_builder.py - Assembles the AI prompt dynamically for Nigerian university logbooks.

Tailors output based on:
  - Student training program:
    * SWEP (Part 2 / 200L): 5-6 lines default (~60-90 words). Foundational workshop, safety, bench work, practical exercises.
    * SIWES (Part 3 / 300L): 2-3 lines default (~25-45 words). Compact daily summary, assisting field technicians, maintenance.
    * IT (Part 4 / 400L): 2-4 lines default (~35-55 words). Professional engineering/industry deliverables, technical workflows.
  - Target physical logbook line count.
  - Personal pronouns ('I' and 'We') rather than impersonal fragments.
  - Grammar level: 'informal' (purely conversational), 'balanced' (standard logbook), 'formal' (academic engineering).
  - Authentic Nigerian English technical workshop lingo.
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

GRAMMAR_PROFILES = {
    "informal": {
        "title": "Purely informal & conversational",
        "guidance": (
            "Write in natural, everyday, conversational student English—the exact relaxed phrasing a student writes "
            "when jotting down their daily activities. Use casual but clear sentence structures (e.g., 'I followed my supervisor to site...', 'We worked on...'). "
            "Avoid overly stiff academic vocabulary."
        ),
    },
    "balanced": {
        "title": "Balanced / Standard student logbook",
        "guidance": (
            "Write in realistic Nigerian student logbook style: a practical blend of technical terminology and natural student voice. "
            "Clear, direct, and practical without bureaucratic fluff."
        ),
    },
    "formal": {
        "title": "Formal & academic",
        "guidance": (
            "Write in structured, grammatically rigorous technical English suitable for formal engineering reports and academic grading. "
            "Use precise verbs and formal syntax while maintaining the line count constraint."
        ),
    },
}

NIGERIAN_LINGO_GUIDANCE = (
    "\nNIGERIAN WORKPLACE & WORKSHOP LINGO (ACTIVE):\n"
    "- Naturally integrate authentic Nigerian technical workshop, industrial training, and site expressions where appropriate:\n"
    "  * 'I followed my supervisor to site...'\n"
    "  * 'We carried out the routine servicing / maintenance of...'\n"
    "  * 'I assisted my technician / senior engineer to troubleshoot...'\n"
    "  * 'We collected tools and materials from the workshop store...'\n"
    "  * 'I took down operating readings...'\n"
    "  * 'We observed the dry run of the equipment...'\n"
    "- Keep the tone natural and authentic to Nigerian university logbooks, never exaggerated or caricatured."
)


def build_prompt(
    raw_transcript: str,
    custom_prompt: str | None = None,
    vocabulary_terms: list[str] | None = None,
    field_of_work: str | None = None,
    department: str | None = None,
    faculty: str | None = None,
    institution: str | None = None,
    student_name: str | None = None,
    training_type: str | None = "siwes",
    log_length_lines: str | None = None,
    grammar_level: str | None = "balanced",
    use_nigerian_lingo: bool | None = True,
) -> str:
    """
    Assembles the customized prompt to send to Gemini.

    Args:
        raw_transcript: What the student actually said (the spoken notes).
        custom_prompt: The student's custom instructions (from their settings).
        vocabulary_terms: List of technical terms to preserve (e.g., ["FLIR", "CWSI"]).
        field_of_work: The student's field/firm (e.g., "Chevron Nigeria / Mechanical Maintenance").
        department: The student's department/course (e.g., "Agricultural and Environmental Engineering").
        faculty: The student's faculty (e.g., "Faculty of Technology").
        institution: The university or polytechnic (e.g., "Obafemi Awolowo University").
        student_name: The student's name for personalize logging context.
        training_type: Student's program tier ('swep', 'siwes', 'it'). Defaults to 'siwes'.
        log_length_lines: Specific line count constraint (e.g., '2-3', '2-4', '5-6').
                          If None, defaults to the program tier's standard line length.
        grammar_level: 'informal', 'balanced', or 'formal'. Defaults to 'balanced'.
        use_nigerian_lingo: Whether to include natural Nigerian workplace expressions. Defaults to True.

    Returns:
        A tailored instruction string ready to send to Gemini.
    """
    program_key = (training_type or "siwes").lower().strip()
    profile = PROGRAM_PROFILES.get(program_key, PROGRAM_PROFILES["siwes"])

    grammar_key = (grammar_level or "balanced").lower().strip()
    grammar_profile = GRAMMAR_PROFILES.get(grammar_key, GRAMMAR_PROFILES["balanced"])

    target_lines = log_length_lines.strip() if log_length_lines else profile["default_lines"]
    if not target_lines.endswith("lines") and not target_lines.endswith("line"):
        target_lines = f"{target_lines} lines"

    parts = [
        f"You are a logbook assistant for Nigerian university students filling out their physical daily logbook.",
        f"The student is enrolled in: {profile['title']}.",
        f"\nPROGRAM FOCUS & CONTEXT:\n{profile['guidance']}",
        f"\nGRAMMAR & TONE STYLE ({grammar_profile['title'].upper()}):\n{grammar_profile['guidance']}",
        f"\nPRONOUN & SENTENCE STRUCTURE RULES (MANDATORY):\n"
        f"- Use complete, natural sentences with first-person personal pronouns ('I' and 'We').\n"
        f"- Use 'I' for individual tasks the student performed personally (e.g., 'I calibrated...', 'I prepared...', 'I operated...').\n"
        f"- Use 'We' for joint tasks, team work, or tasks done alongside instructors, technicians, or supervisors (e.g., 'We inspected...', 'We replaced...', 'We measured...').\n"
        f"- CRITICAL: Do NOT write impersonal fragments starting with bare verbs without pronouns (e.g. NEVER write 'Calibrated the machine...' or 'Checked the oil...'; ALWAYS write 'I calibrated the machine...' or 'We checked the oil...').",
        f"\nPHYSICAL LOGBOOK LINE CONSTRAINT:\n"
        f"- Target length: Exactly {target_lines} of handwriting in the physical logbook.\n"
        f"- Approximate word budget: {profile['word_budget']}.\n"
        f"- Format: Write as either 2-3 concise bullet points or a single compact continuous paragraph that fits directly onto the ruled lines of a daily logbook box.\n"
        f"- IMPORTANT: Do NOT include multi-level markdown headers (e.g., '### Activities Performed', '### Tools Used', '### Challenges') because they waste precious lines in a physical logbook. Keep it ready to copy directly into the logbook lines.",
        f"\nCORE RULES:\n"
        f"- Write in past tense, using personal pronouns 'I' and 'We'.\n"
        f"- Preserve technical terms and equipment names exactly as spoken.\n"
        f"- Do NOT invent details or activities that were not mentioned.\n"
        f"- If key info is missing, use concise [bracket] placeholders (e.g., [equipment model]).",
    ]

    # Add Nigerian English lingo instructions if enabled
    if use_nigerian_lingo is not False:
        parts.append(NIGERIAN_LINGO_GUIDANCE)

    # Add full student academic and placement context for maximum domain accuracy
    student_details = []
    if student_name:
        student_details.append(f"- Student Name: {student_name}")
    if institution:
        student_details.append(f"- Institution / University: {institution}")
    if faculty:
        student_details.append(f"- Faculty: {faculty}")
    if department:
        student_details.append(f"- Department / Discipline: {department}")
    if field_of_work:
        student_details.append(f"- Practical Attachment Firm / Workshop / Specialty: {field_of_work}")

    if student_details:
        parts.append(
            "\nSTUDENT PROFILE & ATTACHMENT CONTEXT (CRITICAL FOR ACCURACY):\n"
            + "\n".join(student_details)
            + "\nUse this context to accurately interpret field-specific terminology, tools, machinery, and daily activities relevant to this discipline and training level."
        )

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
