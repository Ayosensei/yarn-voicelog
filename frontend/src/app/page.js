"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/Button";
import { createUser } from "@/lib/api";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [fieldOfWork, setFieldOfWork] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

      // Save user session in localStorage for seamless return
      if (typeof window !== "undefined") {
        localStorage.setItem("yarn_current_user_id", user.id);
      }

      router.push(`/u/${user.id}`);
    } catch (err) {
      setError("Could not create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.main}>
      <div className="content-column content-column-narrow" style={styles.cardContainer}>
        {/* Brand Header */}
        <div style={styles.brandHeader}>
          <div style={styles.logoBadge}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C9 20 6.5 18 5.5 15.5"
                stroke="#4F46E5"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span style={styles.brandName}>yarn</span>
          </div>
          <span style={styles.tagline}>Speak your day!</span>
        </div>

        {/* Hero Section */}
        <div style={styles.heroSection}>
          <h1 className="hero-text" style={styles.heroHeadline}>
            Turn spoken notes into clean logbook entries.
          </h1>
          <p className="body-text" style={styles.heroSubtext}>
            Built for SIWES students. Speak your day in simple English, and Yarn structures your academic logbook automatically.
          </p>
        </div>

        {/* User Onboarding Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.fieldGroup}>
            <label htmlFor="student-name" style={styles.label}>
              Your Name <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              id="student-name"
              type="text"
              className="yarn-input"
              placeholder="e.g. Chidi Okafor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="field-of-work" style={styles.label}>
              Field of Work or Study
            </label>
            <input
              id="field-of-work"
              type="text"
              className="yarn-input"
              placeholder="e.g. Civil Engineering - Highway Construction"
              value={fieldOfWork}
              onChange={(e) => setFieldOfWork(e.target.value)}
            />
            <span style={styles.helperText}>
              Yarn uses this to tailor your automatic logbook style.
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="L"
            fullWidth
            isLoading={isSubmitting}
            trailingIcon={ArrowRight}
            style={{ marginTop: "12px" }}
          >
            Get started
          </Button>
        </form>

        {/* Features Note */}
        <div style={styles.footerNote}>
          <Sparkles size={16} color="var(--accent-600)" />
          <span>No password required. Instant UUID workspace.</span>
        </div>
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--bg)",
    padding: "var(--s-6) 0",
  },
  cardContainer: {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-xl)",
    boxShadow: "var(--shadow-1)",
    padding: "var(--s-8) var(--s-6)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-6)",
  },
  brandHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandName: {
    fontSize: "28px",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    color: "var(--ink-900)",
  },
  tagline: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--accent-600)",
    backgroundColor: "var(--accent-50)",
    padding: "4px 12px",
    borderRadius: "var(--r-full)",
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-3)",
  },
  heroHeadline: {
    color: "var(--ink-900)",
  },
  heroSubtext: {
    color: "var(--ink-600)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-5)",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-2)",
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--ink-900)",
  },
  helperText: {
    fontSize: "12px",
    color: "var(--ink-600)",
  },
  errorBox: {
    padding: "12px",
    borderRadius: "var(--r-md)",
    backgroundColor: "var(--danger-bg)",
    border: "1px solid var(--danger-border)",
    color: "var(--danger)",
    fontSize: "14px",
  },
  footerNote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "12px",
    color: "var(--ink-600)",
    marginTop: "8px",
  },
};
