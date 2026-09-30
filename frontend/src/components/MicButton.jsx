"use client";

import { Mic, Square, MicOff } from "lucide-react";

export default function MicButton({ state = "idle", onClick }) {
  // state: 'idle' | 'recording' | 'denied'

  const getIcon = () => {
    switch (state) {
      case "recording":
        return <Square size={40} fill="#FFFFFF" color="#FFFFFF" />;
      case "denied":
        return <MicOff size={40} color="#FFFFFF" />;
      case "idle":
      default:
        return <Mic size={40} color="#FFFFFF" />;
    }
  };

  const getBgColor = () => {
    if (state === "denied") return "var(--danger)";
    return "var(--accent-600)";
  };

  return (
    <div style={styles.container}>
      {/* Pulse Rings behind mic button */}
      {state === "recording" && (
        <>
          <div style={{ ...styles.ring, ...styles.ring1 }} className="pulse-ring-1" />
          <div style={{ ...styles.ring, ...styles.ring2 }} className="pulse-ring-2" />
        </>
      )}

      {state === "idle" && <div style={{ ...styles.ring, ...styles.ringStatic }} />}

      {/* Main Mic Button */}
      <button
        onClick={onClick}
        aria-label={state === "recording" ? "Stop recording" : "Start recording"}
        style={{
          ...styles.button,
          backgroundColor: getBgColor(),
        }}
        className="clickable"
      >
        {getIcon()}
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "112px",
    height: "112px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  },
  button: {
    width: "112px",
    height: "112px",
    borderRadius: "var(--r-full)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "var(--shadow-2)",
    zIndex: 2,
    transition: "background-color var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease)",
  },
  ring: {
    position: "absolute",
    width: "112px",
    height: "112px",
    borderRadius: "var(--r-full)",
    backgroundColor: "var(--accent-600)",
    pointerEvents: "none",
    zIndex: 1,
  },
  ring1: {
    opacity: 0.16,
  },
  ring2: {
    opacity: 0.16,
  },
  ringStatic: {
    transform: "scale(1.15)",
    backgroundColor: "var(--accent-100)",
    opacity: 0.6,
  },
};
