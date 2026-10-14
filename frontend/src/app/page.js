"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createUser, getUserByAuthId } from "@/lib/api";
import {
  Mic,
  Sparkles,
  Check,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  AlignLeft,
  Volume2,
  FileText,
  Sliders,
  WifiOff,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Building2,
  LogIn,
  CheckCircle2,
  BookOpen,
  User,
} from "lucide-react";

import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

function GoogleIcon({ className = "w-4 h-4 shrink-0" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const DEMO_PREVIEWS = {
  swep: {
    title: "SWEP • Part 2 (200L)",
    lines: "5 lines",
    targetLines: "5-6 lines target",
    badge: "Foundational Workshop",
    voice:
      "“We were in the fitting workshop today. The instructor taught us safety gear protocols, then we used the hacksaw and bench vise to cut mild steel rods to 150mm.”",
    output:
      "• Attended mandatory workshop safety induction covering PPE protocols and hazard prevention.\n• Marked out 150mm dimensions on mild steel round stock using vernier height gauge and scriber.\n• Mounted workpiece in bench vise and carried out manual sawing with a 24-TPI hacksaw blade.\n• Checked cut dimensions against tolerance specifications under technician supervision.\n• Deburred workpiece edges using a second-cut flat file and cleaned workshop bench.",
  },
  siwes: {
    title: "SIWES • Part 3 (300L)",
    lines: "2 lines",
    targetLines: "2-3 lines target",
    badge: "Industrial Exposure",
    voice:
      "“Went to the primary pump house, monitored suction pressures on pump 2, assisted with oil lubrication.”",
    output:
      "• Monitored and logged suction and discharge pressures across primary centrifugal pump units.\n• Assisted maintenance technicians with routine mechanical seal inspection and lubricating oil top-up.",
  },
  it: {
    title: "IT • Part 4 (400L)",
    lines: "3 lines",
    targetLines: "2-4 lines target",
    badge: "Professional Engineering",
    voice:
      "“Inspected cooling tower condenser circuit, detected thermal drop across heat exchanger, isolated valve line for preventive flushing.”",
    output:
      "• Diagnosed abnormal thermal differential across heat exchanger condenser loops using infrared pyrometer.\n• Isolated primary intake valve and executed chemical descaling flush to restore baseline flow rates.\n• Documented differential pressure measurements and fluid velocity in daily station engineering logbook.",
  },
};

const NIGERIAN_UNIVERSITIES = [
  "OAU Ife",
  "UNILAG",
  "FUTA Akure",
  "UI Ibadan",
  "UNIBEN",
  "ABU Zaria",
  "Covenant",
  "LASU",
  "FUTO Owerri",
  "UNN Nsukka",
];

const FAQS = [
  {
    q: "Does Yarn work for my university's physical logbook?",
    a: "Yes. Whether you attend OAU, UNILAG, FUTA, UI, UNIBEN, ABU, or any other institution, university logbooks adhere to the same ITF (Industrial Training Fund) line and weekly box structures. You can pick SWEP (5-6 lines), SIWES (2-3 lines), or IT (2-4 lines), or set a custom line limit in your settings.",
  },
  {
    q: "Will my industry supervisor or academic coordinator notice it was generated?",
    a: "No. Generic AI tools produce lengthy academic essays that spill out of logbook margins. Yarn strictly takes your actual spoken daily duties and formats them into concise, bulleted sentences using personal first-person pronouns ('I' and 'We') with realistic engineering workshop terminology.",
  },
  {
    q: "Can I speak in Nigerian English, Pidgin, or workshop slang?",
    a: "Yes! Yarn is specifically trained to recognize Nigerian workshop jargon. Whether you say 'we used hacksaw cut mild steel', 'calibrated the megger', or 'followed technician to pump house', Yarn accurately translates your words into polished, technical student voice.",
  },
  {
    q: "What if I have poor or no internet at my work site or workshop?",
    a: "Yarn is an offline-first Progressive Web App (PWA). You can record voice memos or draft notes without an active connection; your entries are safely cached in your browser and sync the moment you reconnect.",
  },
  {
    q: "Can I export my entries into Microsoft Word (.docx) or PDF?",
    a: "Yes! In addition to hand-copying into your physical booklet, you can export your entire weekly log with dates, hours, and supervisor sign-off tables cleanly formatted in Word (.docx) or print-ready PDF for your end-of-attachment defense.",
  },
  {
    q: "Is Yarn free for Nigerian students?",
    a: "Yarn is 100% free for students. You can sign in with your Google account for multi-device sync, or explore immediately in Guest mode without creating an account.",
  },
];

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [yarnUser, setYarnUser] = useState(null);
  const [error, setError] = useState(searchParams.get("message") || "");
  const [savedGuestUuid, setSavedGuestUuid] = useState(null);

  const [activeDemoTier, setActiveDemoTier] = useState("siwes");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Guest modal state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestField, setGuestField] = useState("");
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);

  // Check auth & session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedGuest = localStorage.getItem("yarn_guest_uuid");
      if (storedGuest) setSavedGuestUuid(storedGuest);
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setIsCheckingSession(false);
      if (user) {
        setAuthenticatedUser(user);
        try {
          const yUser = await getUserByAuthId(user.id);
          if (yUser?.id) {
            setYarnUser(yUser);
            if (typeof window !== "undefined") {
              localStorage.setItem("yarn_user_uuid", yUser.id);
              localStorage.setItem(
                `yarn_onboarded_${yUser.id}`,
                String(Boolean(yUser.is_onboarded))
              );
            }
          }
        } catch (e) {
          console.warn("Could not retrieve user by auth ID:", e.message);
        }
      }
    });
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoadingAuth(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Could not initialize Google sign-in. Please try again.");
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoadingAuth(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setAuthenticatedUser(null);
      setYarnUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("yarn_user_uuid");
        localStorage.removeItem("yarn_guest_uuid");
        document.cookie = "yarn_guest_uuid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "yarn_user_uuid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Please enter your name to continue as a guest.");
      return;
    }
    setIsSubmittingGuest(true);
    setError("");

    try {
      const user = await createUser({
        name: guestName.trim(),
        field_of_work: guestField.trim() || "General Engineering",
        is_onboarded: false,
      });

      if (user?.id) {
        if (typeof window !== "undefined") {
          localStorage.setItem("yarn_guest_uuid", user.id);
          document.cookie = `yarn_guest_uuid=${user.id}; path=/; max-age=31536000; SameSite=Lax`;
        }
        router.push(`/u/${user.id}/onboarding`);
      } else {
        throw new Error("Could not initialize guest session");
      }
    } catch (err) {
      setError("Failed to create guest session. Please try again.");
      setIsSubmittingGuest(false);
    }
  };

  const handleResumeGuest = () => {
    if (savedGuestUuid) {
      document.cookie = `yarn_guest_uuid=${savedGuestUuid}; path=/; max-age=31536000; SameSite=Lax`;
      router.push(`/u/${savedGuestUuid}`);
    }
  };

  const currentDemo = DEMO_PREVIEWS[activeDemoTier];

  return (
    <div className="min-h-screen bg-background text-ink-900 flex flex-col selection:bg-accent-100 selection:text-accent-700">
      
      {/* ========================================================
          STICKY NAVBAR (ClassFundz Inspired)
      ======================================================== */}
      <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-[1140px] mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size={28} showWordmark />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-small font-medium text-ink-600">
            <a href="#features" className="hover:text-ink-900 transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-ink-900 transition-colors">
              How It Works
            </a>
            <a href="#programs" className="hover:text-ink-900 transition-colors">
              Logbook Programs
            </a>
            <a href="#faq" className="hover:text-ink-900 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right: Actions (Theme Toggle & Auth) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle className="w-9 h-9 p-0 flex items-center justify-center rounded-full border border-border bg-surface hover:bg-surface-muted transition-colors" />

            {/* Authenticated State */}
            {authenticatedUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href={
                    yarnUser?.id
                      ? yarnUser.is_onboarded === false
                        ? `/u/${yarnUser.id}/onboarding`
                        : `/u/${yarnUser.id}`
                      : "/auth/callback"
                  }
                  className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-accent-600 hover:bg-accent-700 active:scale-[0.98] text-white text-small font-medium inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span className="hidden xs:inline">
                    {yarnUser?.is_onboarded === false ? "Complete Setup" : "Go to Logbook"}
                  </span>
                  <span className="xs:hidden">Logbook</span>
                  <ArrowRight size={15} />
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="hidden sm:inline-flex text-caption font-medium text-ink-500 hover:text-ink-900 px-2 py-1 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              /* Non-authenticated State */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoadingAuth}
                  className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-ink-900 text-white dark:bg-white dark:text-ink-900 hover:opacity-90 active:scale-[0.98] text-small font-medium inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <GoogleIcon className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Sign in with Google</span>
                  <span className="xs:hidden">Sign In</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border text-ink-700 hover:bg-surface-muted transition-colors"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-3 shadow-lg animate-fadeIn">
            <nav className="flex flex-col gap-2.5 text-small font-medium text-ink-700">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 hover:text-ink-900"
              >
                Features
              </a>
              <a
                href="#demo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 hover:text-ink-900"
              >
                How It Works
              </a>
              <a
                href="#programs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 hover:text-ink-900"
              >
                Logbook Programs (SWEP, SIWES, IT)
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 hover:text-ink-900"
              >
                Frequently Asked Questions
              </a>
            </nav>

            <div className="border-t border-border pt-3 flex flex-col gap-2">
              {authenticatedUser ? (
                <>
                  <div className="text-caption text-ink-500 truncate">
                    Signed in as {authenticatedUser.email}
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-left text-small text-danger hover:underline font-medium py-1"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsGuestModalOpen(true);
                  }}
                  className="text-left text-small text-ink-600 hover:text-ink-900 font-medium py-1"
                >
                  Continue as Guest without account →
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Error Banner if present */}
      {error && (
        <div className="max-w-[1140px] mx-auto w-full px-4 sm:px-6 pt-4">
          <div className="p-3.5 rounded-xl bg-danger-bg border border-danger-border flex items-start gap-2.5 text-danger font-small text-small">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError("")}
              className="text-danger hover:opacity-70 font-semibold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          HERO SECTION (ClassFundz Clean Layout)
      ======================================================== */}
      <section className="relative pt-10 sm:pt-16 pb-12 sm:pb-20 overflow-hidden border-b border-border/60">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border shadow-[0_1px_2px_rgba(16,24,40,0.04)] text-ink-700 text-caption font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-600" />
            <span>Built for Nigerian Engineering & Science Students</span>
            <span className="text-ink-300">•</span>
            <span className="text-accent-700 font-semibold">SWEP • SIWES • IT</span>
          </div>

          {/* Main Headline */}
          <h1 className="max-w-[840px] font-hero text-[34px] sm:text-[46px] md:text-[54px] text-ink-900 font-bold tracking-tight leading-[1.12]">
            Speak your day. <br className="hidden xs:inline" />
            Fit your logbook's exact lines.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-[620px] font-body text-[16px] sm:text-[18px] text-ink-600 leading-relaxed">
            Record what you did in the workshop or on industrial attachment in plain speech or workshop lingo. Yarn formats everything into crisp, first-person entries with "I" and "We", strictly matching your paper logbook's box limits.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-[440px]">
            {authenticatedUser ? (
              <div className="flex flex-col gap-2.5 w-full">
                <Link
                  href={
                    yarnUser?.id
                      ? yarnUser.is_onboarded === false
                        ? `/u/${yarnUser.id}/onboarding`
                        : `/u/${yarnUser.id}`
                      : "/auth/callback"
                  }
                  className="w-full h-12 rounded-full bg-accent-600 hover:bg-accent-700 active:scale-[0.98] text-white font-medium text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>
                    {yarnUser?.is_onboarded === false
                      ? "Complete Your Student Setup"
                      : "Continue to Your Logbook"}
                  </span>
                  <ArrowRight size={17} />
                </Link>
                <div className="flex items-center justify-center gap-2 text-caption text-ink-500">
                  <span>Signed in as {authenticatedUser.email}</span>
                  <span>•</span>
                  <button
                    onClick={handleSignOut}
                    className="hover:text-ink-900 underline cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoadingAuth}
                  className="w-full sm:flex-1 h-12 rounded-full bg-ink-900 text-white dark:bg-white dark:text-ink-900 hover:opacity-90 active:scale-[0.98] font-medium text-[15px] flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoadingAuth ? (
                    <RefreshCw size={17} className="animate-spin text-accent-600" />
                  ) : (
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(true)}
                  className="w-full sm:w-auto h-12 px-6 rounded-full bg-surface border border-border hover:bg-surface-muted text-ink-800 font-medium text-[15px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Guest Mode</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Resume Button for Guests */}
          {savedGuestUuid && !authenticatedUser && (
            <button
              type="button"
              onClick={handleResumeGuest}
              className="mt-3 text-caption text-ink-500 hover:text-ink-900 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Resume previous guest session</span>
              <ArrowRight size={12} />
            </button>
          )}

          {/* Micro-Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-caption text-ink-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-success" />
              <span>No credit card required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-success" />
              <span>Offline-ready PWA</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-success" />
              <span>100% Free for Nigerian students</span>
            </span>
          </div>

          {/* ========================================================
              HERO MOCKUP: INTERACTIVE LOGBOOK CARD
          ======================================================== */}
          <div id="demo" className="mt-12 w-full max-w-[820px] rounded-3xl bg-surface border border-border p-4 sm:p-7 shadow-[0_12px_40px_rgba(16,24,40,0.06)] text-left flex flex-col gap-5">
            
            {/* Card Header with Level Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-50 text-accent-700 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h3 className="font-subheading text-[15px] font-semibold text-ink-900">
                    Live Logbook Simulator
                  </h3>
                  <p className="font-caption text-caption text-ink-500">
                    See how your voice transforms into physical paper lines
                  </p>
                </div>
              </div>

              {/* Program Level Toggle Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-surface-muted rounded-xl text-caption">
                <button
                  type="button"
                  onClick={() => setActiveDemoTier("swep")}
                  className={`py-1.5 px-3 rounded-lg font-medium text-center transition-all cursor-pointer ${
                    activeDemoTier === "swep"
                      ? "bg-surface text-ink-900 shadow-sm font-semibold"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  SWEP (Part 2)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDemoTier("siwes")}
                  className={`py-1.5 px-3 rounded-lg font-medium text-center transition-all cursor-pointer ${
                    activeDemoTier === "siwes"
                      ? "bg-surface text-ink-900 shadow-sm font-semibold"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  SIWES (Part 3)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDemoTier("it")}
                  className={`py-1.5 px-3 rounded-lg font-medium text-center transition-all cursor-pointer ${
                    activeDemoTier === "it"
                      ? "bg-surface text-ink-900 shadow-sm font-semibold"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  IT (Part 4)
                </button>
              </div>
            </div>

            {/* Split View: Voice Recording vs Paper Log Entry */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Column: Spoken Yarn & Waveform (5 cols) */}
              <div className="md:col-span-5 rounded-2xl bg-surface-muted/60 border border-border p-4 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-caption font-medium text-ink-500">
                    <span className="flex items-center gap-1.5 text-accent-700">
                      <Mic size={14} className="animate-pulse" />
                      <span>What you speak</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 font-semibold">
                      0:28 audio
                    </span>
                  </div>
                  <p className="font-body text-[13.5px] text-ink-700 italic leading-relaxed pt-1">
                    {currentDemo.voice}
                  </p>
                </div>

                {/* Simulated Audio Waveform Bar */}
                <div className="pt-2 flex items-center gap-1.5 h-6">
                  {[40, 75, 50, 90, 60, 85, 30, 95, 70, 45, 80, 65, 90, 50, 35, 75, 60, 40].map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 bg-accent-600/40 rounded-full transition-all duration-300"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Physical Paper Entry (7 cols) */}
              <div className="md:col-span-7 rounded-2xl bg-surface border-2 border-border p-4 sm:p-5 flex flex-col gap-2.5 shadow-sm">
                <div className="flex items-center justify-between text-caption font-medium pb-2 border-b border-border">
                  <span className="text-ink-500 uppercase tracking-wider text-[11px]">
                    What writes into your paper booklet
                  </span>
                  <span className="inline-flex items-center gap-1 text-success font-semibold bg-success-bg px-2.5 py-0.5 rounded-full text-caption border border-success-border">
                    <Check size={13} />
                    <span>Exact {currentDemo.lines}</span>
                  </span>
                </div>

                {/* Formatted Output with Ruled Line Simulation */}
                <div className="font-mono text-[13px] text-ink-900 leading-[24px] whitespace-pre-line py-1">
                  {currentDemo.output}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-caption text-ink-400">
                  <span>{currentDemo.title}</span>
                  <span>Personal "I" & "We" style</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          CAMPUS TRUST STRIP
      ======================================================== */}
      <section className="py-8 bg-surface-muted/40 border-b border-border">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-caption font-medium uppercase tracking-wider text-ink-500 shrink-0">
            Adopted by students across Nigerian campuses
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {NIGERIAN_UNIVERSITIES.map((uni) => (
              <span
                key={uni}
                className="text-caption font-medium px-2.5 py-1 rounded-lg bg-surface border border-border text-ink-700 shadow-sm"
              >
                {uni}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          KEY VALUE PILLARS / FEATURES (ClassFundz 6-Card Grid)
      ======================================================== */}
      <section id="features" className="py-16 sm:py-24 border-b border-border">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 flex flex-col gap-12">
          
          <div className="flex flex-col items-center text-center max-w-[620px] mx-auto">
            <span className="text-caption uppercase font-semibold tracking-wider text-accent-700 px-3 py-1 rounded-full bg-accent-50 border border-accent-200">
              Engineered for Nigerian Logbooks
            </span>
            <h2 className="mt-3 font-title text-[28px] sm:text-[34px] font-bold text-ink-900 tracking-tight">
              Why students never write logbooks manually again
            </h2>
            <p className="mt-2 text-ink-600 font-body text-body">
              Standard AI chatbots produce generic essays that get rejected by university coordinators. Yarn is purpose-built for physical logbook constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Physical Line Constraint */}
            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-accent-600/30 transition-all flex flex-col gap-3 shadow-[0_1px_3px_rgba(16,24,40,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center">
                <AlignLeft size={20} />
              </div>
              <h3 className="font-subheading text-[17px] font-semibold text-ink-900">
                Exact Physical Line Fit
              </h3>
              <p className="font-small text-ink-600 leading-relaxed">
                Logbook boxes have zero margin for error. Yarn forces concise 2-3 lines for SIWES, 5-6 lines for SWEP, or 2-4 lines for IT, fitting your actual lined page perfectly.
              </p>
            </div>

            {/* Card 2: Authentic First-Person Voice */}
            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-accent-600/30 transition-all flex flex-col gap-3 shadow-[0_1px_3px_rgba(16,24,40,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center">
                <User size={20} />
              </div>
              <h3 className="font-subheading text-[17px] font-semibold text-ink-900">
                Active "I" & "We" Sentences
              </h3>
              <p className="font-small text-ink-600 leading-relaxed">
                No awkward robotic passive voice. Generates authentic sentences like "I inspected the pump..." and "We completed the lathe facing operation under supervision."
              </p>
            </div>

            {/* Card 3: Nigerian Workshop Lingo */}
            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-accent-600/30 transition-all flex flex-col gap-3 shadow-[0_1px_3px_rgba(16,24,40,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <h3 className="font-subheading text-[17px] font-semibold text-ink-900">
                Workshop & Industry Jargon
              </h3>
              <p className="font-small text-ink-600 leading-relaxed">
                Understands Nigerian workshop tools and site terms: vernier calipers, mild steel rods, packing seals, megger testing, and site safety inductions.
              </p>
            </div>

            {/* Card 4: Weekly Timeline & Streaks */}
            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-accent-600/30 transition-all flex flex-col gap-3 shadow-[0_1px_3px_rgba(16,24,40,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h3 className="font-subheading text-[17px] font-semibold text-ink-900">
                Weekly Timeline & Streaks
              </h3>
              <p className="font-small text-ink-600 leading-relaxed">
                Track your active logging streak, hours logged, and weekly completion bar. Never stress out on Friday afternoon before your supervisor signs.
              </p>
            </div>

            {/* Card 5: Offline PWA Readiness */}
            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-accent-600/30 transition-all flex flex-col gap-3 shadow-[0_1px_3px_rgba(16,24,40,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center">
                <WifiOff size={20} />
              </div>
              <h3 className="font-subheading text-[17px] font-semibold text-ink-900">
                Works on Poor or Zero Network
              </h3>
              <p className="font-small text-ink-600 leading-relaxed">
                Workshop basements and remote construction sites often have spotty cellular service. Yarn caches your recordings offline and syncs when back in range.
              </p>
            </div>

            {/* Card 6: One-Click Word & PDF Export */}
            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-accent-600/30 transition-all flex flex-col gap-3 shadow-[0_1px_3px_rgba(16,24,40,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h3 className="font-subheading text-[17px] font-semibold text-ink-900">
                Official Word & PDF Export
              </h3>
              <p className="font-small text-ink-600 leading-relaxed">
                Need to submit a printed report for your departmental defense? Download cleanly formatted Microsoft Word (.docx) or print-ready PDF files in one tap.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          HOW IT WORKS (01 - 02 - 03 STEPS)
      ======================================================== */}
      <section className="py-16 sm:py-24 bg-surface-muted/30 border-b border-border">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 flex flex-col gap-12">
          
          <div className="flex flex-col items-center text-center max-w-[620px] mx-auto">
            <span className="text-caption uppercase font-semibold tracking-wider text-accent-700 px-3 py-1 rounded-full bg-accent-50 border border-accent-200">
              Simple 3-Step Routine
            </span>
            <h2 className="mt-3 font-title text-[28px] sm:text-[34px] font-bold text-ink-900 tracking-tight">
              From spoken words to signed logbook in 30 seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 01 */}
            <div className="p-7 rounded-2xl bg-surface border border-border flex flex-col gap-4 relative shadow-sm">
              <span className="font-mono text-3xl font-bold text-accent-600/30">01</span>
              <h3 className="font-subheading text-[18px] font-semibold text-ink-900">
                Speak on your ride home
              </h3>
              <p className="font-small text-ink-600 leading-relaxed">
                Tap record as you finish work or board the bus. Mention the machine you turned on, the fittings you sawed, or the report you filed.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-7 rounded-2xl bg-surface border border-border flex flex-col gap-4 relative shadow-sm">
              <span className="font-mono text-3xl font-bold text-accent-600/30">02</span>
              <h3 className="font-subheading text-[18px] font-semibold text-ink-900">
                Yarn formats your entry
              </h3>
              <p className="font-small text-ink-600 leading-relaxed">
                Yarn aligns your words with your faculty, department, grammar tone, and exact paper box lines with personal "I" and "We" sentences.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-7 rounded-2xl bg-surface border border-border flex flex-col gap-4 relative shadow-sm">
              <span className="font-mono text-3xl font-bold text-accent-600/30">03</span>
              <h3 className="font-subheading text-[18px] font-semibold text-ink-900">
                Copy and pen down
              </h3>
              <p className="font-small text-ink-600 leading-relaxed">
                Copy with one tap and pen it directly into your physical booklet. It fits the box cleanly with no awkward line overflows.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          LOGBOOK PROGRAMS (SWEP, SIWES, IT)
      ======================================================== */}
      <section id="programs" className="py-16 sm:py-24 border-b border-border">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 flex flex-col gap-12">
          
          <div className="flex flex-col items-center text-center max-w-[620px] mx-auto">
            <span className="text-caption uppercase font-semibold tracking-wider text-accent-700 px-3 py-1 rounded-full bg-accent-50 border border-accent-200">
              All Nigerian Attachment Programs
            </span>
            <h2 className="mt-3 font-title text-[28px] sm:text-[34px] font-bold text-ink-900 tracking-tight">
              Tailored for each year of your engineering degree
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* SWEP */}
            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between gap-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-50 text-accent-700">
                    Part 2 (200L)
                  </span>
                  <span className="text-caption text-ink-500 font-medium">8–12 weeks</span>
                </div>
                <h3 className="font-subheading text-[20px] font-bold text-ink-900">
                  SWEP
                </h3>
                <p className="font-small text-ink-600 leading-relaxed">
                  Students Workshop Experience Programme. Focuses on foundational mechanical fitting, electrical wiring, welding, carpentry, and safety gear rules.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-caption font-medium">
                <span className="text-ink-600">Physical Box Limit:</span>
                <span className="text-accent-700 font-semibold">5–6 lines</span>
              </div>
            </div>

            {/* SIWES */}
            <div className="p-6 rounded-2xl bg-surface border-2 border-accent-600/40 flex flex-col justify-between gap-6 shadow-md relative">
              <div className="absolute -top-3 right-5 bg-accent-600 text-white text-[11px] font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-50 text-accent-700">
                    Part 3 (300L)
                  </span>
                  <span className="text-caption text-ink-500 font-medium">3 months</span>
                </div>
                <h3 className="font-subheading text-[20px] font-bold text-ink-900">
                  SIWES
                </h3>
                <p className="font-small text-ink-600 leading-relaxed">
                  Students Industrial Work Experience Scheme. Introductory industrial exposure, routine facility operations, equipment maintenance, and technician shadowing.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-caption font-medium">
                <span className="text-ink-600">Physical Box Limit:</span>
                <span className="text-accent-700 font-semibold">2–3 lines</span>
              </div>
            </div>

            {/* IT */}
            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between gap-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-50 text-accent-700">
                    Part 4 (400L)
                  </span>
                  <span className="text-caption text-ink-500 font-medium">6 months</span>
                </div>
                <h3 className="font-subheading text-[20px] font-bold text-ink-900">
                  IT
                </h3>
                <p className="font-small text-ink-600 leading-relaxed">
                  Industrial Training. Advanced technical engineering workflows, plant diagnostics, instrumentation, and professional project execution.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-caption font-medium">
                <span className="text-ink-600">Physical Box Limit:</span>
                <span className="text-accent-700 font-semibold">2–4 lines</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          FAQ ACCORDION (ClassFundz Style Clean Collapsible)
      ======================================================== */}
      <section id="faq" className="py-16 sm:py-24 border-b border-border">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 flex flex-col gap-10">
          
          <div className="flex flex-col items-center text-center">
            <span className="text-caption uppercase font-semibold tracking-wider text-accent-700 px-3 py-1 rounded-full bg-accent-50 border border-accent-200">
              Got Questions?
            </span>
            <h2 className="mt-3 font-title text-[28px] sm:text-[34px] font-bold text-ink-900 tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-surface border border-border overflow-hidden transition-all shadow-[0_1px_2px_rgba(16,24,40,0.02)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-subheading text-[15.5px] font-semibold text-ink-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-ink-500 shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 font-small text-ink-600 leading-relaxed border-t border-border/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          BOTTOM CALL TO ACTION (ClassFundz Dark / High Contrast Pill)
      ======================================================== */}
      <section className="py-16 sm:py-20 bg-surface">
        <div className="max-w-[920px] mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
          <Logo size={42} />
          
          <h2 className="font-title text-[28px] sm:text-[38px] font-bold text-ink-900 tracking-tight max-w-[640px]">
            Ready to stop spending your evenings writing logbooks?
          </h2>
          
          <p className="text-ink-600 font-body text-[16px] max-w-[520px]">
            Join hundreds of Nigerian students recording in 30 seconds. Fit your paper booklet lines and impress your industrial supervisor.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[420px]">
            {authenticatedUser ? (
              <Link
                href={
                  yarnUser?.id
                    ? yarnUser.is_onboarded === false
                      ? `/u/${yarnUser.id}/onboarding`
                      : `/u/${yarnUser.id}`
                    : "/auth/callback"
                }
                className="w-full h-12 rounded-full bg-accent-600 hover:bg-accent-700 active:scale-[0.98] text-white font-medium text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Continue to Your Logbook</span>
                <ArrowRight size={17} />
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoadingAuth}
                  className="w-full sm:flex-1 h-12 rounded-full bg-ink-900 text-white dark:bg-white dark:text-ink-900 hover:opacity-90 active:scale-[0.98] font-medium text-[15px] flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span>Start with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(true)}
                  className="w-full sm:w-auto h-12 px-6 rounded-full bg-surface border border-border hover:bg-surface-muted text-ink-800 font-medium text-[15px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Guest Mode</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOTER (ClassFundz Clean Footer)
      ======================================================== */}
      <footer className="border-t border-border bg-background py-10">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-caption text-ink-500">
          <div className="flex items-center gap-3">
            <Logo size={24} showWordmark />
            <span className="text-ink-300">|</span>
            <span>© {new Date().getFullYear()} Yarn. Built for Nigerian Students.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-ink-900 transition-colors">
              Features
            </a>
            <a href="#programs" className="hover:text-ink-900 transition-colors">
              Programs
            </a>
            <Link href="/privacy" className="hover:text-ink-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-ink-900 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>

      {/* ========================================================
          GUEST SIGN-IN MODAL
      ======================================================== */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-[440px] rounded-2xl bg-surface border border-border p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logo size={28} />
                <h3 className="font-subheading text-[17px] font-semibold text-ink-900">
                  Continue as Guest
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGuestModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-surface-muted transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="font-small text-ink-600">
              Try Yarn immediately without creating an account. You can sync with Google anytime later.
            </p>

            <form onSubmit={handleGuestSubmit} className="flex flex-col gap-4 pt-1">
              <div className="flex flex-col gap-1.5">
                <label className="font-caption-medium text-caption text-ink-800">
                  Your Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Adeyemi"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 text-small outline-none focus:ring-2 focus:ring-accent-600 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-caption-medium text-caption text-ink-800">
                  Course / Field of Study
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mechanical Engineering"
                  value={guestField}
                  onChange={(e) => setGuestField(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 text-small outline-none focus:ring-2 focus:ring-accent-600 transition-all"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingGuest}
                  className="flex-1 h-11 rounded-full bg-ink-900 text-white dark:bg-white dark:text-ink-900 font-medium text-small flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingGuest ? (
                    <RefreshCw size={16} className="animate-spin text-accent-600" />
                  ) : (
                    <span>Start Guest Logbook</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(false)}
                  className="px-5 h-11 rounded-full border border-border text-ink-600 hover:bg-surface-muted font-medium text-small transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-full border-[3px] border-accent-600/20 border-t-accent-600 animate-spin" />
        </div>
      }
    >
      <LandingContent />
    </Suspense>
  );
}
