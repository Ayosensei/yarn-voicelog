"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/lib/api";
import {
  FACULTIES_AND_DEPARTMENTS,
  ALL_FACULTIES,
  getDepartmentsForFaculty,
  findFacultyForDepartment,
} from "@/lib/departments";
import {
  GraduationCap,
  Building2,
  BookOpen,
  Briefcase,
  User,
  Check,
  ArrowRight,
  Sparkles,
  Sliders,
  AlignLeft,
  Languages,
  MessageSquare,
} from "lucide-react";

const PROGRAM_OPTIONS = [
  {
    id: "swep",
    name: "SWEP",
    level: "Part 2 (200L)",
    duration: "8–12 weeks",
    defaultLines: "5-6",
    badge: "Practical & Workshop",
    desc: "Foundational workshop practicals (lathe work, bench fitting, safety rules, welding).",
    preview: {
      informal:
        "• I reported to the mechanical workshop and we collected our mild steel rods from the store.\n• I set up the workpiece on the bench vise and we filed the edges smooth.\n• We used a vernier caliper to check the thickness before calling the technician.",
      balanced:
        "• I attended the workshop safety briefing and we collected our mild steel stock from the store.\n• I operated the manual lathe to turn the workpiece down to 25mm diameter.\n• We checked the finished dimensions against tolerance specs using a vernier caliper.",
      formal:
        "• I completed mandatory workshop safety compliance protocols alongside our training group.\n• I operated the centre lathe to machine a 25mm mild steel cylindrical specimen to specification.\n• We conducted dimensional tolerance verification using a calibrated vernier caliper.",
    },
  },
  {
    id: "siwes",
    name: "SIWES",
    level: "Part 3 (300L)",
    duration: "3 months",
    defaultLines: "2-3",
    badge: "Industry Exposure",
    desc: "Introductory industrial attachment, routine testing, and maintenance routines.",
    preview: {
      informal:
        "• I followed my supervisor to the pump house and we checked the operating pressures.\n• I helped the technician top up lubricating oil and we cleaned up the work area.",
      balanced:
        "• I followed my supervisor to the primary pump house and we logged operating suction pressures.\n• I assisted the senior technician with routine oil lubrication and filter cleaning.",
      formal:
        "• I conducted routine pressure logging on primary centrifugal pumps under senior engineering supervision.\n• We executed preventive lubrication maintenance and verified system operational parameters.",
    },
  },
  {
    id: "it",
    name: "IT",
    level: "Part 4 (400L)",
    duration: "6 months",
    defaultLines: "2-4",
    badge: "Professional Rigor",
    desc: "Substantial industrial training, technical engineering workflows, and system operations.",
    preview: {
      informal:
        "• I checked the cooling tower condenser pipes and we noticed a pressure drop.\n• We carried out the chemical cleaning with the senior engineer and I recorded the new flow readings.",
      balanced:
        "• I inspected the cooling tower condenser loop and we measured pressure differentials using calibrated gauges.\n• We executed the scheduled chemical descaling protocol to restore baseline flow rates.\n• I documented all temperature and pressure parameters in the shift handover logbook.",
      formal:
        "• I diagnosed an abnormal pressure drop across the condenser loop utilizing differential telemetry.\n• We executed an authorized chemical descaling protocol and validated baseline fluid velocity.\n• I prepared the operational performance summary for the engineering shift log.",
    },
  },
];

const GRAMMAR_OPTIONS = [
  {
    id: "informal",
    title: "Purely informal",
    badge: "Everyday student tone",
    desc: "Relaxed, conversational sentences (e.g., 'I followed my supervisor to site and we fixed the valve...').",
  },
  {
    id: "balanced",
    title: "Balanced (Recommended)",
    badge: "Standard logbook",
    desc: "Practical technical terms with natural first-person student voice ('I inspected the pump and we completed the servicing...').",
  },
  {
    id: "formal",
    title: "Formal & academic",
    badge: "Engineering rigor",
    desc: "Strictly structured technical phrasing suitable for official university examination and grading.",
  },
];

const LINE_PRESETS = ["2-3", "2-4", "3-4", "5-6"];

