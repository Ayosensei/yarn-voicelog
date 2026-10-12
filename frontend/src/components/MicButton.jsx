"use client";

import { Mic, Square, MicOff } from "lucide-react";

export default function MicButton({ state = "idle", onClick }) {
  // state: 'idle' | 'recording' | 'denied'

  const isRecording = state === "recording";
  const isDenied = state === "denied";

  return (
    <div className="relative flex items-center justify-center w-[176px] h-[176px] my-2 select-none">
      {/* Concentric rings when recording */}
      {isRecording && (
        <>
          <div
            className="absolute inset-0 rounded-full bg-accent-600/10 animate-ping pointer-events-none"
            style={{ animationDuration: "2.4s" }}
          />
          <div className="absolute w-[144px] h-[144px] rounded-full bg-accent-600/15 pointer-events-none" />
        </>
      )}

      {/* Gentle ambient halo when idle */}
      {!isRecording && !isDenied && (
        <div className="absolute w-[136px] h-[136px] rounded-full bg-accent-50/80 pointer-events-none transition-all duration-300" />
      )}

      {/* Subtle warning ring when permission denied */}
      {isDenied && (
        <div className="absolute w-[144px] h-[144px] rounded-full bg-danger/10 pointer-events-none" />
      )}

      {/* Core Trigger Button */}
      <button
        onClick={onClick}
        type="button"
        aria-label={isRecording ? "Stop recording work log" : isDenied ? "Microphone access denied" : "Start recording work log"}
        className={`relative z-10 w-[112px] h-[112px] rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 focus:outline-none ${
          isDenied
            ? "bg-danger hover:bg-danger/90 shadow-[0_4px_16px_rgba(220,38,38,0.35)]"
            : isRecording
            ? "bg-accent-600 hover:bg-accent-700 shadow-[0_4px_16px_rgba(79,70,229,0.35)]"
            : "bg-accent-600 hover:bg-accent-700 shadow-[0_4px_16px_rgba(79,70,229,0.25)] hover:scale-105"
        }`}
      >
        {isRecording ? (
          <span className="w-8 h-8 rounded bg-surface block shadow-sm" />
        ) : isDenied ? (
          <MicOff size={38} className="text-surface" />
        ) : (
          <Mic size={40} className="text-surface" />
        )}
      </button>
    </div>
  );
}
