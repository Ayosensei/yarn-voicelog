"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BookText, FileDown, Settings as SettingsIcon, ArrowLeft, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar({ title, showBack = false, userUuid = null, rightAction = null }) {
  const pathname = usePathname();
  const router = RouterHook();
  const [user, setUser] = useState(null);
  const [showSignOut, setShowSignOut] = useState(false);

  const baseUrl = userUuid ? `/u/${userUuid}` : "";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user ?? null));
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem("yarn_guest_uuid");
      document.cookie = "yarn_guest_uuid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    router.replace("/");
  };

  const navItems = [
    { label: "Logs", href: `${baseUrl}`, icon: BookText, match: (p) => p === `/u/${userUuid}` || p.includes("/log/") },
    { label: "Export", href: `${baseUrl}/export`, icon: FileDown, match: (p) => p.includes("/export") },
    { label: "Settings", href: `${baseUrl}/settings`, icon: SettingsIcon, match: (p) => p.includes("/settings") },
  ];

  const avatarUrl = user?.user_metadata?.avatar_url;
  const avatarName = user?.user_metadata?.full_name || user?.email || "U";

  return (
    <>
      {/* Top Header (56px) */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-border shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-14 max-w-[640px] mx-auto px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-sm min-w-0">
            {showBack ? (
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="p-1.5 -ml-1.5 text-ink-900 hover:bg-surface-muted rounded-full active:scale-95 transition-all shrink-0"
              >
                <ArrowLeft size={22} />
              </button>
            ) : (
              <Link href={baseUrl || "/"} className="flex items-center gap-2 shrink-0">
                <Logo size={28} showWordmark />
              </Link>
            )}
            {title && showBack && (
              <h1 className="font-subheading text-subheading font-semibold text-ink-900 truncate">
                {title}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2 relative shrink-0">
            {rightAction}

            {/* Dark mode switch */}
            <ThemeToggle className="w-9 h-9 p-0 flex items-center justify-center rounded-full" />

            {userUuid && user && (
              <div className="relative">
                <button
                  onClick={() => setShowSignOut((v) => !v)}
                  aria-label="Account menu"
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-border hover:border-accent-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-600/30 active:scale-95"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={avatarName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-accent-600 flex items-center justify-center text-white font-semibold text-xs">
                      {avatarName[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Sign-out dropdown */}
                {showSignOut && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowSignOut(false)} />
                    <div className="absolute right-0 top-10 z-50 w-48 bg-surface rounded-xl border border-border shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2.5 border-b border-border bg-surface-muted/40">
                        <p className="font-caption-medium text-caption text-ink-900 truncate">{user?.user_metadata?.full_name || "Signed in"}</p>
                        <p className="font-caption text-caption text-ink-400 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-3 py-2.5 flex items-center gap-2 text-danger font-small text-small hover:bg-danger-bg transition-colors"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      {userUuid && (
        <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/95 backdrop-blur-xl border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.06)] block md:hidden">
          <div className="h-16 max-w-[640px] mx-auto px-gutter flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(pathname);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`min-w-[48px] min-h-[48px] px-3 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    isActive ? "text-accent-600 font-semibold" : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  <Icon size={22} />
                  <span className="font-caption text-caption">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}

function RouterHook() {
  try {
    return useRouter();
  } catch (e) {
    return { back: () => {}, replace: () => {} };
  }
}
