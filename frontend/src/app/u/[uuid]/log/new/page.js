"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MicButton from "@/components/MicButton";
import Waveform from "@/components/Waveform";
import Toast from "@/components/Toast";
import { processVoiceInput, createLog, getUserProfile } from "@/lib/api";
import { Sparkles, Lock, Upload, AlertTriangle, RefreshCw, GraduationCap, Sliders } from "lucide-react";

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
  const [trainingType, setTrainingType] = useState("siwes");
  const [logLengthLines, setLogLengthLines] = useState("2-3");

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const isRecordingRef = useRef(false); // stable ref so onend closure always reads latest value

  // Web Speech API Initialization — runs ONCE on mount
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setRecordingState("denied");
          setToastMessage("Microphone permission denied. You can upload a voice file instead.");
        }
      };

      // Use ref (not closure) so this always reads the live recording state
      recognition.onend = () => {
        if (isRecordingRef.current) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    } else {
      setRecordingState("denied");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← no deps: init once only

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
      } catch (e) {}
      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordingState("recording");
    } else {
      isRecordingRef.current = false;
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

  // Load student training program and log length defaults from settings
  useEffect(() => {
    async function loadUserPrefs() {
      try {
        const u = await getUserProfile(userUuid);
        if (u) {
          if (u.training_type) setTrainingType(u.training_type);
          if (u.log_length_lines) setLogLengthLines(u.log_length_lines);
        }
      } catch (e) {
        console.warn("Could not load user program preferences", e);
      }
    }
    if (userUuid) loadUserPrefs();
  }, [userUuid]);

  // Handle File Upload Fallback
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      // Clear any previous speech transcript and show a placeholder so the
      // Generate button becomes enabled (actual transcription happens server-side)
      setTranscript("");
      setToastMessage(`Voice file "${file.name}" attached. Tap Generate to transcribe and build your log entry.`);
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
      const response = await processVoiceInput({
        user_uuid: userUuid,
        transcript: transcript,
        audio_file: audioFile,
        training_type: trainingType,
        log_length_lines: logLengthLines,
      });

      if (!response || !response.processed_text) {
        throw new Error(response?.detail || "No processed text returned from AI.");
      }

      const newLog = await createLog({
        user_id: userUuid,
        date: date,
        raw_transcript: isConfidential ? null : transcript,
        processed_output: response.processed_text,
        training_type: trainingType,
        log_length_lines: logLengthLines,
        is_confidential: isConfidential,
      });

      router.push(`/u/${userUuid}/log/${newLog.id}`);
    } catch (err) {
      console.error("[Generate Log Error]", err);
      setToastMessage(err.message || "Generation failed. Your words are safe. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navbar userUuid={userUuid} showBack title="New Log" />

      <main className="w-full max-w-[640px] mx-auto px-gutter pt-2 pb-24 flex flex-col flex-1">
        {/* Context Banner: SIWES Attachment Status & Date */}
        <div className="w-full flex items-center justify-between py-space-sm mb-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <span className="font-caption-medium text-caption text-ink-600">Online • Local cache enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              aria-label="Logbook date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-2.5 py-1 rounded-full bg-surface-muted text-ink-600 font-caption-medium text-caption border border-border outline-none focus:ring-1 focus:ring-accent-600 cursor-pointer shadow-sm"
            />
          </div>
        </div>

        {/* Voice Recording Zone */}
        <section aria-label="Audio recorder" className="flex flex-col items-center justify-center py-4 select-none">
          {/* Sound Waveform Graphic */}
          <Waveform isRecording={isRecording} audioLevel={isRecording ? 24 : 0} />

          {/* Active Mic / Stop Trigger with Concentric Pulsing Rings */}
          <MicButton state={recordingState} onClick={toggleRecording} />

          {/* Digital Duration Timer & Guidance */}
          <div className="flex flex-col items-center mt-3 text-center">
            <time
              className="font-display text-display text-ink-900 tracking-tight"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatTimer(seconds)}
            </time>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-small text-small text-ink-600">
                {isRecording
                  ? "Listening... speak naturally"
                  : recordingState === "denied"
                  ? "Microphone access blocked"
                  : "Tap mic to speak your day"}
              </span>
            </div>
          </div>
        </section>

        {/* Mic Permission Warning Box (If Denied) */}
        {recordingState === "denied" && (
          <div className="w-full mt-2 mb-4 p-4 rounded-xl bg-warning-bg border border-warning-border flex items-start gap-3 text-warning">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span className="font-small text-small">
              Yarn cannot hear you yet. Allow microphone access in your browser settings, or upload an audio memo below.
            </span>
          </div>
        )}

        {/* Active Logbook Format / Program Bar */}
        <div className="w-full mt-3 p-3 bg-surface rounded-xl border border-border shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent-50 flex items-center justify-center text-accent-600 shrink-0">
              <GraduationCap size={15} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-caption-medium text-ink-500 uppercase tracking-wider">
                Logbook Tier
              </span>
              <select
                aria-label="Training program"
                value={trainingType}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrainingType(val);
                  if (val === "swep") setLogLengthLines("5-6");
                  else if (val === "it") setLogLengthLines("2-4");
                  else setLogLengthLines("2-3");
                }}
                className="bg-transparent text-ink-900 font-small-medium text-small outline-none cursor-pointer pr-1 -ml-0.5 hover:text-accent-700 font-semibold"
              >
                <option value="swep">SWEP (Part 2)</option>
                <option value="siwes">SIWES (Part 3)</option>
                <option value="it">IT (Part 4)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-caption-medium text-ink-500 uppercase tracking-wider">
                Target Lines
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Sliders size={13} className="text-accent-600" />
                <select
                  aria-label="Target line length"
                  value={logLengthLines}
                  onChange={(e) => setLogLengthLines(e.target.value)}
                  className="bg-surface-muted text-ink-900 font-small-medium text-caption px-2 py-0.5 rounded-lg border border-border outline-none cursor-pointer focus:border-accent-600"
                >
                  <option value="2-3">2–3 lines (SIWES)</option>
                  <option value="2-4">2–4 lines (IT)</option>
                  <option value="3-4">3–4 lines</option>
                  <option value="5-6">5–6 lines (SWEP)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Live Transcription Output Card */}
        <section
          aria-live="polite"
          className="w-full mt-3 bg-surface rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.05)] border border-border p-5 min-h-[160px] flex flex-col justify-between"
        >
          <div>
            {/* Card Subheader Row */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                {isRecording ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-ink-400"></span>
                )}
                <span className="font-overline text-overline text-ink-600 uppercase tracking-wider font-semibold">
                  Live Transcript
                </span>
              </div>
            </div>

            {/* Real-time Text Buffer */}
            <textarea
              className="w-full min-h-[100px] font-reading text-reading text-ink-900 bg-transparent border-none outline-none resize-none placeholder:text-ink-400 focus:ring-0 leading-[26px]"
              placeholder="Your words will appear here as you speak. You can also type or edit directly..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          </div>

          {/* Sub-badge cue */}
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-muted text-ink-600 font-caption text-caption">
              <Sparkles size={13} className="text-accent-600" />
              Target: {logLengthLines} lines • {trainingType.toUpperCase()}
            </span>
            <span className="font-caption text-caption text-ink-400">Tap anywhere to edit</span>
          </div>
        </section>

        {/* Confidentiality Mode Switch */}
        <section className="w-full mt-4 bg-surface rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-[0_1px_2px_rgba(16,24,40,0.03)] border border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-surface-muted flex items-center justify-center shrink-0 text-ink-600">
              <Lock size={18} />
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <span className="font-small-medium text-small text-ink-900 font-medium truncate">
                Mark as confidential
              </span>
              <span className="font-caption text-caption text-ink-600 line-clamp-1">
                Raw audio and transcript won't be stored. Only the final entry is saved.
              </span>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isConfidential}
            onClick={() => setIsConfidential(!isConfidential)}
            className={`relative shrink-0 w-[52px] h-[32px] rounded-full transition-colors cursor-pointer focus:outline-none ${
              isConfidential ? "bg-accent-600" : "bg-surface-container-highest"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform duration-200 ease-in-out ${
                isConfidential ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </section>

        {/* Secondary Audio Ingestion Link */}
        <div className="flex justify-center items-center mt-3">
          <label
            htmlFor="voice-file-upload"
            className="h-touch-min px-4 flex items-center gap-1.5 text-accent-600 hover:text-accent-700 font-small-medium text-small cursor-pointer active:scale-98 transition-transform select-none"
          >
            <Upload size={18} />
            <span>{audioFile ? `Attached: ${audioFile.name}` : "Upload a voice memo instead (MP3/M4A)"}</span>
            <input
              id="voice-file-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Action Controls */}
        <div className="w-full mt-4 pt-2 flex items-center gap-3">
          {transcript && (
            <button
              type="button"
              onClick={() => {
                setTranscript("");
                setSeconds(0);
              }}
              className="h-12 px-5 rounded-full bg-surface border border-border text-ink-600 hover:text-ink-900 font-subheading text-subheading active:scale-95 transition-all shadow-sm"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={handleGenerateLog}
            disabled={isProcessing || (!transcript.trim() && !audioFile)}
            className="flex-1 h-12 rounded-full bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-surface font-subheading text-subheading shadow-[0_2px_8px_rgba(79,70,229,0.25)] active:scale-98 transition-all flex items-center justify-center gap-2 px-5"
            aria-label={audioFile && !transcript.trim() ? `Transcribe ${audioFile.name} and generate log` : "Generate logbook entry"}
          >
            {isProcessing ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <Sparkles size={20} />
            )}
            <span className="truncate">
              {isProcessing ? "Generating Entry..." : "Generate Logbook Entry"}
            </span>
          </button>
        </div>
      </main>

      <Toast message={toastMessage} isOpen={!!toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}
