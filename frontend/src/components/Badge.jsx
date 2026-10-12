"use client";

import { Check, PenLine, Lock } from "lucide-react";

export default function Badge({ type = "saved", label }) {
  // type: 'saved' | 'draft' | 'confidential' | 'optional'

  const getConfig = () => {
    switch (type) {
      case "saved":
        return {
          className: "bg-success-bg text-success border-success-border",
          icon: Check,
          defaultLabel: "Saved",
        };
      case "draft":
        return {
          className: "bg-warning-bg text-warning border-warning-border",
          icon: PenLine,
          defaultLabel: "Draft",
        };
      case "confidential":
        return {
          className: "bg-surface-muted text-ink-600 border-border",
          icon: Lock,
          defaultLabel: "Confidential",
        };
      case "optional":
      default:
        return {
          className: "bg-surface-muted text-ink-600 border-border",
          icon: null,
          defaultLabel: "Optional",
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const displayText = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1 h-6 px-2.5 rounded-full border font-caption-medium text-caption select-none ${config.className}`}
    >
      {Icon && <Icon size={12} strokeWidth={2.5} />}
      <span>{displayText}</span>
    </span>
  );
}
