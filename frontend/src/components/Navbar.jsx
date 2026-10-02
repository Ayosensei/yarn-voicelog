"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookText, FileDown, Settings as SettingsIcon, ArrowLeft } from "lucide-react";

export default function Navbar({ title, showBack = false, userUuid = null, rightAction = null }) {
  const pathname = usePathname();
  const router = RouterHook();

  const baseUrl = userUuid ? `/u/${userUuid}` : "";

  const navItems = [
    { label: "Logs", href: `${baseUrl}`, icon: BookText, match: (p) => p === `/u/${userUuid}` || p.includes("/log/") },
    { label: "Export", href: `${baseUrl}/export`, icon: FileDown, match: (p) => p.includes("/export") },
    { label: "Settings", href: `${baseUrl}/settings`, icon: SettingsIcon, match: (p) => p.includes("/settings") },
  ];

  return (
    <>
      {/* Top Header (56px) */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-14 max-w-[640px] mx-auto px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            {showBack ? (
              <button 
                onClick={() => router.back()} 
                aria-label="Go back" 
                className="p-1 -ml-1 text-ink-900 active:scale-95 transition-transform"
              >
                <ArrowLeft size={24} />
              </button>
            ) : (
              <Link href={baseUrl || "/"} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C9 20 6.5 18 5.5 15.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="font-heading text-heading tracking-tight text-ink-900 font-semibold lowercase">yarn</span>
              </Link>
            )}
            {title && showBack && <h1 className="font-subheading text-subheading font-semibold text-ink-900">{title}</h1>}
          </div>

          <div className="flex items-center gap-space-md">
             {rightAction || (
               userUuid && (
                 <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <circle cx="12" cy="8" r="5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                     <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                   </svg>
                 </div>
               )
             )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      {userUuid && (
        <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)] block md:hidden">
          <div className="h-16 max-w-[640px] mx-auto px-gutter flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(pathname);
              return (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${isActive ? "text-accent-600 font-semibold" : "text-ink-600 hover:text-ink-900"}`}
                >
                  <Icon size={24} />
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
    return { back: () => {} };
  }
}
