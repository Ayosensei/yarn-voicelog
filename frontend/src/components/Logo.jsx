"use client";

import Image from "next/image";

/**
 * Yarn Logo Component
 * Renders the official Yarn logo with crisp vector fidelity.
 * 
 * Props:
 * - size: number | "sm" (24px) | "md" (32px) | "lg" (40px) | "xl" (48px)
 * - variant: "badge" (circle with logo) | "mark" (standalone glyph)
 * - showWordmark: boolean (whether to show "yarn" text)
 * - className: additional wrapper classes
 */
export default function Logo({
  size = "md",
  variant = "badge",
  showWordmark = false,
  className = "",
}) {
  const pixelSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 24
      : size === "lg"
      ? 40
      : size === "xl"
      ? 48
      : 32;

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {variant === "badge" ? (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform hover:scale-105"
          aria-label="Yarn logo"
        >
          <circle cx="50" cy="50" r="50" fill="#4F46E5" />
          <path
            d="M26.7586 28.4127H46.7929C48.9627 28.4127 49.6859 30.238 48.6011 31.4062C46.996 32.9171 46.6779 33.8193 47.1545 36.1519L50.0033 46.8844L61.4027 31.2602C65.236 26.0764 75 26.9525 75 34.7647C75 43.0879 66.0316 44.037 62.9216 40.0214L50.0033 54.4045L49.1218 65.5021C49.9737 66.8309 53.9957 67.5063 66.1762 69.0796C68.8834 70.5398 66.6274 71.4889 50.3851 72H30.5919C27.9158 71.2699 28.2051 69.4446 29.4347 68.2765L31.7491 66.5242L35.5824 54.4045L29.0007 34.5456L25.6737 31.4062C24.7335 30.5301 24.5165 28.4127 26.7586 28.4127Z"
            fill="white"
          />
        </svg>
      ) : (
        <svg
          width={pixelSize}
          height={Math.round((pixelSize * 44) / 50)}
          viewBox="0 0 50 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform hover:scale-105"
          aria-label="Yarn logo mark"
        >
          <path
            d="M1.75858 0.412748H21.7929C23.9627 0.412748 24.6859 2.23801 23.6011 3.40618C21.996 4.91709 21.6779 5.81929 22.1545 8.15186L25.0033 18.8844L36.4027 3.26016C40.236 -1.92358 50 -1.04746 50 6.76466C50 15.0879 41.0316 16.037 37.9216 12.0214L25.0033 26.4045L24.1218 37.5021C24.9737 38.8309 28.9957 39.5063 41.1762 41.0796C43.8834 42.5398 41.6274 43.4889 25.3851 44H5.59186C2.91583 43.2699 3.20513 41.4446 4.43467 40.2765L6.74907 38.5242L10.5824 26.4045L4.00069 6.54563L0.673695 3.40618C-0.266523 2.53006 -0.483496 0.412748 1.75858 0.412748Z"
            fill="currentColor"
            className="text-accent-600 dark:text-accent-400"
          />
        </svg>
      )}

      {showWordmark && (
        <span className="font-heading text-heading tracking-tight text-ink-900 font-semibold lowercase">
          yarn
        </span>
      )}
    </div>
  );
}
