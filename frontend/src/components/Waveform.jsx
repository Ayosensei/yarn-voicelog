"use client";

import { useEffect, useState } from "react";

export default function Waveform({ isRecording = false, audioLevel = 0 }) {
  const barCount = 24;
  const [bars, setBars] = useState(Array(barCount).fill(4));

  useEffect(() => {
    if (!isRecording) {
      setBars(Array(barCount).fill(4));
      return;
    }

    const interval = setInterval(() => {
      setBars(
        Array(barCount)
          .fill(0)
          .map(() => {
            const randomFactor = Math.random() * 0.7 + 0.3;
            const computedHeight = Math.max(6, Math.min(38, (audioLevel || 22) * randomFactor * 1.5));
            return Math.round(computedHeight);
          })
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isRecording, audioLevel]);

  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center gap-[3px] h-10 w-full my-2 px-4 select-none"
    >
      {bars.map((height, i) => (
        <span
          key={i}
          style={{ height: `${height}px` }}
          className={`w-[3px] rounded-full transition-all duration-200 ${
            isRecording ? "bg-accent-600" : "bg-border-strong/70"
          }`}
        />
      ))}
    </div>
  );
}
