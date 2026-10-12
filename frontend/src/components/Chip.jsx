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
      <span className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full bg-accent-50 border border-accent-200 text-accent-700 font-small-medium text-small">
        <span>{label}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-accent-200/50 transition-colors text-accent-700 active:scale-95"
          >
            <X size={13} />
          </button>
        )}
      </span>
    );
  }

  // Filter Chip
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center h-9 px-4 rounded-full border text-small font-small-medium transition-all active:scale-95 ${
        selected
          ? "border-accent-200 bg-accent-50 text-accent-700 font-semibold"
          : "border-border bg-surface text-ink-900 hover:bg-surface-muted"
      }`}
    >
      {label}
    </button>
  );
}
