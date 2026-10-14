"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Chip from "@/components/Chip";
import Toast from "@/components/Toast";
import {
  getUserProfile,
  updateUserProfile,
  getUserVocabulary,
  addVocabularyTerm,
  deleteVocabularyTerm,
} from "@/lib/api";
import {
  ALL_FACULTIES,
  getDepartmentsForFaculty,
  findFacultyForDepartment,
} from "@/lib/departments";
import {
  User,
  PenLine,
  BookOpen,
  KeyRound,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Save,
  AlertTriangle,
  Info,
  RefreshCw,
  Lock,
  GraduationCap,
  Sliders,
  Languages,
  Sparkles,
} from "lucide-react";

const PROGRAM_OPTIONS = [
  {
    id: "swep",
    name: "SWEP",
    level: "Part 2 (200L)",
    duration: "8–12 weeks",
    defaultLines: "5-6",
    desc: "Foundational workshop practicals (lathe, bench work, safety rules).",
  },
  {
    id: "siwes",
    name: "SIWES",
    level: "Part 3 (300L)",
    duration: "3 months",
    defaultLines: "2-3",
    desc: "Introductory industrial exposure & routine field duties.",
  },
  {
    id: "it",
    name: "IT",
    level: "Part 4 (400L)",
    duration: "6 months",
    defaultLines: "2-4",
    desc: "Substantial professional experience & engineering workflows.",
  },
];

const GRAMMAR_OPTIONS = [
  {
    id: "informal",
    title: "Purely informal",
    badge: "Student conversational",
    desc: "Relaxed sentences in active first-person (e.g. 'I followed my supervisor to site and we fixed the valve...').",
  },
  {
    id: "balanced",
    title: "Balanced (Recommended)",
    badge: "Standard logbook",
    desc: "Practical technical terms with natural 'I' and 'We' sentences ('I inspected the pump and we completed the servicing...').",
  },
  {
    id: "formal",
    title: "Formal & academic",
    badge: "Engineering rigor",
    desc: "Rigorous technical phrasing suitable for official university examination and faculty grading.",
  },
];

const LINE_PRESETS = ["2-3", "2-4", "3-4", "5-6"];

