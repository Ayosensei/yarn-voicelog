import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  // If already signed in and hitting the landing page, redirect to dashboard
  if (pathname === "/" && user) {
    const url = request.nextUrl.clone();
    // The actual UUID redirect happens in the callback; here we just pass through
    // Landing page will detect session and redirect via client-side
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
