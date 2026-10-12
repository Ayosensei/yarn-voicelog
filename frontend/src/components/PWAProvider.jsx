"use client";

import { useEffect, useState } from "react";
import { WifiOff, Download, X } from "lucide-react";

export default function PWAProvider({ children }) {
  const [isOffline, setIsOffline] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Service Worker registration failed:", error);
          });
      });
    }

    // Network connectivity listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    // Capture PWA install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show install banner if user hasn't dismissed it in this session
      const dismissed = sessionStorage.getItem("yarn_pwa_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("yarn_pwa_dismissed", "true");
  };

  return (
    <>
      {/* Offline Alert Strip */}
      {isOffline && (
        <div className="fixed top-0 inset-x-0 z-[60] bg-warning-bg border-b border-warning-border py-1.5 px-4 text-warning font-caption-medium text-caption flex items-center justify-center gap-2 shadow-sm animate-in fade-in duration-200">
          <WifiOff size={14} className="shrink-0" />
          <span>You are offline. Yarn will use locally cached data until connection returns.</span>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && installPrompt && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[55] w-[90%] max-w-[420px] bg-surface rounded-2xl border border-accent-200 shadow-xl p-3.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600 shrink-0 shadow-sm">
              <Download size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-small-medium text-small text-ink-900 font-semibold truncate">
                Install Yarn App
              </span>
              <span className="font-caption text-caption text-ink-600 truncate">
                Fast voice logging on your home screen
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="h-8 px-3 rounded-full bg-accent-600 text-surface font-caption-medium text-caption hover:bg-accent-700 active:scale-95 transition-all shadow-sm"
            >
              Install
            </button>
            <button
              type="button"
              onClick={handleDismissInstall}
              aria-label="Dismiss banner"
              className="p-1 rounded-full text-ink-400 hover:text-ink-600 hover:bg-surface-muted transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
