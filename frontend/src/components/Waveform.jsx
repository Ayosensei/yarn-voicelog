"use client";

import { useEffect, useState } from "react";

export default function Waveform({ isRecording = false, audioLevel = 0 }) {
  const barCount = 28;
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
            // Generate dynamic visual heights based on audio volume
            const randomFactor = Math.random() * 0.7 + 0.3;
            const computedHeight = Math.max(6, Math.min(36, (audioLevel || 20) * randomFactor * 1.5));
            return computedHeight;
          })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isRecording, audioLevel]);

  return (
    <div style={styles.container}>
      {bars.map((height, i) => (
        <div
          key={i}
          style={{
            ...styles.bar,
            height: `${height}px`,
            backgroundColor: isRecording ? "var(--accent-600)" : "var(--border-strong)",
          }}
        />
      ))}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
  },
  bar: {
    width: "3px",
    borderRadius: "var(--r-full)",
    transition: "height 120ms var(--ease), background-color var(--dur-fast) var(--ease)",
  },
};
