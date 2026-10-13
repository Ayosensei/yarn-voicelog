"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    const supabase = createClient();

    async function handleCallback() {
      // Exchange the URL code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error || !data.session) {
        console.error("Auth callback error:", error);
        router.replace("/?message=Sign+in+failed.+Please+try+again.");
        return;
      }

      const { user } = data.session;

      try {
        // Create or fetch the Yarn user record via backend
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
            }),
          }
        );

        if (!res.ok) throw new Error("Failed to create user profile");

        const yarnUser = await res.json();
        router.replace(`/u/${yarnUser.id}`);
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