export default function SettingsPage() {
  const params = useParams();
  const userUuid = params.uuid;

  const [profile, setProfile] = useState({
    name: "",
    faculty: "Faculty of Technology",
    department: "",
    institution: "",
    field_of_work: "",
    training_type: "siwes",
    log_length_lines: "2-3",
    grammar_level: "balanced",
    use_nigerian_lingo: true,
    custom_prompt: "",
  });
  const [customDept, setCustomDept] = useState("");
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [vocabulary, setVocabulary] = useState([]);
  const [newTerm, setNewTerm] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const defaultPrompt =
    "Focus on experimental setup, crop conditions and equipment calibration. Always include ambient temperature, humidity and number of samples. Keep the tone professional but simple.";

  useEffect(() => {
    async function loadSettings() {
      try {
        const [profData, vocabData] = await Promise.all([
          getUserProfile(userUuid),
          getUserVocabulary(userUuid),
        ]);
        const userFaculty =
          profData?.faculty ||
          (profData?.department ? findFacultyForDepartment(profData.department) : "Faculty of Technology") ||
          "Faculty of Technology";
        let userDept = profData?.department || "";
        let isCustom = false;
        let customVal = "";

        if (userDept) {
          const foundFac = findFacultyForDepartment(userDept);
          if (foundFac) {
            // Valid recognized department
          } else {
            isCustom = true;
            customVal = userDept;
            userDept = "__other__";
          }
        }

        setProfile({
          name: profData?.name || "",
          faculty: userFaculty,
          department: userDept,
          institution: profData?.institution || "",
          field_of_work: profData?.field_of_work || "",
          training_type: profData?.training_type || "siwes",
          log_length_lines: profData?.log_length_lines || "2-3",
          grammar_level: profData?.grammar_level || "balanced",
          use_nigerian_lingo: profData?.use_nigerian_lingo !== undefined ? profData.use_nigerian_lingo : true,
          custom_prompt: profData?.custom_prompt || "",
        });
        if (isCustom) {
          setIsCustomDept(true);
          setCustomDept(customVal);
        }
        setVocabulary(vocabData || []);
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [userUuid]);

  const handleFacultyChange = (newFaculty) => {
    const depts = getDepartmentsForFaculty(newFaculty);
    const firstDept = depts && depts.length > 0 ? depts[0] : "__other__";
    setProfile((prev) => ({
      ...prev,
      faculty: newFaculty,
      department: firstDept,
    }));
    if (firstDept === "__other__") {
      setIsCustomDept(true);
    } else {
      setIsCustomDept(false);
    }
  };

  const handleDepartmentChange = (newDept) => {
    if (newDept === "__other__") {
      setIsCustomDept(true);
      setProfile((prev) => ({ ...prev, department: "__other__" }));
    } else {
      setIsCustomDept(false);
      setProfile((prev) => ({ ...prev, department: newDept }));
    }
  };

  // Handle Adding Vocabulary Term
  const handleAddTerm = async (e) => {
    e?.preventDefault();
    if (!newTerm.trim()) return;

    try {
      const added = await addVocabularyTerm({
        user_id: userUuid,
        term: newTerm.trim(),
        context: profile.field_of_work,
      });
      setVocabulary((prev) => [...prev, added]);
      setNewTerm("");
      setToastMessage(`Term "${added.term}" added.`);
    } catch (err) {
      setToastMessage("Could not add term.");
    }
  };

  // Handle Removing Vocabulary Term
  const handleRemoveTerm = async (id) => {
    try {
      await deleteVocabularyTerm(id);
      setVocabulary((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setToastMessage("Could not remove term.");
    }
  };

  // Reset custom prompt to default template
  const handleResetPrompt = () => {
    setProfile((prev) => ({ ...prev, custom_prompt: defaultPrompt }));
    setToastMessage("Reset writing style to default.");
  };

  // Copy secret Yarn access link
  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://yarn.ng";
    const link = `${origin}/u/${userUuid}`;
    navigator.clipboard?.writeText(link).then(() => {
      setCopiedLink(true);
      setToastMessage("Yarn link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Save Settings
  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);

    const effectiveDept = isCustomDept
      ? customDept.trim() || null
      : profile.department === "__other__"
      ? null
      : profile.department;

    try {
      await updateUserProfile(userUuid, {
        name: profile.name,
        faculty: profile.faculty || null,
        department: effectiveDept,
        institution: profile.institution,
        field_of_work: profile.field_of_work,
        training_type: profile.training_type || "siwes",
        log_length_lines: profile.log_length_lines || "2-3",
        grammar_level: profile.grammar_level || "balanced",
        use_nigerian_lingo: profile.use_nigerian_lingo !== undefined ? profile.use_nigerian_lingo : true,
        custom_prompt: profile.custom_prompt,
        api_key: apiKey ? apiKey.trim() : undefined,
      });
      setToastMessage("Settings updated successfully!");
    } catch (err) {
      setToastMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectProgram = (progId) => {
    const selectedProg = PROGRAM_OPTIONS.find((p) => p.id === progId);
    setProfile((prev) => ({
      ...prev,
      training_type: progId,
      log_length_lines: selectedProg ? selectedProg.defaultLines : prev.log_length_lines,
    }));
  };

  const handleSelectLinePreset = (preset) => {
    setProfile((prev) => ({
      ...prev,
      log_length_lines: preset,
    }));
  };

  if (loading) {
    return (
      <>
        <Navbar userUuid={userUuid} title="Settings" />
        <main className="w-full max-w-[640px] mx-auto px-gutter pt-4 pb-28 flex flex-col flex-1">
          <div className="w-full h-80 rounded-xl skeleton-shimmer" />
        </main>
      </>
    );
  }

  const shareableUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${userUuid}`
      : `https://yarn.ng/u/${userUuid}`;

  return (
    <>
      <Navbar userUuid={userUuid} title="Settings" />

      <main className="flex-1 flex flex-col w-full max-w-[640px] mx-auto pt-2 pb-32 px-gutter">
        {/* Page Title & Status */}
        <div className="pt-2 pb-5 flex items-center justify-between">
          <h1 className="font-title text-title text-ink-900 tracking-tight font-semibold">
            Settings
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-bg border border-success-border text-success font-caption-medium text-caption select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
            Synced
          </span>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Card 1: Profile */}
          <section className="bg-surface rounded-xl border border-border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col gap-4">
            <header className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-50 flex items-center justify-center shrink-0 text-accent-600">
                <User size={20} />
              </div>
              <div className="flex flex-col">
                <h2 className="font-heading text-heading text-ink-900 font-semibold">Profile</h2>
                <p className="font-small text-small text-ink-600">
                  Manage your personal details for generated entries.
                </p>
              </div>
            </header>

            <div className="flex flex-col gap-4 mt-1">
              <div className="flex flex-col gap-1.5">
                <label className="font-small-medium text-small text-ink-900 font-medium" htmlFor="profile-name">
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={profile.name || ""}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                  className="h-[52px] w-full px-4 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-small-medium text-small text-ink-900 font-medium" htmlFor="profile-faculty">
                    Faculty
                  </label>
                  <select
                    id="profile-faculty"
                    value={profile.faculty || "Faculty of Technology"}
                    onChange={(e) => handleFacultyChange(e.target.value)}
                    className="h-[52px] w-full px-4 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all cursor-pointer"
                  >
                    {ALL_FACULTIES.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-small-medium text-small text-ink-900 font-medium" htmlFor="profile-dept">
                    Department
                  </label>
                  <select
                    id="profile-dept"
                    value={isCustomDept ? "__other__" : profile.department || ""}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="h-[52px] w-full px-4 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all cursor-pointer"
                  >
                    {getDepartmentsForFaculty(profile.faculty || "Faculty of Technology").map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                    <option value="__other__">Other / Department not listed</option>
                  </select>
                </div>
              </div>

              {isCustomDept && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-small-medium text-small text-ink-900 font-medium" htmlFor="custom-dept">
                    Specify department name
                  </label>
                  <input
                    id="custom-dept"
                    type="text"
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                    placeholder="Enter full department name"
                    className="h-[52px] w-full px-4 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="font-small-medium text-small text-ink-900 font-medium" htmlFor="profile-institution">
                  Institution
                </label>
                <input
                  id="profile-institution"
                  type="text"
                  value={profile.institution || ""}
                  onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                  placeholder="e.g. FUTA, UNILAG, OAU, UNIBEN"
                  className="h-[52px] w-full px-4 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-small-medium text-small text-ink-900 font-medium" htmlFor="profile-field">
                  Field of work
                </label>
                <textarea
                  id="profile-field"
                  rows={2}
                  value={profile.field_of_work || ""}
                  onChange={(e) => setProfile({ ...profile, field_of_work: e.target.value })}
                  placeholder="e.g. Thermal imaging in agriculture, or backend development"
                  className="min-h-[80px] w-full p-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 resize-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Card 2: Training Program & Logbook Format */}
          <section className="bg-surface rounded-xl border border-border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col gap-4">
            <header className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-50 flex items-center justify-center shrink-0 text-accent-600">
                <GraduationCap size={20} />
              </div>
              <div className="flex flex-col">
                <h2 className="font-heading text-heading text-ink-900 font-semibold">
                  Training program & Logbook format
                </h2>
                <p className="font-small text-small text-ink-600">
                  Select your program stage and customize your physical logbook line constraints.
                </p>
              </div>
            </header>

            {/* Program Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PROGRAM_OPTIONS.map((prog) => {
                const isSelected = (profile.training_type || "siwes").toLowerCase() === prog.id;
                return (
                  <button
                    key={prog.id}
                    type="button"
                    onClick={() => handleSelectProgram(prog.id)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-[0.99] ${
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
                              ? "bg-accent-600 text-surface"
                              : "bg-surface-muted text-ink-600 border border-border"
                          }`}
                        >
                          {prog.level}
                        </span>
                      </div>
                      <p className="text-caption text-ink-600 leading-snug line-clamp-2">
                        {prog.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-border/70 flex items-center justify-between text-caption font-medium">
                      <span className="text-ink-600">Duration: {prog.duration}</span>
                      <span className="text-accent-700 font-semibold">{prog.defaultLines} lines</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Line Length Tweaker */}
            <div className="mt-2 pt-3 border-t border-border flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="font-small-medium text-small text-ink-900 font-medium flex items-center gap-1.5">
                  <Sliders size={16} className="text-accent-600" />
                  <span>Physical logbook lines per day</span>
                </label>
                <span className="text-caption font-caption-medium text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full border border-accent-200">
                  Target: {profile.log_length_lines || "2-3"} lines
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {LINE_PRESETS.map((preset) => {
                  const isPresetActive = (profile.log_length_lines || "").trim() === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectLinePreset(preset)}
                      className={`px-3 py-1.5 rounded-lg text-small font-small-medium transition-all ${
                        isPresetActive
                          ? "bg-accent-600 text-surface shadow-sm font-semibold"
                          : "bg-surface-muted border border-border text-ink-700 hover:border-ink-400"
                      }`}
                    >
                      {preset} lines
                    </button>
                  );
                })}

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-caption text-ink-600">Custom:</span>
                  <input
                    type="text"
                    aria-label="Custom line count"
                    value={profile.log_length_lines || ""}
                    onChange={(e) => setProfile({ ...profile, log_length_lines: e.target.value })}
                    placeholder="e.g. 4"
                    className="w-16 h-8 px-2 text-center rounded-lg border border-border bg-surface text-small text-ink-900 focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-600"
                  />
                  <span className="text-caption text-ink-600">lines</span>
                </div>
              </div>

              <div className="bg-accent-50 border border-accent-200 rounded-xl p-3 flex items-start gap-2.5 mt-1">
                <Info size={16} className="text-accent-600 shrink-0 mt-0.5" />
                <p className="font-small text-small text-ink-900">
                  Yarn formats your output directly for handwritten physical logbooks (concise bullet points or tight sentences). No oversized headers eating into your paper lines.
                </p>
              </div>
            </div>

            {/* Grammar Level Selector */}
            <div className="mt-2 pt-3 border-t border-border flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages size={17} className="text-accent-600" />
                  <span className="font-small-medium text-small text-ink-900 font-semibold">
                    Grammar Tone & Style
                  </span>
                </div>
                <span className="text-caption font-caption-medium text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full border border-accent-200">
                  {profile.grammar_level === "informal"
                    ? "Informal"
                    : profile.grammar_level === "formal"
                    ? "Formal & Academic"
                    : "Balanced (Recommended)"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {GRAMMAR_OPTIONS.map((g) => {
                  const isSelected = (profile.grammar_level || "balanced") === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setProfile((prev) => ({ ...prev, grammar_level: g.id }))}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-[0.99] ${
                        isSelected
                          ? "border-accent-600 bg-accent-50/50 shadow-sm ring-1 ring-accent-600/30"
                          : "border-border hover:border-ink-400 bg-surface"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-small-medium text-small font-semibold text-ink-900">
                            {g.title}
                          </span>
                          {isSelected && <Check size={14} className="text-accent-600 shrink-0" />}
                        </div>
                        <p className="text-[12px] text-ink-600 leading-snug">
                          {g.desc}
                        </p>
                      </div>
                      <span
                        className={`mt-2.5 inline-block text-[10px] font-caption-medium px-2 py-0.5 rounded-full w-fit ${
                          isSelected
                            ? "bg-accent-600 text-surface"
                            : "bg-surface-muted text-ink-600 border border-border"
                        }`}
                      >
                        {g.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nigerian English Lingo Toggle */}
            <div className="mt-2 pt-3 border-t border-border flex flex-col gap-2">
              <label
                htmlFor="toggle-nigerian-lingo"
                className="flex items-start justify-between gap-4 cursor-pointer p-3 rounded-xl border border-border bg-surface-muted/40 hover:bg-surface-muted transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-small-medium text-small text-ink-900 font-semibold flex items-center gap-1.5">
                    <span>Authentic Nigerian Workplace & Workshop Lingo</span>
                    <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-accent-100 text-accent-700 font-caption-medium">
                      Site & Factory
                    </span>
                  </span>
                  <p className="text-caption text-ink-600 mt-0.5 leading-relaxed">
                    Includes authentic phrasing such as <em className="text-ink-800">"I followed my supervisor to site"</em>, <em className="text-ink-800">"We carried out the routine servicing of..."</em>, <em className="text-ink-800">"collected tools from the workshop store"</em>, and <em className="text-ink-800">"morning toolbox safety talk"</em>.
                  </p>
                </div>
                <input
                  id="toggle-nigerian-lingo"
                  type="checkbox"
                  checked={profile.use_nigerian_lingo}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, use_nigerian_lingo: e.target.checked }))
                  }
                  className="mt-1 w-5 h-5 rounded text-accent-600 focus:ring-accent-500 border-border cursor-pointer shrink-0"
                />
              </label>
            </div>

            {/* Pronoun Policy Card */}
            <div className="bg-surface-muted border border-border rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles size={16} className="text-accent-600 shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-ink-700 leading-relaxed">
                <strong className="text-ink-900 font-medium">Pronoun Policy:</strong> Yarn always outputs active, complete sentences using <strong>"I"</strong> for individual work and <strong>"We"</strong> for team tasks alongside supervisors, technicians, and peers. Robotic impersonal fragments (e.g. <em>"Calibrated the pump"</em>) are strictly prohibited.
              </p>
            </div>
          </section>

          {/* Card 3: Writing Style Instructions */}
          <section className="bg-surface rounded-xl border border-border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col gap-4">
            <header className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-50 flex items-center justify-center shrink-0 text-accent-600">
                <PenLine size={20} />
              </div>
              <div className="flex flex-col">
                <h2 className="font-heading text-heading text-ink-900 font-semibold">Writing style</h2>
                <p className="font-small text-small text-ink-600">
                  Tell Yarn how you want your entries written.
                </p>
              </div>
            </header>

            <div className="flex flex-col gap-3">
              <textarea
                id="style-instructions"
                rows={4}
                value={profile.custom_prompt || ""}
                onChange={(e) => setProfile({ ...profile, custom_prompt: e.target.value })}
                placeholder="e.g. Always focus on experimental setup, ambient temperature, and equipment calibration..."
                className="min-h-[120px] w-full p-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body leading-6 focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 resize-none transition-all"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResetPrompt}
                  className="font-small-medium text-small text-accent-600 hover:text-accent-700 py-1 transition-colors active:scale-95"
                >
                  Reset to default
                </button>
              </div>

              <div className="bg-accent-50 border border-accent-200 rounded-xl p-3 flex items-start gap-2.5">
                <Info size={16} className="text-accent-600 shrink-0 mt-0.5" />
                <p className="font-small text-small text-ink-900">
                  Yarn always writes in simple past tense and won't invent details.
                </p>
              </div>
            </div>
          </section>

          {/* Card 3: Custom Technical Vocabulary */}
          <section className="bg-surface rounded-xl border border-border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col gap-4">
            <header className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-50 flex items-center justify-center shrink-0 text-accent-600">
                <BookOpen size={20} />
              </div>
              <div className="flex flex-col">
                <h2 className="font-heading text-heading text-ink-900 font-semibold">Vocabulary</h2>
                <p className="font-small text-small text-ink-600">
                  Add words Yarn should always spell and keep exactly as you say them.
                </p>
              </div>
            </header>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  id="vocab-input"
                  type="text"
                  placeholder="e.g. spectroradiometer, CWSI"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTerm();
                    }
                  }}
                  className="h-[52px] flex-1 px-4 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body placeholder:text-ink-400 focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddTerm}
                  aria-label="Add vocabulary word"
                  className="h-[52px] px-5 rounded-full bg-accent-600 hover:bg-accent-700 text-surface flex items-center justify-center gap-1.5 font-small-medium text-small shadow-sm transition-all active:scale-95 shrink-0"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              {/* Vocabulary Chips Container */}
              <div className="flex flex-wrap gap-2 pt-1">
                {vocabulary.length > 0 ? (
                  vocabulary.map((item) => (
                    <Chip
                      key={item.id}
                      label={item.term}
                      variant="vocab"
                      onRemove={() => handleRemoveTerm(item.id)}
                    />
                  ))
                ) : (
                  <span className="font-caption text-caption text-ink-400 py-1">
                    No words added yet. Type a technical term above to prime the speech engine.
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Card 4: Bring Your Own Key (BYOK) */}
          <section className="bg-surface rounded-xl border border-border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col gap-4">
            <header className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-50 flex items-center justify-center shrink-0 text-accent-600">
                <KeyRound size={20} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-heading text-ink-900 font-semibold">Your own API key</h2>
                  <span className="h-6 px-2.5 rounded-full bg-surface-muted text-ink-600 font-caption-medium text-caption flex items-center justify-center select-none">
                    Optional
                  </span>
                </div>
                <p className="font-small text-small text-ink-600">
                  Add your own Gemini key for higher daily limits.
                </p>
              </div>
            </header>

            <div className="flex flex-col gap-2.5">
              <div className="relative flex items-center">
                <input
                  id="api-key-input"
                  type={showApiKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="h-[52px] w-full pl-4 pr-12 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body tracking-wider focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-200 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  aria-label="Toggle API key visibility"
                  className="absolute right-1 w-11 h-11 flex items-center justify-center text-ink-600 hover:text-ink-900 transition-colors"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-ink-600">
                <Lock size={14} className="shrink-0" />
                <span className="font-caption text-caption">Encrypted with Fernet before it's saved.</span>
              </div>

              <div className="pt-2 border-t border-border flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiKey ? "bg-accent-600" : "bg-success"
                  }`}
                />
                <span className="font-small-medium text-small font-medium text-ink-900">
                  {apiKey ? "Custom Gemini key configured" : "Using the shared Yarn key"}
                </span>
              </div>
            </div>
          </section>

          {/* Card 5: Your Yarn Link */}
          <section className="bg-surface rounded-xl border border-border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col gap-4">
            <header className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-50 flex items-center justify-center shrink-0 text-accent-600">
                <LinkIcon size={20} />
              </div>
              <div className="flex flex-col">
                <h2 className="font-heading text-heading text-ink-900 font-semibold">Your Yarn link</h2>
                <p className="font-small text-small text-ink-600">
                  Your secret access URL. No password required.
                </p>
              </div>
            </header>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="h-[52px] flex-1 px-4 rounded-xl border border-border bg-surface-muted text-ink-600 font-body text-body truncate select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="h-12 px-4 rounded-full border border-border-strong bg-surface hover:bg-surface-muted text-ink-900 flex items-center justify-center gap-1.5 font-small-medium text-small transition-all active:scale-95 shrink-0 shadow-sm"
                >
                  {copiedLink ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="bg-warning-bg border border-warning-border rounded-xl p-3 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                <p className="font-small text-small text-warning">
                  Anyone with this link can open your logs. Bookmark it and keep it private.
                </p>
              </div>
            </div>
          </section>

          {/* Sticky Floating Save Bar above mobile navigation bar */}
          <div className="fixed bottom-16 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-[0_-4px_12px_rgba(16,24,40,0.06)] px-gutter py-3">
            <div className="max-w-[640px] mx-auto">
              <button
                type="submit"
                disabled={saving}
                className="w-full h-[52px] rounded-full bg-accent-600 hover:bg-accent-700 active:scale-[0.99] text-surface font-subheading text-subheading font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Saving changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      <Toast message={toastMessage} isOpen={!!toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}
