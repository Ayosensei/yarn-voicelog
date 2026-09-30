"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import { getSingleLog, deleteLog, createLog } from "@/lib/api";
import { Copy, RefreshCw, Trash2, Check, PenLine, Lock } from "lucide-react";

export default function SingleLogPage() {
  const params = useParams();
  const router = useRouter();
  const { uuid: userUuid, id: logId } = params;

  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
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
    setToastMessage("Log entry changes saved.");
  };

  // Delete Log confirmation handler
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteLog(logId);
      setShowDeleteModal(false);
      router.push(`/u/${userUuid}`);
    } catch (err) {
      setToastMessage("Could not delete log. Try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar userUuid={userUuid} showBack title="Log Entry" />
        <main className="content-column">
          <div className="yarn-card skeleton-shimmer" style={{ height: "300px" }} />
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
          <button onClick={() => setShowDeleteModal(true)} style={styles.iconActionBtn} className="clickable">
            <Trash2 size={20} color="var(--danger)" />
          </button>
        }
      />

      <main className="content-column">
        {/* Header Summary Row */}
        <div style={styles.metaRow}>
          <div>
            <h1 className="title-text" style={{ fontSize: "20px" }}>
              {log.date}
            </h1>
            <span className="caption-text" style={{ color: "var(--ink-600)" }}>
              {log.processed_output ? log.processed_output.split(/\s+/).filter(Boolean).length : 0} words
            </span>
          </div>

          <div style={styles.badgeGroup}>
            {log.is_confidential && <Badge type="confidential" />}
            <Badge type="saved" />
          </div>
        </div>

        {/* Confidential Privacy Note */}
        {log.is_confidential && (
          <div style={styles.confidentialNote}>
            <Lock size={16} color="var(--ink-600)" />
            <span className="small-text" style={{ color: "var(--ink-600)" }}>
              Transcript not stored for confidential entries.
            </span>
          </div>
        )}

        {/* Formatted Logbook Entry Content */}
        <div className="yarn-card" style={styles.contentCard}>
          <div style={styles.contentCardHeader}>
            <span className="overline-text" style={{ color: "var(--accent-600)" }}>
              STRUCTURED LOGBOOK ENTRY
            </span>

            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                variant="ghost"
                size="S"
                leadingIcon={isEditing ? Check : PenLine}
                onClick={() => (isEditing ? handleSaveEdit() : setIsEditing(true))}
              >
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>
          </div>

          {isEditing ? (
            <textarea
              className="yarn-textarea"
              style={{ minHeight: "280px", fontSize: "15px", lineHeight: "24px" }}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
          ) : (
            <div className="reading-text" style={styles.renderedMarkdown}>
              {/* Render structured markdown with highlighted bracket placeholders */}
              {editedContent.split("\n\n").map((paragraph, index) => {
                // Highlight [placeholder] tokens with warning tint (Section 8.13)
                const parts = paragraph.split(/(\[[^\]]+\])/g);
                return (
                  <p key={index} style={{ marginBottom: "16px" }}>
                    {parts.map((part, i) => {
                      if (part.startsWith("[") && part.endsWith("]")) {
                        return (
                          <span key={i} style={styles.placeholderToken}>
                            {part}
                          </span>
                        );
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div style={styles.actionsRow}>
          <Button
            variant="secondary"
            size="M"
            leadingIcon={copied ? Check : Copy}
            onClick={handleCopy}
            style={{ flex: 1 }}
          >
            {copied ? "Copied" : "Copy text"}
          </Button>

          <Button
            variant="secondary"
            size="M"
            leadingIcon={RefreshCw}
            onClick={() => router.push(`/u/${userUuid}/log/new`)}
            style={{ flex: 1 }}
          >
            Re-yarn
          </Button>
        </div>
      </main>

      {/* Delete Confirmation Modal (Section 9.4) */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete this log?"
        actions={
          <>
            <Button
              variant="destructive"
              size="M"
              fullWidth
              isLoading={isDeleting}
              onClick={handleDeleteConfirm}
            >
              Delete log
            </Button>
            <Button
              variant="ghost"
              size="M"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
          </>
        }
      >
        <p>This action cannot be undone. The log entry will be permanently removed from your logbook.</p>
      </Modal>

      <Toast message={toastMessage} isOpen={!!toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}

const styles = {
  iconActionBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "var(--s-4)",
  },
  badgeGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  confidentialNote: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    backgroundColor: "var(--surface-muted)",
    borderRadius: "var(--r-md)",
    marginBottom: "var(--s-4)",
  },
  contentCard: {
    marginBottom: "var(--s-6)",
  },
  contentCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "var(--s-4)",
    paddingBottom: "var(--s-3)",
    borderBottom: "1px solid var(--border)",
  },
  renderedMarkdown: {
    color: "var(--ink-900)",
    whiteSpace: "pre-wrap",
  },
  placeholderToken: {
    backgroundColor: "var(--warning-bg)",
    color: "var(--warning)",
    border: "1px solid var(--warning-border)",
    borderRadius: "var(--r-sm)",
    padding: "2px 6px",
    fontWeight: 500,
  },
  actionsRow: {
    display: "flex",
    alignItems: "center",
    gap: "var(--s-3)",
  },
};
