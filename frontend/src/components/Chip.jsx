"use client";

import { X } from "lucide-react";

export default function Chip({
  label,
  variant = "filter", // 'filter' | 'vocab'
  selected = false,
  onRemove,
  onClick,
}) {
  if (variant === "vocab") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          height: "32px",
          padding: "0 10px 0 12px",
          borderRadius: "var(--r-full)",
          backgroundColor: "var(--accent-50)",
          color: "var(--accent-700)",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        <span>{label}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-700)",
              padding: "2px",
              margin: "-2px",
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  // Filter Chip
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "36px",
        padding: "0 16px",
        borderRadius: "var(--r-full)",
        border: selected ? "1px solid var(--accent-200)" : "1px solid var(--border-strong)",
        backgroundColor: selected ? "var(--accent-50)" : "var(--surface)",
        color: selected ? "var(--accent-700)" : "var(--ink-900)",
        fontSize: "14px",
        fontWeight: selected ? 600 : 400,
        cursor: "pointer",
        transition: "all var(--dur-fast) var(--ease)",
      }}
      className="clickable"
    >
      {label}
    </button>
  );
}
