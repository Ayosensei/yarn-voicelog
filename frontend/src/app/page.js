"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mic, Sparkles, Check, RefreshCw, AlertCircle } from "lucide-react";

// Google "G" logo SVG
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

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState(searchParams.get("message") || "");

  // Check if user is already signed in → redirect to dashboard
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Fetch their Yarn UUID from backend then redirect
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/by-auth/${user.id}`)
          .then((r) => r.ok ? r.json() : null)
          .then((yarnUser) => {
            if (yarnUser?.id) {
              router.replace(`/u/${yarnUser.id}`);
            } else {
              setIsCheckingSession(false);
            }
          })
          .catch(() => setIsCheckingSession(false));
      } else {
        setIsCheckingSession(false);
      }
    });
  }, [router]);

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
    // If no error, browser will redirect to Google — no further action needed
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-[3px] border-accent-600/20 border-t-accent-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex justify-center">
        <div className="w-full max-w-[480px] h-14 px-gutter flex items-center">
          <div className="flex items-center gap-space-sm">
            <div className="w-7 h-7 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C9 20 6.5 18 5.5 15.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-heading text-heading text-ink-900 tracking-tight font-semibold lowercase select-none">
              yarn
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col w-full max-w-[480px] mx-auto pt-16 pb-safe px-gutter">
        <div className="flex flex-col w-full pb-10">

          {/* Hero Section */}
          <section className="flex flex-col pt-space-lg pb-space-xl">
            <h1 className="font-hero text-hero text-ink-900 tracking-[-0.02em]">
              Speak your day!
            </h1>
            <p className="font-body text-body text-ink-600 mt-space-sm max-w-[420px]">
              Talk through what you did at work today. Yarn turns it into a clear logbook entry in simple English.
            </p>
          </section>

          {/* How It Works: 3-step row */}
          <section className="flex items-center justify-between w-full py-space-md mb-space-2xl">
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center text-accent-600 mb-1">
                <Mic size={20} />
              </div>
              <span className="font-small-medium text-small-medium text-ink-900">Speak</span>
            </div>
            <div className="flex-1 px-1 flex items-center justify-center mb-5">
              <div className="w-full border-t border-dotted border-border-strong"></div>
            </div>
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center text-accent-600 mb-1">
                <Sparkles size={20} />
              </div>
              <span className="font-small-medium text-small-medium text-ink-900">Yarn writes it</span>
            </div>
            <div className="flex-1 px-1 flex items-center justify-center mb-5">
              <div className="w-full border-t border-dotted border-border-strong"></div>
            </div>
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center text-accent-600 mb-1">
                <Check size={20} />
              </div>
              <span className="font-small-medium text-small-medium text-ink-900">Review & save</span>
            </div>
          </section>

          {/* Sign-In Card */}
          <section className="bg-surface rounded-2xl p-space-xl border border-border shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col gap-space-lg">
            <div>
              <h2 className="font-heading text-heading text-ink-900">
                Start your logbook
              </h2>
              <p className="font-small text-small text-ink-600 mt-1">
                Sign in with Google to save your entries and access them from any device.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-danger-bg border border-danger-border flex items-start gap-2.5 text-danger font-small text-small">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-14 rounded-full bg-surface border-2 border-border-strong hover:border-accent-600 hover:bg-accent-50 active:scale-[0.98] text-ink-900 font-subheading text-subheading font-semibold transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

            <p className="text-center font-caption text-caption text-ink-400">
              Your logbook is private. We never share your data.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
