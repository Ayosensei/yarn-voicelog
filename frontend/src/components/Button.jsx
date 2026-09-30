"use client";

import { Loader2 } from "lucide-react";

export default function Button({
  variant = "primary", // 'primary' | 'secondary' | 'ghost' | 'destructive'
  size = "M",         // 'L' (56px) | 'M' (48px) | 'S' (40px)
  fullWidth = false,
  leadingIcon: LeadingIcon = null,
  trailingIcon: TrailingIcon = null,
  isLoading = false,
  disabled = false,
  onClick,
  children,
  type = "button",
  style = {},
  ...props
}) {
  const isDisableOrLoading = disabled || isLoading;

  const getVariantStyles = () => {
    if (isDisableOrLoading) {
      return {
        backgroundColor: "var(--surface-muted)",
        color: "var(--ink-400)",
        border: "none",
        boxShadow: "none",
        cursor: "not-allowed",
      };
    }
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "var(--accent-600)",
          color: "#FFFFFF",
          border: "none",
        };
      case "secondary":
        return {
          backgroundColor: "var(--surface)",
          color: "var(--ink-900)",
          border: "1px solid var(--border-strong)",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: "var(--accent-600)",
          border: "none",
        };
      case "destructive":
        return {
          backgroundColor: "var(--surface)",
          color: "var(--danger)",
          border: "1px solid var(--danger)",
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "L":
        return { height: "56px", padding: "0 24px", fontSize: "16px" };
      case "S":
        return { height: "40px", padding: "0 16px", fontSize: "14px" };
      case "M":
      default:
        return { height: "48px", padding: "0 24px", fontSize: "16px" };
    }
  };

  return (
    <button
      type={type}
      disabled={isDisableOrLoading}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        borderRadius: "var(--r-full)",
        fontWeight: 600,
        width: fullWidth ? "100%" : "auto",
        transition: "all var(--dur-fast) var(--ease)",
        cursor: isDisableOrLoading ? "not-allowed" : "pointer",
        ...getSizeStyles(),
        ...getVariantStyles(),
        ...style,
      }}
      className={!isDisableOrLoading ? "clickable" : ""}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === "S" ? 18 : 20} className="animate-spin" />
      ) : (
        LeadingIcon && <LeadingIcon size={size === "S" ? 18 : 20} />
      )}
      <span>{children}</span>
      {!isLoading && TrailingIcon && <TrailingIcon size={size === "S" ? 18 : 20} />}
    </button>
  );
}
