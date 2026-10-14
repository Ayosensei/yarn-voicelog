"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import { getSingleLog, deleteLog } from "@/lib/api";
import {
  Copy,
  RefreshCw,
  Trash2,
  Check,
  PenLine,
  Lock,
  ChevronDown,
  Mic,
  CheckCircle,
} from "lucide-react";

export default function SingleLogPage() {
  const params = useParams();
  const router = useRouter();
  const { uuid: userUuid, id: logId } = params;

  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadLog() {
      try {
        const data = await getSingleLog(logId);
        setLog(data);
        setEditedContent(data.processed_output || "");
      } catch (err) {
        setToastMessage("Failed to load log details.");
      } finally {
        setLoading(false);
      }
    }
    loadLog();
  }, [logId]);

  // Copy structured text to clipboard
  const handleCopy = () => {
    if (!log) return;
    navigator.clipboard.writeText(editedContent || log.processed_output);
    setCopied(true);
    setToastMessage("Logbook entry copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Save Inline Edits
  const handleSaveEdit = async () => {
    setLog((prev) => ({ ...prev, processed_output: editedContent }));
    setIsEditing(false);
    setToastMessage("Changes saved successfully.");
  };

  // Delete Log confirmation handler
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteLog(logId);
      setShowDeleteModal(false);
      setToastMessage("Moved to Trash (kept for 7 days)");
      setTimeout(() => {
        router.push(`/u/${userUuid}`);
      }, 1000);
    } catch (err) {
      setToastMessage("Could not delete log. Try again.");
      setIsDeleting(false);
    }
  };

  // Format date nicely (e.g. "Tuesday, 30 September 2026")
  const formatFullDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const wordCount = (editedContent || "").split(/\s+/).filter(Boolean).length;

  if (loading) {
    return (
      <>
        <Navbar userUuid={userUuid} showBack title="Log Entry" />
        <main className="w-full max-w-[640px] mx-auto px-gutter pt-4 pb-24 flex flex-col flex-1">
          <div className="w-full h-80 rounded-xl skeleton-shimmer" />
        </main>
      </>
    );
  }

  if (!log) return null;

  return (
    <>
      <Navbar
        userUuid={userUuid}
        showBack
        title="Log Entry"
        rightAction={
          <button
            onClick={() => setShowDeleteModal(true)}
            aria-label="Delete log"
            className="w-9 h-9 rounded-full flex items-center justify-center text-ink-600 hover:text-danger hover:bg-danger-bg transition-colors active:scale-95"
          >
            <Trash2 size={18} />
          </button>
        }
      />

      <main className="w-full max-w-[640px] mx-auto px-gutter pt-2 pb-32 flex flex-col flex-1">
        {/* Header Meta Section */}
        <section className="flex flex-col gap-space-xs mb-space-xl">
          <h1 className="font-title text-title text-ink-900 tracking-tight font-semibold">
            {formatFullDate(log.date)}
          </h1>
          <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-xs">
            {/* Status Pill */}
            <Badge type="saved" />
            {log.is_confidential && <Badge type="confidential" />}
            {log.training_type && (
              <span className="font-caption-medium text-caption px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200 uppercase">
                {log.training_type}
              </span>
            )}
            {log.grammar_level && (
              <span className="font-caption-medium text-caption px-2 py-0.5 rounded-full bg-surface-muted text-ink-600 border border-border capitalize">
                {log.grammar_level} tone
              </span>
            )}

            <span className="w-1 h-1 rounded-full bg-ink-400"></span>
            {/* Word Count Metrics */}
            <span className="font-caption text-caption text-ink-600 font-mono tracking-normal">
              {wordCount} words
            </span>
            {log.log_length_lines && (
              <>
                <span className="w-1 h-1 rounded-full bg-ink-400"></span>
                <span className="font-caption text-caption text-ink-600">
                  Target: {log.log_length_lines} lines
                </span>
              </>
            )}
          </div>
        </section>

        {/* Confidential Privacy Note */}
        {log.is_confidential && (
          <div className="mb-4 p-3 rounded-xl bg-surface-muted border border-border flex items-center gap-2 text-ink-600 font-small text-small">
            <Lock size={16} className="shrink-0" />
            <span>Transcript not stored for confidential entries.</span>
          </div>
        )}

        {/* Structured Document Card */}
        <article className="bg-surface rounded-xl p-space-xl border border-border shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col gap-space-lg">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="font-overline text-overline uppercase tracking-wider text-accent-600 font-semibold">
              STRUCTURED LOGBOOK ENTRY
            </span>

            <button
              type="button"
              onClick={() => (isEditing ? handleSaveEdit() : setIsEditing(true))}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 text-accent-700 hover:bg-accent-100 font-caption-medium text-caption transition-colors active:scale-95"
            >
              {isEditing ? (
                <>
                  <Check size={14} />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <PenLine size={14} />
                  <span>Edit</span>
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full min-h-[320px] p-4 rounded-xl border border-accent-600 bg-accent-50/20 text-ink-900 font-reading text-reading leading-[28px] outline-none focus:ring-2 focus:ring-accent-600/20 resize-y"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Logbook entry contents..."
              />
              <span className="font-caption text-caption text-ink-600">
                You can edit sections or fill in [bracket placeholders] directly.
              </span>
            </div>
          ) : (
            <div className="font-reading text-reading text-ink-900 leading-[28px] flex flex-col gap-4">
              {editedContent.split("\n\n").map((paragraph, index) => {
                // Highlight [placeholder] tokens with warning tint
                const parts = paragraph.split(/(\[[^\]]+\])/g);
                const isHeading = paragraph.trim().startsWith("###");

                if (isHeading) {
                  return (
                    <h3
                      key={index}
                      className="font-subheading text-subheading text-ink-900 font-semibold pt-2 border-t border-border/60 first:border-none first:pt-0"
                    >
                      {paragraph.replace(/^###\s*/, "")}
                    </h3>
                  );
                }

                return (
                  <p key={index} className="text-ink-900 leading-relaxed">
                    {parts.map((part, i) => {
                      if (part.startsWith("[") && part.endsWith("]")) {
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setIsEditing(true)}
                            title="Click to fill missing placeholder"
                            className="inline-flex items-center mx-1 my-0.5 px-2 py-0.5 rounded-[8px] bg-warning-bg border border-warning-border text-warning font-small-medium text-[14px] align-baseline shadow-sm active:scale-95 transition-all cursor-pointer hover:bg-warning-bg/80"
                          >
                            {part}
                          </button>
                        );
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          )}
        </article>

        {/* Supplemental Card: Original Voice Transcript */}
        {!log.is_confidential && (
          <section className="mt-space-lg w-full">
            <div className="bg-surface border border-border rounded-xl p-space-lg shadow-sm transition-all duration-200">
              <button
                type="button"
                onClick={() => setShowTranscript(!showTranscript)}
                aria-expanded={showTranscript}
                className="w-full flex items-center justify-between text-left group"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs text-ink-900">
                    <Mic size={18} className="text-accent-600" />
                    <span className="font-subheading text-subheading font-semibold">
                      Original transcript
                    </span>
                  </div>
                  <span className="font-small text-small text-ink-600 mt-0.5">
                    What you actually said
                  </span>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-ink-600 group-hover:bg-surface-muted transition-transform duration-200 ${
                    showTranscript ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={20} />
                </div>
              </button>

              {showTranscript && (
                <div className="mt-space-md pt-space-md border-t border-border animate-in fade-in duration-150">
                  <p className="font-reading text-reading text-ink-600 italic bg-surface-muted/60 p-space-md rounded-lg leading-relaxed">
                    &ldquo;{log.raw_transcript || "Transcript unavailable."}&rdquo;
                  </p>
                  <div className="flex items-center justify-between mt-space-sm text-ink-600 font-caption text-caption">
                    <span>Captured via Voice Logger</span>
                    <span className="text-accent-600 font-caption-medium">Audio processed</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Destructive Log Action Link */}
        <div className="flex justify-center mt-space-2xl mb-space-xl">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="h-touch-min px-space-lg inline-flex items-center gap-space-xs text-danger font-small-medium text-small hover:bg-danger-bg rounded-full transition-all active:scale-95"
          >
            <Trash2 size={18} />
            <span>Delete this log</span>
          </button>
        </div>
      </main>

      {/* Dedicated Sticky Bottom Floating Action Dock */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border shadow-[0_4px_12px_rgba(16,24,40,0.08)] pb-safe flex justify-center">
        <div className="w-full max-w-[640px] px-gutter py-space-md flex items-center gap-space-md">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy log to clipboard"
            className="w-12 h-12 rounded-full border border-border-strong bg-surface text-ink-900 flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:bg-surface-muted"
          >
            {copied ? <Check size={20} className="text-success" /> : <Copy size={20} />}
          </button>

          {/* Re-yarn / New Log */}
          <button
            type="button"
            onClick={() => router.push(`/u/${userUuid}/log/new`)}
            aria-label="Record new log entry"
            className="w-12 h-12 rounded-full border border-border-strong bg-surface text-ink-900 flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:bg-surface-muted"
          >
            <RefreshCw size={20} />
          </button>

          {/* Main Action: Save or Edit */}
          <button
            type="button"
            onClick={isEditing ? handleSaveEdit : () => setIsEditing(true)}
            className="flex-1 h-12 rounded-full bg-accent-600 hover:bg-accent-700 text-surface font-subheading text-subheading shadow-[0_1px_2px_rgba(16,24,40,0.05)] active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs"
          >
            {isEditing ? <CheckCircle size={20} /> : <PenLine size={20} />}
            <span>{isEditing ? "Save changes" : "Edit entry"}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Move to Trash?"
        actions={
          <>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="w-full h-11 rounded-full bg-danger hover:bg-danger/90 text-surface font-subheading text-subheading font-semibold shadow-sm transition-all active:scale-98 flex items-center justify-center"
            >
              {isDeleting ? "Moving to trash..." : "Move to Trash"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="w-full h-11 rounded-full bg-surface-muted hover:bg-surface-container text-ink-900 font-subheading text-subheading transition-all active:scale-98"
            >
              Cancel
            </button>
          </>
        }
      >
        <p>This log will be moved to the trash and permanently deleted after 7 days.</p>
      </Modal>

      <Toast message={toastMessage} isOpen={!!toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}
