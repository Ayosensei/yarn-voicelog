"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUser } from "@/lib/api";
import { Mic, Sparkles, Check, ArrowRight, KeyRound, RefreshCw, AlertCircle } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [fieldOfWork, setFieldOfWork] = useState("");
  const [existingLink, setExistingLink] = useState("");
  const [existingUser, setExistingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check if returning user already has a session on this device
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("yarn_current_user_id");
      if (savedId) {
        setExistingUser(savedId);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name to continue");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const user = await createUser({
        name: name.trim(),
        field_of_work: fieldOfWork.trim(),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("yarn_current_user_id", user.id);
      }

      router.push(`/u/${user.id}`);
    } catch (err) {
      setError("Could not create profile. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturningUser = (e) => {
    e.preventDefault();
    if (!existingLink.trim()) return;

    let targetUuid = existingLink.trim();
    // Extract UUID if full URL was pasted (e.g., http://.../u/UUID or /u/UUID)
    const match = targetUuid.match(/\/u\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      targetUuid = match[1];
    }

    if (targetUuid) {
      if (typeof window !== "undefined") {
        localStorage.setItem("yarn_current_user_id", targetUuid);
      }
      router.push(`/u/${targetUuid}`);
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex justify-center">
        <div className="w-full max-w-[480px] h-14 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-7 h-7 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C9 20 6.5 18 5.5 15.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-heading text-heading text-ink-900 tracking-tight font-semibold lowercase select-none">
              yarn
            </span>
          </div>
          {existingUser && (
            <Link
              href={`/u/${existingUser}`}
              className="text-accent-600 hover:text-accent-700 font-caption-medium text-caption flex items-center gap-1 bg-accent-50 px-2.5 py-1 rounded-full transition-colors"
            >
              Resume Workspace
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col w-full max-w-[480px] mx-auto pt-16 pb-safe px-gutter">
        <div className="flex flex-col w-full pb-10">
          {/* Top Hero Section */}
          <section className="flex flex-col pt-space-lg pb-space-xl">
            <h1 className="font-hero text-hero text-ink-900 tracking-[-0.02em]">
              Speak your day!
            </h1>
            <p className="font-body text-body text-ink-600 mt-space-sm max-w-[420px]">
              Talk through what you did at work today. Yarn turns it into a clear logbook entry in simple English.
            </p>
          </section>

          {/* How It Works Section: 3-step clean row */}
          <section className="flex items-center justify-between w-full py-space-md mb-space-2xl">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center text-accent-600 mb-1">
                <Mic size={20} />
              </div>
              <span className="font-small-medium text-small-medium text-ink-900">Speak</span>
            </div>

            {/* Connector 1 */}
            <div className="flex-1 px-1 flex items-center justify-center mb-5">
              <div className="w-full border-t border-dotted border-border-strong"></div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center text-accent-600 mb-1">
                <Sparkles size={20} />
              </div>
              <span className="font-small-medium text-small-medium text-ink-900">Yarn writes it</span>
            </div>

            {/* Connector 2 */}
            <div className="flex-1 px-1 flex items-center justify-center mb-5">
              <div className="w-full border-t border-dotted border-border-strong"></div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center text-accent-600 mb-1">
                <Check size={20} />
              </div>
              <span className="font-small-medium text-small-medium text-ink-900">Review & save</span>
            </div>
          </section>

          {/* Sign-Up Card */}
          <section className="bg-surface rounded-2xl p-space-xl border border-border shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col">
            <h2 className="font-heading text-heading text-ink-900 mb-space-lg">
              Set up your Yarn
            </h2>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-danger-bg border border-danger-border flex items-start gap-2.5 text-danger font-small text-small">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col space-y-space-lg">
              {/* Field 1: Name */}
              <div className="flex flex-col space-y-space-xs">
                <label className="font-small-medium text-small-medium text-ink-900" htmlFor="student-name">
                  Your name <span className="text-danger">*</span>
                </label>
                <input
                  id="student-name"
                  type="text"
                  placeholder="e.g. Ayooluwa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-[52px] w-full px-4 rounded-xl border border-border-strong bg-surface text-ink-900 placeholder:text-ink-400 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20 transition-colors"
                />
              </div>

              {/* Field 2: Field of work */}
              <div className="flex flex-col space-y-space-xs">
                <label className="font-small-medium text-small-medium text-ink-900" htmlFor="field-of-work">
                  What's your field of work?
                </label>
                <textarea
                  id="field-of-work"
                  placeholder="e.g. Thermal imaging in agriculture, or backend development at a fintech"
                  value={fieldOfWork}
                  onChange={(e) => setFieldOfWork(e.target.value)}
                  rows={3}
                  className="min-h-[88px] w-full p-4 rounded-xl border border-border-strong bg-surface text-ink-900 placeholder:text-ink-400 font-body text-body focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20 transition-colors resize-none leading-relaxed"
                />
                <p className="font-small text-small text-ink-600 pt-0.5">
                  Yarn uses this to match your writing style. You can change it later.
                </p>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-full bg-accent-600 hover:bg-accent-700 active:scale-[0.98] text-surface font-subheading text-subheading font-semibold transition-all flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-space-sm gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Setting up workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Get started</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Divider: or */}
          <div className="relative my-space-2xl flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative bg-background px-3 font-small text-small text-ink-600 select-none">
              or
            </div>
          </div>

          {/* Returning Student Section */}
          <section className="flex flex-col space-y-space-sm">
            <label className="font-small-medium text-small-medium text-ink-900" htmlFor="yarn-link">
              Already have a Yarn link?
            </label>
            <form onSubmit={handleReturningUser} className="flex items-center gap-space-sm">
              <input
                id="yarn-link"
                type="text"
                placeholder="Paste your link or workspace ID"
                value={existingLink}
                onChange={(e) => setExistingLink(e.target.value)}
                className="h-12 flex-1 px-3.5 rounded-xl border border-border-strong bg-surface text-ink-900 placeholder:text-ink-400 font-small text-small focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20 transition-colors"
              />
              <button
                type="submit"
                aria-label="Access existing logbook"
                className="w-12 h-12 rounded-full border border-border-strong bg-surface hover:bg-accent-50 active:bg-accent-100 text-accent-600 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer shadow-sm active:scale-95"
              >
                <ArrowRight size={20} />
              </button>
            </form>
          </section>

          {/* Reassuring Utility Footer */}
          <footer className="mt-space-3xl flex items-center justify-center gap-2 text-ink-600">
            <KeyRound size={16} className="text-accent-600 shrink-0" />
            <span className="font-caption text-caption">No password needed. Your link is your key.</span>
          </footer>
        </div>
      </main>
    </>
  );
}