export default function OnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const userUuid = params.uuid;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [faculty, setFaculty] = useState("Faculty of Technology");
  const [department, setDepartment] = useState("Mechanical Engineering");
  const [customDept, setCustomDept] = useState("");
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [trainingType, setTrainingType] = useState("siwes");
  const [logLengthLines, setLogLengthLines] = useState("2-3");
  const [grammarLevel, setGrammarLevel] = useState("balanced");
  const [useNigerianLingo, setUseNigerianLingo] = useState(true);
  const [fieldOfWork, setFieldOfWork] = useState("");
  const [customLines, setCustomLines] = useState("");
  const [isCustomLineMode, setIsCustomLineMode] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      if (!userUuid) return;
      try {
        const user = await getUserProfile(userUuid);
        if (user) {
          if (user.name) setName(user.name);
          if (user.institution) setInstitution(user.institution);
          if (user.faculty) setFaculty(user.faculty);
          if (user.department) {
            const detectedFaculty = findFacultyForDepartment(user.department);
            if (detectedFaculty) {
              setFaculty(detectedFaculty);
              setDepartment(user.department);
              setIsCustomDept(false);
            } else {
              setDepartment("Other");
              setIsCustomDept(true);
              setCustomDept(user.department);
            }
          }
          if (user.training_type) setTrainingType(user.training_type);
          if (user.grammar_level) setGrammarLevel(user.grammar_level);
          if (user.use_nigerian_lingo !== undefined) setUseNigerianLingo(user.use_nigerian_lingo);
          if (user.log_length_lines) {
            setLogLengthLines(user.log_length_lines);
            if (!LINE_PRESETS.includes(user.log_length_lines)) {
              setIsCustomLineMode(true);
              setCustomLines(user.log_length_lines);
            }
          }
          if (user.field_of_work) setFieldOfWork(user.field_of_work);
        }
      } catch (err) {
        console.error("Failed to load user profile in onboarding:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [userUuid]);

  const handleFacultyChange = (newFaculty) => {
    setFaculty(newFaculty);
    const depts = getDepartmentsForFaculty(newFaculty);
    if (depts && depts.length > 0) {
      setDepartment(depts[0]);
      setIsCustomDept(false);
    } else {
      setDepartment("Other");
      setIsCustomDept(true);
    }
  };

  const handleDepartmentChange = (newDept) => {
    if (newDept === "__other__") {
      setIsCustomDept(true);
      setDepartment("__other__");
    } else {
      setIsCustomDept(false);
      setDepartment(newDept);
    }
  };

  const handleProgramSelect = (progId) => {
    setTrainingType(progId);
    const prog = PROGRAM_OPTIONS.find((p) => p.id === progId);
    if (prog) {
      setLogLengthLines(prog.defaultLines);
      setIsCustomLineMode(false);
    }
  };

  const handlePresetSelect = (preset) => {
    setIsCustomLineMode(false);
    setLogLengthLines(preset);
  };

  const handleCustomLineToggle = () => {
    setIsCustomLineMode(true);
    if (!customLines) {
      setCustomLines(logLengthLines || "3-5");
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const effectiveLines = isCustomLineMode
      ? customLines.trim() || logLengthLines
      : logLengthLines;

    const effectiveDept = isCustomDept
      ? customDept.trim() || null
      : department === "__other__"
      ? null
      : department;

    try {
      await updateUserProfile(userUuid, {
        name: name.trim(),
        institution: institution.trim() || null,
        faculty: faculty || null,
        department: effectiveDept,
        training_type: trainingType,
        log_length_lines: effectiveLines,
        grammar_level: grammarLevel,
        use_nigerian_lingo: useNigerianLingo,
        field_of_work: fieldOfWork.trim() || null,
        is_onboarded: true,
      });

      router.replace(`/u/${userUuid}`);
    } catch (err) {
      console.error("Onboarding submission failed:", err);
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    try {
      await updateUserProfile(userUuid, {
        is_onboarded: true,
      });
      router.replace(`/u/${userUuid}`);
    } catch (err) {
      router.replace(`/u/${userUuid}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-[3px] border-accent-600/20 border-t-accent-600 animate-spin" />
      </div>
    );
  }

  const selectedProgramObj =
    PROGRAM_OPTIONS.find((p) => p.id === trainingType) || PROGRAM_OPTIONS[1];

  const currentPreviewText =
    selectedProgramObj.preview[grammarLevel] || selectedProgramObj.preview["balanced"];

  const currentAvailableDepts = getDepartmentsForFaculty(faculty);

  return (
    <div className="min-h-screen bg-background py-8 px-gutter">
      <main className="w-full max-w-[640px] mx-auto flex flex-col gap-6">
        
        {/* Brand Header */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-600" />
              <span className="font-heading text-[17px] font-semibold text-ink-900 tracking-tight lowercase">
                yarn
              </span>
            </div>
            <span className="text-caption font-caption-medium px-2.5 py-1 rounded-full bg-accent-50 text-accent-700">
              Student setup
            </span>
          </div>
          <h1 className="font-title text-title font-semibold text-ink-900 tracking-tight mt-2">
            Tailor Yarn to your logbook
          </h1>
          <p className="font-body text-body text-ink-600">
            Tell us about your university, program, and preferred writing style.
            Yarn will generate daily entries using personal sentences with "I" and "We"
            fitting your paper lines.
          </p>
        </header>

        {/* Main Onboarding Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Card 1: Student Information */}
          <section className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)] flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
                <User size={18} />
              </div>
              <h2 className="font-subheading text-subheading font-semibold text-ink-900">
                Student details
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ob-name"
                  className="font-small-medium text-small font-medium text-ink-900"
                >
                  Full name <span className="text-danger">*</span>
                </label>
                <input
                  id="ob-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Babatunde Adeyemi"
                  className="h-[48px] w-full px-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all placeholder:text-ink-400"
                />
              </div>

              {/* Institution */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ob-institution"
                  className="font-small-medium text-small font-medium text-ink-900"
                >
                  Institution / University
                </label>
                <input
                  id="ob-institution"
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. FUTA, UNILAG, OAU, UNIBEN"
                  className="h-[48px] w-full px-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all placeholder:text-ink-400"
                />
              </div>

              {/* Faculty Selector */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ob-faculty"
                  className="font-small-medium text-small font-medium text-ink-900"
                >
                  Faculty / School
                </label>
                <select
                  id="ob-faculty"
                  value={faculty}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  className="h-[48px] w-full px-3 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all"
                >
                  {ALL_FACULTIES.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                  <option value="Other Faculty">Other Faculty</option>
                </select>
              </div>

              {/* Department Selector */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ob-dept"
                  className="font-small-medium text-small font-medium text-ink-900"
                >
                  Department / Course
                </label>
                <select
                  id="ob-dept"
                  value={isCustomDept ? "__other__" : department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="h-[48px] w-full px-3 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all"
                >
                  {currentAvailableDepts.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="__other__">Other / Department not listed</option>
                </select>
              </div>

              {/* Custom Department input if chosen or not in list */}
              {isCustomDept && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <label
                    htmlFor="ob-custom-dept"
                    className="font-small-medium text-small font-medium text-ink-900"
                  >
                    Specify your department
                  </label>
                  <input
                    id="ob-custom-dept"
                    type="text"
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                    placeholder="e.g. Metallurgical and Materials Engineering"
                    className="h-[48px] w-full px-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all placeholder:text-ink-400"
                  />
                </div>
              )}

              {/* Placement focus / Field of Work */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ob-field"
                  className="font-small-medium text-small font-medium text-ink-900"
                >
                  Placement focus / Work unit
                </label>
                <input
                  id="ob-field"
                  type="text"
                  value={fieldOfWork}
                  onChange={(e) => setFieldOfWork(e.target.value)}
                  placeholder="e.g. Pump maintenance, road construction, crop imaging"
                  className="h-[48px] w-full px-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all placeholder:text-ink-400"
                />
                <span className="text-[12px] text-ink-600 font-caption">
                  Helps Yarn recognize technical equipment and workshop jargon in your recordings.
                </span>
              </div>
            </div>
          </section>

          {/* Card 2: Training Program Level */}
          <section className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
                  <GraduationCap size={18} />
                </div>
                <h2 className="font-subheading text-subheading font-semibold text-ink-900">
                  Training program
                </h2>
              </div>
              <span className="text-caption text-ink-600 font-caption">
                Select your level
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PROGRAM_OPTIONS.map((prog) => {
                const isSelected = trainingType === prog.id;
                return (
                  <button
                    key={prog.id}
                    type="button"
                    onClick={() => handleProgramSelect(prog.id)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-[0.99] cursor-pointer ${
                      isSelected
                        ? "border-accent-600 bg-accent-50/50 shadow-sm ring-1 ring-accent-600/30"
                        : "border-border hover:border-ink-400 bg-surface"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-subheading text-subheading font-semibold text-ink-900">
                          {prog.name}
                        </span>
                        <span
                          className={`text-[11px] font-caption-medium px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-accent-600 text-white font-medium"
                              : "bg-surface-muted text-ink-600"
                          }`}
                        >
                          {prog.level.split(" ")[0]}
                        </span>
                      </div>
                      <div className="text-[12px] font-caption text-ink-600 mb-2">
                        {prog.duration} • {prog.defaultLines} lines
                      </div>
                      <p className="text-[12px] font-caption text-ink-600 leading-snug line-clamp-3">
                        {prog.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[11px] font-caption-medium text-ink-500 uppercase tracking-wide">
                        {prog.badge}
                      </span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-accent-600 text-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-border-strong" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Card 3: Grammar Style & Nigerian Workplace Lingo */}
          <section className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
                  <Languages size={18} />
                </div>
                <div>
                  <h2 className="font-subheading text-subheading font-semibold text-ink-900">
                    Grammar level & phrasing
                  </h2>
                </div>
              </div>
              <span className="text-caption font-caption-medium px-2 py-0.5 rounded-md bg-accent-50 text-accent-700">
                Uses "I" & "We"
              </span>
            </div>

            <p className="font-small text-small text-ink-600">
              Choose how formal or conversational you want your logbook entries to be.
            </p>

            {/* Grammar Level Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {GRAMMAR_OPTIONS.map((g) => {
                const isSelected = grammarLevel === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGrammarLevel(g.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-accent-600 bg-accent-50/50 ring-1 ring-accent-600/30"
                        : "border-border bg-surface hover:border-ink-400"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-small-medium text-small font-semibold text-ink-900">
                          {g.title}
                        </span>
                        {isSelected && <Check size={14} className="text-accent-600" />}
                      </div>
                      <p className="text-[12px] font-caption text-ink-600 leading-snug">
                        {g.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Nigerian English Workplace Lingo Toggle */}
            <div className="pt-2 border-t border-border/70 flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-small-medium text-small font-medium text-ink-900">
                  Nigerian workshop & site lingo
                </span>
                <span className="text-[12px] font-caption text-ink-600 leading-snug">
                  Naturally include authentic expressions like "followed supervisor to site", "carried out routine servicing", and "collected tools from store".
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={useNigerianLingo}
                  onChange={(e) => setUseNigerianLingo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
              </label>
            </div>
          </section>

          {/* Card 4: Logbook Physical Space & Line Length Constraint */}
          <section className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
                  <AlignLeft size={18} />
                </div>
                <div>
                  <h2 className="font-subheading text-subheading font-semibold text-ink-900">
                    Physical logbook space
                  </h2>
                </div>
              </div>
              <span className="text-caption font-caption-medium px-2 py-0.5 rounded-md bg-surface-muted text-ink-700">
                {isCustomLineMode ? `${customLines || "custom"} lines` : `${logLengthLines} lines`}
              </span>
            </div>

            <p className="font-small text-small text-ink-600">
              How many blank lines does your paper logbook have per day? Yarn will
              strictly fit the AI output into this space so you never run out of room.
            </p>

            {/* Preset chips */}
            <div className="flex flex-wrap items-center gap-2">
              {LINE_PRESETS.map((preset) => {
                const isSelected = !isCustomLineMode && logLengthLines === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-3.5 py-2 rounded-xl text-small font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "border-accent-600 bg-accent-600 text-white shadow-sm"
                        : "border-border bg-surface text-ink-800 hover:border-ink-400"
                    }`}
                  >
                    {preset} lines
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleCustomLineToggle}
                className={`px-3.5 py-2 rounded-xl text-small font-medium border transition-all cursor-pointer ${
                  isCustomLineMode
                    ? "border-accent-600 bg-accent-600 text-white shadow-sm"
                    : "border-border bg-surface text-ink-800 hover:border-ink-400"
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Line Input */}
            {isCustomLineMode && (
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="text"
                  value={customLines}
                  onChange={(e) => setCustomLines(e.target.value)}
                  placeholder="e.g. 4-5 lines or 7 lines"
                  className="h-[44px] max-w-[200px] px-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all"
                />
                <span className="font-caption text-caption text-ink-600">
                  Target lines per weekday
                </span>
              </div>
            )}

            {/* Live Paper Logbook Preview Box with Pronouns */}
            <div className="mt-1 p-4 rounded-xl bg-[#FCFCFD] border border-border flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-caption font-caption-medium text-ink-500 uppercase tracking-wide">
                <span>Sample paper logbook output preview</span>
                <span className="text-accent-600 font-semibold">
                  {selectedProgramObj.name} • {grammarLevel} • {isCustomLineMode ? customLines || "custom" : logLengthLines} lines
                </span>
              </div>
              <div className="font-reading text-[13.5px] text-ink-800 leading-[22px] whitespace-pre-line bg-surface p-3.5 rounded-lg border border-border/80 font-mono">
                {currentPreviewText}
              </div>
              <span className="text-[11px] text-ink-500 font-caption">
                Uses active personal sentences with "I" and "We" ready to write into your paper booklet.
              </span>
            </div>
          </section>

          {/* Action Button & Skip */}
          <div className="flex flex-col gap-3 pt-2 pb-8">
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full h-[52px] rounded-xl bg-accent-600 hover:bg-accent-700 active:scale-[0.99] text-white font-subheading text-subheading font-medium flex items-center justify-center gap-2 transition-all shadow-[0_1px_2px_rgba(79,70,229,0.25)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <span>Save and continue to dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={submitting}
              className="py-2.5 text-center text-small font-medium text-ink-600 hover:text-ink-900 transition-colors cursor-pointer"
            >
              Skip setup for now
            </button>
          </div>
        </form>

      </main>
    </div>
  );
}
