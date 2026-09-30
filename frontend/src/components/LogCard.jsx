"use client";

import Link from "next/link";
import Badge from "./Badge";

export default function LogCard({ log, userUuid }) {
  if (!log) return null;

  const { id, date, processed_output, raw_transcript, is_confidential, is_draft } = log;

  // Format date e.g. "Tuesday, 30 Sep"
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    } catch (e) {
      return dateStr;
    }
  };

  // Word count calculation
  const wordCount = (processed_output || "").split(/\s+/).filter(Boolean).length;

  // 2-line preview clean text
  const previewText = is_confidential
    ? "Confidential entry — Raw text restricted for privacy."
    : (processed_output || raw_transcript || "").replace(/[#*`_]/g, "").slice(0, 140);

  return (
    <Link
      href={`/u/${userUuid}/log/${id}`}
      style={styles.card}
      className="clickable"
    >
      <div style={styles.headerRow}>
        <span style={styles.dateText}>{formatDate(date)}</span>
        <div style={styles.badgeRow}>
          {is_confidential && <Badge type="confidential" />}
          {is_draft ? <Badge type="draft" /> : <Badge type="saved" />}
        </div>
      </div>

      <p style={styles.previewText}>{previewText || "No content"}</p>

      <div style={styles.footerRow}>
        <span style={styles.wordCount}>{wordCount} words</span>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    display: "block",
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    boxShadow: "var(--shadow-1)",
    padding: "16px",
    textDecoration: "none",
    color: "inherit",
    transition: "border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  dateText: {
    fontSize: "16px",
    fontWeight: 600,
    color: "var(--ink-900)",
    fontVariantNumeric: "tabular-nums",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  previewText: {
    fontSize: "14px",
    lineHeight: "20px",
    color: "var(--ink-600)",
    marginBottom: "12px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  footerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordCount: {
    fontSize: "12px",
    color: "var(--ink-600)",
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
  },
};
