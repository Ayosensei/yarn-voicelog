import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * /auth/callback/route.js
 *
 * Official Next.js App Router Server Route Handler for Supabase Auth callback.
 * Handles the PKCE authorization code exchange directly on the server to prevent
 * AuthPKCECodeVerifierMissingError, syncs user profile with the backend,
 * and sets auth cookies directly in the redirect response headers.
 */
export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(
      new URL("/?message=Authentication+code+missing.+Please+try+again.", origin)
    );
  }

  // Create an intermediate response to capture updated cookies from @supabase/ssr
  let intermediateResponse = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            intermediateResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.session?.user) {
    console.error("[auth/callback] PKCE exchange error:", error);
    return NextResponse.redirect(
      new URL("/?message=Sign+in+session+expired.+Please+try+signing+in+again.", origin)
    );
  }

  const user = data.session.user;
  const guestUuid = request.cookies.get("yarn_guest_uuid")?.value || null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const res = await fetch(`${apiUrl}/api/users/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_user_id: user.id,
        email: user.email,
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Student",
        avatar_url: user.user_metadata?.avatar_url || null,
        google_id: user.user_metadata?.provider_id || user.id,
        guest_uuid: guestUuid,
      }),
    });

    if (res.ok) {
      const yarnUser = await res.json();
      const targetPath = yarnUser.is_onboarded
        ? `/u/${yarnUser.id}`
        : `/u/${yarnUser.id}/onboarding`;

      const redirectResponse = NextResponse.redirect(new URL(targetPath, origin));

      // Transfer all session cookies to the redirect response
      intermediateResponse.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c.name, c.value, c);
      });

      // Set long-lived user id cookie for fast navigation
      redirectResponse.cookies.set("yarn_user_uuid", yarnUser.id, {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });

      // Clear guest session cookie
      redirectResponse.cookies.set("yarn_guest_uuid", "", {
        path: "/",
        maxAge: 0,
      });

      return redirectResponse;
    }
  } catch (err) {
    console.error("[auth/callback] Backend sync error:", err);
  }

  // Fallback: If backend is cold-starting or temporarily unreachable,
  // still redirect user with auth cookies preserved to root
  const fallbackResponse = NextResponse.redirect(new URL("/", origin));
  intermediateResponse.cookies.getAll().forEach((c) => {
    fallbackResponse.cookies.set(c.name, c.value, c);
  });
  return fallbackResponse;
}
