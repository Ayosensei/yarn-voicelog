"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createUser } from "@/lib/api";
import {
  Mic,
  Sparkles,
  Check,
  RefreshCw,
  AlertCircle,
  User,
  ArrowRight,
  GraduationCap,
  AlignLeft,
  Volume2,
} from "lucide-react";

import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
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
    title: "SWEP • Part 2",
    lines: "5-6 lines",
    tag: "Workshop & practicals",
    voice:
      "“We were in the fitting workshop today. The instructor taught us safety gear protocols, then we used the hacksaw and bench vise to cut mild steel rods to 150mm.”",
    output:
      "• Attended safety briefing on workshop rules and PPE requirements in the mechanical fitting shop.\n• Marked out 150mm dimensions on mild steel round stock using vernier height gauge and scriber.\n• Mounted stock in bench vise and performed manual sawing using a 24-TPI hacksaw blade.\n• Checked cut dimensions against tolerance specifications under technician supervision.",
  },
  siwes: {
    title: "SIWES • Part 3",
    lines: "2-3 lines",
    tag: "Industrial exposure",
    voice:
      "“Went to the primary pump house, monitored suction pressures on pump 2, assisted with oil lubrication.”",
    output:
      "• Monitored and logged suction and discharge pressures across primary centrifugal pump units.\n• Assisted maintenance technicians with routine mechanical seal inspection and lubricating oil top-up.",
  },
  it: {
    title: "IT • Part 4",
    lines: "2-4 lines",
    tag: "Professional engineering",
    voice:
      "“Inspected cooling tower condenser circuit, detected thermal drop across heat exchanger, isolated valve line for preventive flushing.”",
    output:
      "• Diagnosed abnormal thermal differential across heat exchanger condenser loops using infrared pyrometer.\n• Isolated primary intake valve and executed chemical descaling flush to restore baseline flow rates.\n• Documented differential pressure measurements in daily station engineering logbook.",
  },
};

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [yarnUser, setYarnUser] = useState(null);
  const [error, setError] = useState(searchParams.get("message") || "");
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestField, setGuestField] = useState("");
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);
  const [savedGuestUuid, setSavedGuestUuid] = useState(null);
  const [activeDemoTier, setActiveDemoTier] = useState("siwes");

  // Check if user is already signed in or has saved guest session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedGuest = localStorage.getItem("yarn_guest_uuid");
      if (storedGuest) {
        setSavedGuestUuid(storedGuest);
      }
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsCheckingSession(false);
      if (user) {
        setAuthenticatedUser(user);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        // Fetch their Yarn UUID from backend
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/by-auth/${user.id}`,
          { signal: controller.signal }
        )
          .then((r) => (r.ok ? r.json() : null))
          .then((yUser) => {
            if (yUser?.id) {
              setYarnUser(yUser);
            }
          })
          .catch((err) => {
            console.warn("Could not fetch user by auth id:", err);
          })
          .finally(() => {
            clearTimeout(timeoutId);
          });
      }
    });
  }, [router]);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setAuthenticatedUser(null);
      setYarnUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("yarn_guest_uuid");
        document.cookie = "yarn_guest_uuid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Could not start Google sign-in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Please enter your name to start as guest.");
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
    <>
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-md border-b border-border/80 flex justify-center">
        <div className="w-full max-w-[640px] h-14 px-gutter flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} showWordmark />
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex text-[11px] font-caption-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-surface-muted text-ink-700">
              SWEP • SIWES • IT
            </span>
            <ThemeToggle className="w-8 h-8 p-0 flex items-center justify-center rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col w-full max-w-[640px] mx-auto pt-20 pb-safe px-gutter">
        <div className="flex flex-col w-full pb-12 gap-8">
          
          {/* Hero Section */}
          <section className="flex flex-col pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 border border-accent-200 text-accent-700 text-caption font-caption-medium w-fit mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-600" />
              Tailored for Nigerian student logbooks
            </div>
            <h1 className="font-hero text-hero text-ink-900 tracking-[-0.02em] font-semibold">
              Speak your day!
            </h1>
            <p className="font-body text-body text-ink-600 mt-2 max-w-[540px]">
              Speak what you did at work or in the workshop. Yarn formats your daily entry to fit your physical paper logbook's exact lines.
            </p>

            {/* Program Tiers Pill Row */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-caption font-caption-medium px-2.5 py-1 rounded-lg bg-surface border border-border text-ink-800">
                SWEP (Part 2) • 5–6 lines
              </span>
              <span className="text-caption font-caption-medium px-2.5 py-1 rounded-lg bg-surface border border-border text-ink-800">
                SIWES (Part 3) • 2–3 lines
              </span>
              <span className="text-caption font-caption-medium px-2.5 py-1 rounded-lg bg-surface border border-border text-ink-800">
                IT (Part 4) • 2–4 lines
              </span>
            </div>
          </section>

          {/* Interactive Comparison Preview Card */}
          <section className="bg-surface rounded-2xl p-5 sm:p-6 border border-border shadow-[0_1px_3px_rgba(16,24,40,0.04)] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlignLeft size={18} className="text-accent-600" />
                <h3 className="font-subheading text-subheading font-semibold text-ink-900">
                  See how output adapts to your level
                </h3>
              </div>
              <span className="text-caption text-ink-500 font-caption">
                Matches physical logbook lines
              </span>
            </div>

            {/* Program Level Toggle Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-muted rounded-xl">
              <button
                type="button"
                onClick={() => setActiveDemoTier("swep")}
                className={`py-2 px-2 rounded-lg text-caption font-caption-medium text-center transition-all cursor-pointer ${
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
                className={`py-2 px-2 rounded-lg text-caption font-caption-medium text-center transition-all cursor-pointer ${
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
                className={`py-2 px-2 rounded-lg text-caption font-caption-medium text-center transition-all cursor-pointer ${
                  activeDemoTier === "it"
                    ? "bg-surface text-ink-900 shadow-sm font-semibold"
                    : "text-ink-600 hover:text-ink-900"
                }`}
              >
                IT (Part 4)
              </button>
            </div>

            {/* Comparison Display */}
            <div className="flex flex-col gap-3">
              {/* Spoken Yarn */}
              <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-border/80 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-caption font-caption-medium text-ink-500 uppercase tracking-wide">
                  <Volume2 size={14} className="text-accent-600" />
                  <span>What you speak</span>
                </div>
                <p className="font-body text-[13.5px] text-ink-700 italic">
                  {currentDemo.voice}
                </p>
              </div>

              {/* Formatted Output */}
              <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-col gap-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.02)]">
                <div className="flex items-center justify-between text-caption font-caption-medium">
                  <span className="text-ink-500 uppercase tracking-wide">
                    What Yarn writes into your logbook
                  </span>
                  <span className="text-accent-700 font-semibold bg-accent-50 px-2 py-0.5 rounded-full">
                    {currentDemo.lines}
                  </span>
                </div>
                <div className="font-mono text-[13px] text-ink-900 leading-[22px] whitespace-pre-line pt-1">
                  {currentDemo.output}
                </div>
              </div>
            </div>
          </section>

          {/* 3-Step Process */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
                <Mic size={18} />
              </div>
              <h4 className="font-subheading text-subheading font-semibold text-ink-900">
                1. Speak freely
              </h4>
              <p className="font-caption text-caption text-ink-600 leading-relaxed">
                Talk in English or Nigerian Pidgin. Mention your tools, tasks, and what happened today.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
                <Sparkles size={18} />
              </div>
              <h4 className="font-subheading text-subheading font-semibold text-ink-900">
                2. Formatted for paper
              </h4>
              <p className="font-caption text-caption text-ink-600 leading-relaxed">
                No bulky headers. Strictly tailored to your program level and paper line constraints.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
                <Check size={18} />
              </div>
              <h4 className="font-subheading text-subheading font-semibold text-ink-900">
                3. Copy & write down
              </h4>
              <p className="font-caption text-caption text-ink-600 leading-relaxed">
                Copy with one tap and pen it right into your physical logbook before your supervisor signs.
              </p>
            </div>
          </section>

          {/* Sign-In Card */}
          <section className="bg-surface rounded-2xl p-5 sm:p-6 border border-border shadow-[0_1px_3px_rgba(16,24,40,0.04)] flex flex-col gap-5">
            <div>
              <h2 className="font-heading text-heading text-ink-900 font-semibold">
                Start your logbook
              </h2>
              <p className="font-small text-small text-ink-600 mt-1">
                Sign in with Google to sync across devices, or continue as a guest.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-danger-bg border border-danger-border flex items-start gap-2.5 text-danger font-small text-small">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Active Account Status or Sign-In Button */}
            {authenticatedUser ? (
              <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-accent-50/50 border border-accent-200">
                <div className="flex items-center gap-3">
                  {authenticatedUser.user_metadata?.avatar_url ? (
                    <img
                      src={authenticatedUser.user_metadata.avatar_url}
                      alt={authenticatedUser.user_metadata.full_name || "User"}
                      className="w-10 h-10 rounded-full border border-accent-300 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent-600 text-surface flex items-center justify-center font-semibold text-small shrink-0">
                      {(authenticatedUser.user_metadata?.full_name || authenticatedUser.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-subheading text-subheading font-semibold text-ink-900 truncate">
                      {authenticatedUser.user_metadata?.full_name || "Student"}
                    </span>
                    <span className="font-caption text-caption text-ink-600 truncate">
                      {authenticatedUser.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (yarnUser?.id) {
                        const isLocallyOnboarded =
                          typeof window !== "undefined" &&
                          localStorage.getItem(`yarn_onboarded_${yarnUser.id}`) === "true";
                        if (yarnUser.is_onboarded === false && !isLocallyOnboarded) {
                          router.push(`/u/${yarnUser.id}/onboarding`);
                        } else {
                          router.push(`/u/${yarnUser.id}`);
                        }
                      } else {
                        setIsLoading(true);
                        fetch(
                          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/by-auth/${authenticatedUser.id}`
                        )
                          .then((r) => r.json())
                          .then((u) => {
                            if (u?.id) {
                              if (u.is_onboarded === false) router.push(`/u/${u.id}/onboarding`);
                              else router.push(`/u/${u.id}`);
                            }
                          })
                          .catch(() => router.push("/"))
                          .finally(() => setIsLoading(false));
                      }
                    }}
                    disabled={isLoading}
                    className="w-full sm:flex-1 h-11 rounded-xl bg-accent-600 hover:bg-accent-700 active:scale-[0.99] text-surface font-small-medium text-small flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Opening logbook…</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to your Logbook</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full sm:w-auto h-11 px-4 rounded-xl border border-border-strong hover:bg-surface-muted active:scale-[0.99] text-ink-700 font-small text-small transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="google-signin-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-[52px] rounded-xl bg-surface border-2 border-border-strong hover:border-accent-600 hover:bg-accent-50/40 active:scale-[0.99] text-ink-900 font-subheading text-subheading font-semibold transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin text-accent-600" />
                    <span>Redirecting to Google…</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            )}

            {/* Resume existing guest session if present */}
            {savedGuestUuid && (
              <button
                type="button"
                onClick={handleResumeGuest}
                className="w-full h-11 rounded-xl bg-surface-muted hover:bg-border text-ink-900 font-small text-small font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Resume previous guest session</span>
                <ArrowRight size={16} />
              </button>
            )}

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-ink-400 font-caption text-caption">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* Guest Option */}
            {!isGuestOpen ? (
              <button
                type="button"
                onClick={() => setIsGuestOpen(true)}
                className="text-center font-small text-small text-ink-600 hover:text-ink-900 font-medium py-1 transition-colors cursor-pointer"
              >
                Continue as guest without account →
              </button>
            ) : (
              <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3 pt-1">
                <div>
                  <label className="block font-small text-small font-medium text-ink-900 mb-1">
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Babatunde Adeyemi"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body outline-none focus:ring-2 focus:ring-accent-600"
                  />
                </div>
                <div>
                  <label className="block font-small text-small font-medium text-ink-900 mb-1">
                    Field of work / Study
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mechanical Engineering"
                    value={guestField}
                    onChange={(e) => setGuestField(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 font-body text-body outline-none focus:ring-2 focus:ring-accent-600"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingGuest}
                    className="flex-1 h-11 rounded-xl bg-ink-900 hover:bg-ink-800 text-white font-small text-small font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingGuest ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      "Start as Guest"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGuestOpen(false)}
                    className="px-4 h-11 rounded-xl border border-border hover:bg-surface-muted text-ink-600 font-small text-small transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <p className="text-center font-caption text-caption text-ink-400">
              Your logbook is private. We never sell your voice or transcripts.
            </p>

            <footer className="pt-2 flex items-center justify-center gap-3 text-xs text-ink-400">
              <Link href="/privacy" className="hover:text-ink-600 underline transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-ink-600 underline transition-colors">
                Terms of Service
              </Link>
            </footer>
          </section>
        </div>
      </main>
    </>
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
