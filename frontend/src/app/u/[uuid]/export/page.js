"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { getUserLogs } from "@/lib/api";
import { Download, Lock, CheckSquare, Square, FileText } from "lucide-react";

export default function ExportPage() {
  const params = useParams();
  const userUuid = params.uuid;

  const [logs, setLogs] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [format, setFormat] = useState("docx"); // 'docx' | 'pdf'
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await getUserLogs(userUuid);
        setLogs(data || []);
        // Select non-confidential logs by default
        const validIds = (data || []).filter((l) => !l.is_confidential).map((l) => l.id);
        setSelectedIds(validIds);
      } catch (err) {
        console.error("Export load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [userUuid]);

  // Toggle log selection
  const toggleSelect = (id, isConfidential) => {
    if (isConfidential) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select all non-confidential logs
  const selectAll = () => {
    const validIds = logs.filter((l) => !l.is_confidential).map((l) => l.id);
    setSelectedIds(validIds);
  };

  // Clear selection
  const clearAll = () => {
    setSelectedIds([]);
  };

  // Download Trigger
  const handleDownload = () => {
    if (selectedIds.length === 0) {
      setToastMessage("Please select at least one log entry to export.");
      return;
    }

    setExporting(true);

    setTimeout(() => {
      const selectedLogs = logs.filter((l) => selectedIds.includes(l.id));
      const content = selectedLogs
        .map((l) => `=== ${l.date} ===\n\n${l.processed_output}\n\n`)
        .join("\n----------------------------------------\n\n");

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Yarn_SIWES_Logbook_${new Date().toISOString().split("T")[0]}.${format === "docx" ? "docx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExporting(false);
      setToastMessage(`Exported ${selectedIds.length} logs as ${format.toUpperCase()}!`);
    }, 1000);
  };

  if (loading) {
    return (
      <>
        <Navbar userUuid={userUuid} title="Export Studio" />
        <main className="content-column">
          <div className="yarn-card skeleton-shimmer" style={{ height: "350px" }} />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar userUuid={userUuid} title="Export Studio" />

      <main className="content-column">
        {/* Format Selector */}
        <div style={{ marginBottom: "var(--s-6)" }}>
          <label style={styles.sectionLabel}>Export Document Format</label>
          <SegmentedControl
            options={[
              { label: "Word (.docx)", value: "docx" },
              { label: "PDF (.pdf)", value: "pdf" },
            ]}
            selected={format}
            onChange={setFormat}
          />
        </div>

        {/* Log Selection Header */}
        <div style={styles.selectionHeaderRow}>
          <div>
            <h2 className="heading-text">Select Entries</h2>
            <span className="caption-text" style={{ color: "var(--ink-600)" }}>
              {selectedIds.length} of {logs.filter((l) => !l.is_confidential).length} entries selected
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button variant="ghost" size="S" onClick={selectAll}>
              Select all
            </Button>
            <Button variant="ghost" size="S" onClick={clearAll}>
              Clear
            </Button>
          </div>
        </div>

        {/* Selectable Log Rows */}
        <div style={styles.rowsList}>
          {logs.length > 0 ? (
            logs.map((log) => {
              const isSelected = selectedIds.includes(log.id);
              const isConfidential = log.is_confidential;

              return (
                <div
                  key={log.id}
                  onClick={() => toggleSelect(log.id, isConfidential)}
                  style={{
                    ...styles.logRow,
                    backgroundColor: isConfidential
                      ? "var(--surface-muted)"
                      : isSelected
                      ? "var(--accent-50)"
                      : "var(--surface)",
                    borderColor: isSelected ? "var(--accent-200)" : "var(--border)",
                    opacity: isConfidential ? 0.6 : 1,
                    cursor: isConfidential ? "not-allowed" : "pointer",
                  }}
                  className={!isConfidential ? "clickable" : ""}
                >
                  <div style={styles.checkboxWrapper}>
                    {isConfidential ? (
                      <Lock size={20} color="var(--ink-600)" />
                    ) : isSelected ? (
                      <CheckSquare size={20} color="var(--accent-600)" />
                    ) : (
                      <Square size={20} color="var(--border-strong)" />
                    )}
                  </div>

                  <div style={styles.rowDetails}>
                    <div style={styles.rowTop}>
                      <span className="subheading-text" style={{ fontSize: "15px" }}>
                        {log.date}
                      </span>
                      {isConfidential && (
                        <span className="caption-text" style={{ color: "var(--warning)" }}>
                          Confidential, excluded
                        </span>
                      )}
                    </div>
                    <span className="caption-text" style={styles.previewLine}>
                      {isConfidential
                        ? "Restricted content"
                        : (log.processed_output || "").slice(0, 70) + "..."}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="yarn-card" style={{ textAlign: "center", padding: "var(--s-6)" }}>
              <FileText size={32} color="var(--ink-400)" style={{ margin: "0 auto 8px" }} />
              <p className="body-text" style={{ color: "var(--ink-600)" }}>
                No logs available to export yet.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div style={styles.stickyActionBar}>
        <div style={styles.actionBarInner}>
          <Button
            variant="primary"
            size="L"
            fullWidth
            isLoading={exporting}
            leadingIcon={Download}
            onClick={handleDownload}
          >
            Download {format === "docx" ? "Word document" : "PDF document"}
          </Button>
        </div>
      </div>

      <Toast message={toastMessage} isOpen={!!toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}

const styles = {
  sectionLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--ink-900)",
    marginBottom: "8px",
    display: "block",
  },
  selectionHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "var(--s-4)",
  },
  rowsList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-3)",
    marginBottom: "calc(var(--s-16) + 20px)",
  },
  logRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    height: "64px",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    padding: "0 16px",
    transition: "all var(--dur-fast) var(--ease)",
  },
  checkboxWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rowDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  rowTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewLine: {
    color: "var(--ink-600)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
