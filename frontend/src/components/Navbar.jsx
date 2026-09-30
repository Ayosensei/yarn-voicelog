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
      <header style={styles.topHeader}>
        <div style={styles.topHeaderInner}>
          <div style={styles.topLeft}>
            {showBack ? (
              <button onClick={() => router.back()} aria-label="Go back" style={styles.backBtn} className="clickable">
                <ArrowLeft size={24} color="var(--ink-900)" />
              </button>
            ) : (
              <Link href={baseUrl || "/"} style={styles.brandGroup}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C9 20 6.5 18 5.5 15.5" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={styles.wordmark}>yarn</span>
              </Link>
            )}
            {title && showBack && <h1 style={styles.pageTitle}>{title}</h1>}
          </div>

          {/* Desktop Nav Links (Visible ≥768px) */}
          {userUuid && (
            <nav style={styles.desktopNav}>
              {navItems.map((item) => {
                const isActive = item.match(pathname);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      ...styles.desktopNavLink,
                      color: isActive ? "var(--accent-600)" : "var(--ink-600)",
                      borderBottom: isActive ? "2px solid var(--accent-600)" : "2px solid transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div style={styles.topRight}>{rightAction}</div>
        </div>
      </header>

      {/* Mobile Bottom Nav (64px + safe area) - Visible <768px */}
      {userUuid && (
        <nav style={styles.bottomNav}>
          <div style={styles.bottomNavInner}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(pathname);
              const activeColor = isActive ? "var(--accent-600)" : "var(--ink-600)";
              return (
                <Link key={item.label} href={item.href} style={styles.bottomNavItem}>
                  <Icon size={24} color={activeColor} />
                  <span style={{ ...styles.bottomNavLabel, color: activeColor, fontWeight: isActive ? 600 : 400 }}>
                    {item.label}
                  </span>
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

const styles = {
  topHeader: {
    height: "56px",
    backgroundColor: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    zIndex: 40,
    width: "100%",
  },
  topHeaderInner: {
    maxWidth: "640px",
    margin: "0 auto",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 var(--s-5)",
  },
  topLeft: {
    display: "flex",
    alignItems: "center",
    gap: "var(--s-3)",
  },
  backBtn: {
    background: "none",
    border: "none",
    padding: "var(--s-2)",
    margin: "-var(--s-2)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  wordmark: {
    fontFamily: "var(--font)",
    fontWeight: 600,
    fontSize: "20px",
    letterSpacing: "-0.02em",
    color: "var(--ink-900)",
  },
  pageTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "var(--ink-900)",
    letterSpacing: "-0.01em",
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "var(--s-2)",
  },
  desktopNav: {
    display: "none",
    gap: "var(--s-6)",

    "@media (min-width: 768px)": {
      display: "flex",
    },
  },
  desktopNavLink: {
    fontSize: "14px",
    fontWeight: 500,
    padding: "16px 0",
    textDecoration: "none",
    transition: "all var(--dur-fast) var(--ease)",
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "calc(64px + env(safe-area-inset-bottom))",
    backgroundColor: "var(--surface)",
    borderTop: "1px solid var(--border)",
    zIndex: 40,
    paddingBottom: "env(safe-area-inset-bottom)",
  },
  bottomNavInner: {
    maxWidth: "640px",
    margin: "0 auto",
    height: "64px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
  },
  bottomNavItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    textDecoration: "none",
  },
  bottomNavLabel: {
    fontSize: "12px",
    lineHeight: "16px",
  },
};
