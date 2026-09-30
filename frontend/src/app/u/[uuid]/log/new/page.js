"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MicButton from "@/components/MicButton";
import Waveform from "@/components/Waveform";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { processVoiceInput, createLog } from "@/lib/api";
import { Sparkles, Lock, Upload, AlertTriangle, RefreshCw } from "lucide-react";

export default function NewLogPage() {
  const params = useParams();
  const router = useRouter();
  const userUuid = params.uuid;

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState("idle"); // 'idle' | 'recording' | 'denied'
  const [transcript, setTranscript] = useState("");
  const [isConfidential, setIsConfidential] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Web Speech API Initialization
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(currentTranscript.trim());
      };

      recognitionRef.current.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setRecordingState("denied");
          setToastMessage("Microphone permission denied. You can upload a voice file instead.");
        }
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };
    } else {
      setRecordingState("denied");
    }
  }, [isRecording]);

  // Timer logic
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Handle Mic Toggle
  const toggleRecording = () => {
    if (recordingState === "denied") {
      setToastMessage("Mic access blocked. Please upload a recording or check browser settings.");
      return;
    }

    if (!isRecording) {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        setRecordingState("recording");
      } catch (e) {
        setIsRecording(true);
        setRecordingState("recording");
      }
    } else {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsRecording(false);
      setRecordingState("idle");
    }
  };

  // Format mm:ss timer
  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  // Handle File Upload Fallback
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setToastMessage(`Voice file "${file.name}" attached.`);
    }
  };

  // Generate Logbook Entry Trigger
  const handleGenerateLog = async () => {
    if (!transcript.trim() && !audioFile) {
      setToastMessage("Please speak your notes or upload an audio file first.");
      return;
    }

    setIsProcessing(true);

    try {
      // Process voice with Gemini / Whisper backend
      const response = await processVoiceInput({
        user_uuid: userUuid,
        transcript: transcript,
        audio_file: audioFile,
      });

      // Save created log entry
      const newLog = await createLog({
        user_id: userUuid,
        date: date,
        raw_transcript: isConfidential ? null : transcript,
        processed_output: response.processed_text,
        is_confidential: isConfidential,
      });

      router.push(`/u/${userUuid}/log/${newLog.id}`);
    } catch (err) {
      setToastMessage("Generation failed. Your words are safe. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navbar userUuid={userUuid} showBack title="New Log" />

      <main className="content-column">
        {/* Date Selector */}
        <div style={styles.dateRow}>
          <label htmlFor="log-date" style={styles.dateLabel}>
            Logbook Date:
          </label>
          <input
            id="log-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="yarn-input"
            style={{ width: "auto", height: "40px", fontSize: "14px" }}
          />
        </div>

        {/* Mic & Waveform Unit */}
        <div style={styles.micSection}>
          <MicButton state={recordingState} onClick={toggleRecording} />

          {/* Recording Timer */}
          <div className="display-text" style={styles.timer}>
            {formatTimer(seconds)}
          </div>

          {/* Waveform Visualizer */}
          <div style={{ width: "100%", maxWidth: "360px" }}>
            <Waveform isRecording={isRecording} audioLevel={isRecording ? 25 : 0} />
          </div>

          <p className="caption-text" style={{ color: "var(--ink-600)" }}>
            {isRecording ? "Tap red square to stop" : "Tap mic to speak your day"}
          </p>
        </div>

        {/* Mic Permission Warning Box (If Denied) */}
        {recordingState === "denied" && (
          <div style={styles.warningBox}>
            <AlertTriangle size={18} color="var(--warning)" />
            <span>
              Yarn can't hear you yet. Allow microphone access in your browser settings, or upload a voice memo below.
            </span>
          </div>
        )}

        {/* Live Transcript Card */}
        <div className="yarn-card" style={styles.transcriptCard}>
          <div style={styles.cardHeaderRow}>
            <span className="overline-text" style={{ color: "var(--ink-600)" }}>
              LIVE TRANSCRIPT
            </span>
            {isRecording && <span style={styles.liveDot} />}
          </div>

          <textarea
            className="yarn-textarea"
            style={styles.transcriptInput}
            placeholder="Your words will appear here as you speak. You can also type or edit directly."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
        </div>

        {/* Confidential Toggle & Audio Upload Fallback */}
        <div style={styles.optionsBlock}>
          {/* Confidential Mode Switch */}
          <div className="yarn-card" style={styles.optionRow}>
            <div style={styles.optionInfo}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Lock size={16} color="var(--ink-900)" />
                <span className="subheading-text" style={{ fontSize: "14px" }}>
                  Mark as confidential
                </span>
              </div>
              <span className="caption-text" style={{ color: "var(--ink-600)" }}>
                Audio and raw text deleted immediately. Saves only final output.
              </span>
            </div>

            <label style={styles.toggleTrack}>
              <input
                type="checkbox"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                style={styles.toggleInput}
              />
              <span style={{ ...styles.toggleThumb, left: isConfidential ? "24px" : "4px" }} />
            </label>
          </div>

          {/* Upload Fallback button */}
          <div style={styles.uploadRow}>
            <label htmlFor="voice-file-upload" className="clickable" style={styles.uploadBtn}>
              <Upload size={16} color="var(--accent-600)" />
              <span>{audioFile ? audioFile.name : "Or upload voice memo (MP3/M4A)"}</span>
              <input
                id="voice-file-upload"
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div style={styles.stickyActionBar}>
        <div style={styles.actionBarInner}>
          <Button
            variant="primary"
            size="L"
            fullWidth
            isLoading={isProcessing}
            leadingIcon={Sparkles}
            onClick={handleGenerateLog}
          >
            Generate Logbook Entry
          </Button>
        </div>
      </div>

      <Toast message={toastMessage} isOpen={!!toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}

const styles = {
  dateRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "var(--s-5)",
  },
  dateLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--ink-900)",
  },
  micSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--s-4)",
    marginBottom: "var(--s-6)",
  },
  timer: {
    color: "var(--ink-900)",
    marginTop: "8px",
  },
  warningBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "var(--r-md)",
    backgroundColor: "var(--warning-bg)",
    border: "1px solid var(--warning-border)",
    color: "var(--warning)",
    fontSize: "14px",
    marginBottom: "var(--s-5)",
  },
  transcriptCard: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-3)",
    minHeight: "180px",
    marginBottom: "var(--s-5)",
  },
  cardHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "var(--r-full)",
    backgroundColor: "var(--danger)",
    animation: "micPulse 1.2s infinite",
  },
  transcriptInput: {
    border: "none",
    padding: 0,
    backgroundColor: "transparent",
    minHeight: "120px",
    boxShadow: "none",
    outline: "none",
  },
  optionsBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-4)",
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px var(--s-5)",
  },
  optionInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  toggleTrack: {
    position: "relative",
    width: "52px",
    height: "32px",
    borderRadius: "var(--r-full)",
    backgroundColor: "var(--border-strong)",
    cursor: "pointer",
    flexShrink: 0,
  },
  toggleInput: {
    display: "none",
  },
  toggleThumb: {
    position: "absolute",
    top: "4px",
    width: "24px",
    height: "24px",
    borderRadius: "var(--r-full)",
    backgroundColor: "#FFFFFF",
    transition: "left var(--dur-fast) var(--ease)",
  },
  uploadRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--accent-600)",
    fontSize: "14px",
    fontWeight: 500,
    padding: "8px 16px",
    borderRadius: "var(--r-full)",
    backgroundColor: "var(--accent-50)",
    cursor: "pointer",
  },
  stickyActionBar: {
    position: "fixed",
    bottom: "calc(64px + env(safe-area-inset-bottom))",
    left: 0,
    right: 0,
    backgroundColor: "var(--surface)",
    borderTop: "1px solid var(--border)",
    boxShadow: "var(--shadow-2)",
    padding: "12px var(--s-5) env(safe-area-inset-bottom)",
    zIndex: 30,

    "@media (min-width: 768px)": {
      bottom: 0,
    },
  },
  actionBarInner: {
    maxWidth: "640px",
    margin: "0 auto",
  },
};
