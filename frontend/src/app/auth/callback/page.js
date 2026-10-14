"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * /auth/callback
 *
 * Supabase redirects here after Google OAuth.
 * We exchange the code for a session, then call the backend to create/fetch
 * the user record, and finally redirect to their dashboard /u/[uuid].
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const supabase = createClient();

    async function handleCallback() {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");

      let session = null;

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Auth callback code exchange error:", error);
        } else {
          session = data?.session;
        }
      }

      // Fallback: check if session already exists
      if (!session) {
        const { data: existingSession } = await supabase.auth.getSession();
        session = existingSession?.session;
      }

      if (!session) {
        console.error("No valid session found after callback");
        router.replace("/?message=Sign+in+failed.+Please+try+again.");
        return;
      }

      const { user } = session;

      try {
        const guestUuid = typeof window !== "undefined" ? localStorage.getItem("yarn_guest_uuid") : null;

        // Create or fetch the Yarn user record via backend (merging guest data if present)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/auth`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              auth_user_id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Student",
              avatar_url: user.user_metadata?.avatar_url || null,
              google_id: user.user_metadata?.provider_id || user.id,
              guest_uuid: guestUuid || null,
            }),
          }
        );

        if (!res.ok) throw new Error("Failed to create user profile");

        const yarnUser = await res.json();

        // Clear guest session since account is now linked to Google OAuth
        if (typeof window !== "undefined") {
          localStorage.removeItem("yarn_guest_uuid");
          document.cookie = "yarn_guest_uuid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }

        // Redirect to onboarding if profile is not yet onboarded
        if (!yarnUser.is_onboarded) {
          router.replace(`/u/${yarnUser.id}/onboarding`);
        } else {
          router.replace(`/u/${yarnUser.id}`);
        }
      } catch (err) {
        console.error("User creation error:", err);
        router.replace("/?message=Account+setup+failed.+Please+try+again.");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Spinner */}
        <div className="w-10 h-10 rounded-full border-[3px] border-accent-600/20 border-t-accent-600 animate-spin" />
        <p className="font-subheading text-subheading text-ink-600">
          Setting up your account…
        </p>
      </div>
    </div>
  );
}
