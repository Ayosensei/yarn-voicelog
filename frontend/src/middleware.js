import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Guard against missing environment variables so the site never crashes with 500 MIDDLEWARE_INVOCATION_FAILED
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables."
    );
    return supabaseResponse;
  }

  const { pathname } = request.nextUrl;

  // Do not run getUser on auth callback route; allow pristine cookies to reach the route handler
  if (pathname.startsWith("/auth/callback")) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Check for guest UUID cookie
    const guestUuid = request.cookies.get("yarn_guest_uuid")?.value;
    const pathParts = pathname.split("/");
    const routeUuid = pathParts[1] === "u" ? pathParts[2] : null;

    // If accessing a /u/[uuid] route:
    if (routeUuid) {
      if (!user) {
        if (!guestUuid) {
          // Auto-set the guest cookie to the route UUID so bookmarked direct links work
          supabaseResponse.cookies.set("yarn_guest_uuid", routeUuid, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: "lax",
          });
        }
      }
    }
  } catch (err) {
    console.error("[middleware] Session refresh error:", err);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
