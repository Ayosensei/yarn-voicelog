"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { authUser } from "@/lib/api";
import Logo from "@/components/Logo";
import { RefreshCw, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

/**
 * /auth/callback
 *
 * Supabase redirects here after Google OAuth completes.
 * Handles both:
 * 1. Returning users (is_onboarded === true) -> routes directly to /u/[uuid]
 * 2. First-time users (is_onboarded === false) -> routes to /u/[uuid]/onboarding
 *
 * Features automatic cold-start resilience & polite status indicators.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const hasHandled = useRef(false);

  const [statusMessage, setStatusMessage] = useState("Verifying your Google session…");
  const [isSlowWakeup, setIsSlowWakeup] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    // Timer to notify if server is waking up from idle
    const wakeupTimer = setTimeout(() => {
      setIsSlowWakeup(true);
    }, 3200);

    async function handleCallback() {
      const supabase = createClient();
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");

      let session = null;

      try {
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Auth callback code exchange error:", error);
          } else {
            session = data?.session;
          }
        }

        // Fallback: check if active session already exists in client
        if (!session) {
          const { data: existing } = await supabase.auth.getSession();
          session = existing?.session;
        }

        if (!session) {
          clearTimeout(wakeupTimer);
          setErrorMessage("We couldn't verify your Google session. Please try signing in again.");
          return;
        }

        const { user } = session;
        setStatusMessage("Connecting to your Yarn logbook…");

        const guestUuid =
          typeof window !== "undefined"
            ? localStorage.getItem("yarn_guest_uuid")
            : null;

        // Upsert user record via backend (merges guest entries if present)
        const yarnUser = await authUser({
          auth_user_id: user.id,
          email: user.email,
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Student",
          avatar_url: user.user_metadata?.avatar_url || null,
          google_id: user.user_metadata?.provider_id || user.id,
          guest_uuid: guestUuid || null,
        });

        clearTimeout(wakeupTimer);

        if (!yarnUser?.id) {
          throw new Error("Unable to create or retrieve your user account.");
        }

        // Cache session tokens in localStorage & cookies for instant client routing
        if (typeof window !== "undefined") {
          localStorage.setItem("yarn_user_uuid", yarnUser.id);
          localStorage.setItem(
            `yarn_onboarded_${yarnUser.id}`,
            String(Boolean(yarnUser.is_onboarded))
          );
          // Clean up guest session
          localStorage.removeItem("yarn_guest_uuid");
          document.cookie =
            "yarn_guest_uuid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = `yarn_user_uuid=${yarnUser.id}; path=/; max-age=31536000; SameSite=Lax`;
        }

        // Distinct routing based on onboarding status
        if (yarnUser.is_onboarded) {
          setStatusMessage("Welcome back! Opening your logbook…");
          // Short delay for butter-smooth visual transition
          setTimeout(() => {
            router.replace(`/u/${yarnUser.id}`);
          }, 350);
        } else {
          setStatusMessage("Account ready! Setting up your student profile…");
          setTimeout(() => {
            router.replace(`/u/${yarnUser.id}/onboarding`);
          }, 350);
        }
      } catch (err) {
        clearTimeout(wakeupTimer);
        console.error("Auth flow error:", err);
        setErrorMessage(
          err.message || "Something went wrong while connecting your account."
        );
      }
    }

    handleCallback();

    return () => clearTimeout(wakeupTimer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-gutter py-12">
      <div className="w-full max-w-[420px] bg-surface rounded-2xl border border-border p-7 shadow-[0_1px_3px_rgba(16,24,40,0.04)] flex flex-col items-center text-center">
        {/* Brand Logo */}
        <div className="mb-6">
          <Logo size={36} showWordmark />
        </div>

        {errorMessage ? (
          /* Error State */
          <div className="flex flex-col items-center gap-4 w-full animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-danger-bg border border-danger-border flex items-center justify-center text-danger">
              <AlertCircle size={24} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-subheading text-subheading font-semibold text-ink-900">
                Sign In Interrupted
              </h2>
              <p className="font-caption text-caption text-ink-600 leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-3">
              <Link
                href="/"
                className="flex-1 h-11 rounded-xl bg-accent-600 hover:bg-accent-700 text-surface font-small-medium text-small flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>Return to Home</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          /* Active Loading State */
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative flex items-center justify-center w-12 h-12">
              <div className="w-12 h-12 rounded-full border-[3px] border-accent-600/15 border-t-accent-600 animate-spin" />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-subheading text-[15px] font-semibold text-ink-900">
                {statusMessage}
              </span>
              <p className="font-caption text-caption text-ink-500">
                {isSlowWakeup
                  ? "Database is waking up from idle. Thanks for your patience!"
                  : "Securing your student account and syncing your logbook."}
              </p>
            </div>

            {isSlowWakeup && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-surface-muted border border-border text-xs text-ink-600 flex items-center gap-2">
                <RefreshCw size={12} className="animate-spin text-accent-600" />
                <span>Almost there, completing handshake…</span>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-center font-caption text-caption text-ink-400 mt-6">
        Yarn Logbook • SWEP, SIWES & IT voice logbook for Nigerian students
      </p>
    </div>
  );
}
