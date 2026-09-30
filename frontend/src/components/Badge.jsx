"use client";

import { Check, PenLine, Lock } from "lucide-react";

export default function Badge({ type = "saved", label }) {
  // type: 'saved' | 'draft' | 'confidential' | 'optional'

  const getConfig = () => {
    switch (type) {
      case "saved":
        return {
          bg: "var(--success-bg)",
          color: "var(--success)",
          border: "1px solid var(--success-border)",
          icon: Check,
          defaultLabel: "Saved",
        };
      case "draft":
        return {
          bg: "var(--warning-bg)",
          color: "var(--warning)",
          border: "1px solid var(--warning-border)",
          icon: PenLine,
          defaultLabel: "Draft",
        };
      case "confidential":
        return {
          bg: "var(--surface-muted)",
          color: "var(--ink-600)",
          border: "1px solid var(--border)",
          icon: Lock,
          defaultLabel: "Confidential",
        };
      case "optional":
      default:
        return {
          bg: "var(--surface-muted)",
          color: "var(--ink-600)",
          border: "1px solid var(--border)",
          icon: null,
          defaultLabel: "Optional",
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const displayText = label || config.defaultLabel;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        height: "24px",
        padding: "0 10px",
        borderRadius: "var(--r-full)",
        backgroundColor: config.bg,
        color: config.color,
        border: config.border,
        fontSize: "12px",
        fontWeight: 600,
        lineHeight: "16px",
      }}
    >
      {Icon && <Icon size={12} strokeWidth={2.5} />}
      <span>{displayText}</span>
    </div>
  );
}
