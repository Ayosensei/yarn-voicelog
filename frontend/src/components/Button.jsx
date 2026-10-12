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
  className = "",
  ...props
}) {
  const isDisableOrLoading = disabled || isLoading;

  const getVariantClasses = () => {
    if (isDisableOrLoading) {
      return "bg-surface-muted text-ink-400 cursor-not-allowed border-transparent shadow-none";
    }
    switch (variant) {
      case "primary":
        return "bg-accent-600 hover:bg-accent-700 active:scale-[0.98] text-surface shadow-sm";
      case "secondary":
        return "bg-surface hover:bg-surface-muted active:scale-[0.98] text-ink-900 border border-border shadow-sm";
      case "ghost":
        return "bg-transparent hover:bg-surface-muted active:scale-[0.98] text-accent-600 hover:text-accent-700";
      case "destructive":
        return "bg-surface hover:bg-danger-bg active:scale-[0.98] text-danger border border-danger/40";
      default:
        return "bg-accent-600 text-surface";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "L":
        return "h-14 px-6 font-subheading text-subheading";
      case "S":
        return "h-10 px-4 font-small-medium text-small";
      case "M":
      default:
        return "h-12 px-5 font-subheading text-subheading";
    }
  };

  return (
    <button
      type={type}
      disabled={isDisableOrLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all select-none ${
        fullWidth ? "w-full" : "w-auto"
      } ${getSizeClasses()} ${getVariantClasses()} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === "S" ? 16 : 20} className="animate-spin" />
      ) : (
        LeadingIcon && <LeadingIcon size={size === "S" ? 16 : 20} />
      )}
      <span>{children}</span>
      {!isLoading && TrailingIcon && <TrailingIcon size={size === "S" ? 16 : 20} />}
    </button>
  );
}
