"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import { getUserLogs, getUserProfile } from "@/lib/api";
import {
  Download,
  Lock,
  Check,
  FileText,
  Calendar,
  FileSpreadsheet,
  FileDown,
  RefreshCw,
} from "lucide-react";

export default function ExportPage() {
  const params = useParams();
  const userUuid = params.uuid;

  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [format, setFormat] = useState("docx"); // 'docx' | 'pdf'
  const [dateFilter, setDateFilter] = useState("all"); // 'week' | 'month' | 'all'
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [includeCoverPage, setIncludeCoverPage] = useState(true);
  const [numberEntries, setNumberEntries] = useState(true);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, logsData] = await Promise.all([
          getUserProfile(userUuid),
          getUserLogs(userUuid),
        ]);
        setUser(profileData);
        setLogs(logsData || []);

        // Initial dates
        const dates = (logsData || []).map((l) => l.date).filter(Boolean).sort();
        if (dates.length > 0) {
          setFromDate(dates[0]);
          setToDate(dates[dates.length - 1]);
        } else {
          const today = new Date().toISOString().split("T")[0];
          setFromDate(today);
          setToDate(today);
        }

        // Select all non-confidential logs by default
        const validIds = (logsData || []).filter((l) => !l.is_confidential).map((l) => l.id);
        setSelectedIds(validIds);
      } catch (err) {
        console.error("Export load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userUuid]);

  // Quick range filters
  const applyQuickFilter = (type) => {
    setDateFilter(type);
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (type === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff)).toISOString().split("T")[0];
      setFromDate(monday);
      setToDate(todayStr);
    } else if (type === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      setFromDate(firstDay);
      setToDate(todayStr);
    } else {
      const dates = logs.map((l) => l.date).filter(Boolean).sort();
      if (dates.length > 0) {
        setFromDate(dates[0]);
        setToDate(dates[dates.length - 1]);
      }
    }
  };

  // Filtered logs by date range
  const displayedLogs = useMemo(() => {
    if (!fromDate && !toDate) return logs;
    return logs.filter((log) => {
      if (fromDate && log.date < fromDate) return false;
      if (toDate && log.date > toDate) return false;
      return true;
    });
  }, [logs, fromDate, toDate]);

  // Toggle log selection
  const toggleSelect = (id, isConfidential) => {
    if (isConfidential) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Toggle Select All
  const handleToggleSelectAll = () => {
    const selectable = displayedLogs.filter((l) => !l.is_confidential).map((l) => l.id);
    const allSelected = selectable.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !selectable.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...selectable])));
    }
  };

  const selectedCount = selectedIds.length;
  const estimatedPages = Math.max(1, Math.ceil(selectedCount * 0.8));

  // Format short date for display (e.g. "Tue, 30 Sep")
  const formatShortDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
    } catch (e) {
      return dateStr;
    }
  };

  const [showPreview, setShowPreview] = useState(false);

  const selectedLogs = useMemo(() => {
    return logs
      .filter((l) => selectedIds.includes(l.id))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, selectedIds]);

  // Helper: Convert markdown text into styled HTML elements
  const formatMarkdownToHtml = (text) => {
    if (!text) return "";
    return text
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("### ")) {
          return `<h3 style="font-size: 13pt; color: #333; margin-top: 10px; margin-bottom: 4px; font-weight: 600;">${trimmed.slice(4)}</h3>`;
        }
        if (trimmed.startsWith("## ")) {
          return `<h2 style="font-size: 14pt; color: #111; margin-top: 14px; margin-bottom: 6px; font-weight: bold;">${trimmed.slice(3)}</h2>`;
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return `<li style="margin-left: 20px; margin-bottom: 3px; font-size: 11pt;">${trimmed.slice(2)}</li>`;
        }
        if (!trimmed) {
          return `<div style="height: 6px;"></div>`;
        }
        const withBold = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return `<p style="margin: 3px 0; font-size: 11pt; line-height: 1.5;">${withBold}</p>`;
      })
      .join("");
  };

  // Build full HTML document for Word / PDF Print
  const buildHtmlDocument = (selectedLogs) => {
    const studentName = user?.name || "Student";
    const field = user?.field_of_work || "General Fieldwork";

    let coverHtml = "";
    if (includeCoverPage) {
      coverHtml = `
        <div style="padding: 24px 0; border-bottom: 2px solid #4F46E5; margin-bottom: 24px;">
          <h1 style="font-size: 20pt; color: #111; margin: 0 0 8px 0; font-family: Montserrat, sans-serif; letter-spacing: -0.02em;">Yarn • Daily Logbook Notes</h1>
          <p style="font-size: 12pt; color: #4B5563; margin: 0 0 16px 0;">Student Industrial Work Experience Scheme (SIWES)</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 11pt; margin-top: 12px;">
            <tr>
              <td style="padding: 6px 12px; background: #F3F4F6; width: 140px; font-weight: 600; border: 1px solid #E5E7EB;">Student Name:</td>
              <td style="padding: 6px 12px; border: 1px solid #E5E7EB;">${studentName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px; background: #F3F4F6; font-weight: 600; border: 1px solid #E5E7EB;">Field of Work:</td>
              <td style="padding: 6px 12px; border: 1px solid #E5E7EB;">${field}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px; background: #F3F4F6; font-weight: 600; border: 1px solid #E5E7EB;">Date Range:</td>
              <td style="padding: 6px 12px; border: 1px solid #E5E7EB;">${fromDate} to ${toDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px; background: #F3F4F6; font-weight: 600; border: 1px solid #E5E7EB;">Total Entries:</td>
              <td style="padding: 6px 12px; border: 1px solid #E5E7EB;">${selectedLogs.length} entries compiled</td>
            </tr>
          </table>
        </div>
      `;
    }

    const entriesHtml = selectedLogs
      .map((l, idx) => {
        const title = numberEntries
          ? `Day ${idx + 1} • ${formatShortDate(l.date)} (${l.date})`
          : `${formatShortDate(l.date)} (${l.date})`;

        return `
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #E5E7EB; border-radius: 8px; background: #FFFFFF; page-break-inside: avoid;">
            <div style="border-bottom: 1px solid #EEF2FF; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13pt; font-weight: 600; color: #4F46E5;">${title}</span>
            </div>
            <div style="font-size: 11pt; color: #1F2937; line-height: 1.6;">
              ${formatMarkdownToHtml(l.processed_output)}
            </div>
            <div style="margin-top: 14px; padding-top: 8px; border-top: 1px dashed #D1D5DB; font-size: 10pt; color: #6B7280; display: flex; justify-content: space-between;">
              <span>Industry Supervisor Remarks: _______________________</span>
              <span>Signature & Date: ______________</span>
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Yarn Logbook - ${studentName}</title>
        <style>
          @page { size: A4; margin: 18mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; background: #fff; margin: 0; padding: 20px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${coverHtml}
        <div>
          ${entriesHtml}
        </div>
      </body>
      </html>
    `;
  };

  // Download Trigger
  const handleDownload = () => {
    if (selectedCount === 0) {
      setToastMessage("Please select at least one log entry to export.");
      return;
    }

    setExporting(true);

    const selectedLogs = logs
      .filter((l) => selectedIds.includes(l.id))
      .sort((a, b) => a.date.localeCompare(b.date));

    const htmlContent = buildHtmlDocument(selectedLogs);

    if (format === "pdf") {
      // PDF Export via native browser print engine (with clean print-to-PDF styles)
      try {
        const printFrame = document.createElement("iframe");
        printFrame.style.position = "fixed";
        printFrame.style.right = "0";
        printFrame.style.bottom = "0";
        printFrame.style.width = "0";
        printFrame.style.height = "0";
        printFrame.style.border = "0";
        document.body.appendChild(printFrame);

        const frameDoc = printFrame.contentWindow.document;
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();

        setTimeout(() => {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 2000);
          setExporting(false);
          setToastMessage(`Prepared PDF with ${selectedCount} logs!`);
        }, 500);
      } catch (err) {
        console.error("PDF print error:", err);
        setExporting(false);
        setToastMessage("Could not open print dialog. Try Word (.docx) export.");
      }
    } else {
      // Word (.docx / .doc) Export via formatted Word HTML Blob
      setTimeout(() => {
        try {
          const blob = new Blob([htmlContent], { type: "application/msword;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          const cleanDate = new Date().toISOString().split("T")[0];
          link.download = `Yarn_SIWES_Logbook_${cleanDate}.doc`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setExporting(false);
          setToastMessage(`Exported ${selectedCount} logs as Word document!`);
        } catch (err) {
          console.error("Word export error:", err);
          setExporting(false);
          setToastMessage("Failed to export Word document.");
        }
      }, 500);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar userUuid={userUuid} title="Export logbook" />
        <main className="w-full max-w-[640px] mx-auto px-gutter pt-4 pb-28 flex flex-col flex-1">
          <div className="w-full h-80 rounded-xl skeleton-shimmer" />
        </main>
      </>
    );
  }

  const allSelectable = displayedLogs.filter((l) => !l.is_confidential).map((l) => l.id);
  const isAllSelected = allSelectable.length > 0 && allSelectable.every((id) => selectedIds.includes(id));

  return (
    <>
      <Navbar userUuid={userUuid} title="Export logbook" />

      <main className="flex-1 flex flex-col relative w-full max-w-[640px] mx-auto pt-2 pb-32 px-gutter">
        {/* Page Title & Subtitle */}
        <div className="pt-2 pb-5 flex flex-col gap-1">
          <h1 className="font-title text-title text-ink-900 tracking-tight font-semibold">
            Export logbook
          </h1>
          <p className="font-small text-small text-ink-600">
            Compile your entries into one clean document for supervisor review.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Section 1: Date Range Filter Card */}
          <section className="bg-surface rounded-xl shadow-sm border border-border p-5 flex flex-col">
            <span className="font-overline text-overline text-ink-600 uppercase tracking-wider mb-3 font-semibold">
              DATE RANGE
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-small-medium text-small text-ink-900 font-medium" htmlFor="export-from-date">
                  From
                </label>
                <div className="relative flex items-center">
                  <input
                    id="export-from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setDateFilter("custom");
                    }}
                    className="w-full h-[50px] pl-3 pr-2 bg-surface border border-border-strong rounded-xl font-small-medium text-small text-ink-900 cursor-pointer shadow-sm outline-none focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600 transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-small-medium text-small text-ink-900 font-medium" htmlFor="export-to-date">
                  To
                </label>
                <div className="relative flex items-center">
                  <input
                    id="export-to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setDateFilter("custom");
                    }}
                    className="w-full h-[50px] pl-3 pr-2 bg-surface border border-border-strong rounded-xl font-small-medium text-small text-ink-900 cursor-pointer shadow-sm outline-none focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Quick Range Filter Pills */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => applyQuickFilter("week")}
                className={`h-9 px-3.5 rounded-full font-small-medium text-small shadow-sm transition-colors shrink-0 ${
                  dateFilter === "week"
                    ? "bg-accent-50 text-accent-700 border border-accent-200"
                    : "bg-surface border border-border text-ink-900 hover:bg-surface-muted"
                }`}
              >
                This week
              </button>
              <button
                type="button"
                onClick={() => applyQuickFilter("month")}
                className={`h-9 px-3.5 rounded-full font-small-medium text-small shadow-sm transition-colors shrink-0 ${
                  dateFilter === "month"
                    ? "bg-accent-50 text-accent-700 border border-accent-200"
                    : "bg-surface border border-border text-ink-900 hover:bg-surface-muted"
                }`}
              >
                This month
              </button>
              <button
                type="button"
                onClick={() => applyQuickFilter("all")}
                className={`h-9 px-3.5 rounded-full font-small-medium text-small shadow-sm transition-colors shrink-0 ${
                  dateFilter === "all"
                    ? "bg-accent-50 text-accent-700 border border-accent-200"
                    : "bg-surface border border-border text-ink-900 hover:bg-surface-muted"
                }`}
              >
                All time
              </button>
            </div>
          </section>

          {/* Section 2: Selectable Logs List */}
          <section className="bg-surface rounded-xl shadow-sm border border-border p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-heading text-heading text-ink-900 font-semibold">Select logs</h2>
                <span className="font-caption text-caption text-ink-600">
                  {selectedCount} of {allSelectable.length} available entries selected
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform"
              >
                <span className="font-small-medium text-small text-ink-900 font-medium">
                  {isAllSelected ? "Deselect all" : "Select all"}
                </span>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isAllSelected
                      ? "bg-accent-600 text-surface shadow-sm"
                      : "border border-border-strong bg-surface text-transparent"
                  }`}
                >
                  <Check size={16} />
                </div>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {displayedLogs.length > 0 ? (
                displayedLogs.map((log) => {
                  const isSelected = selectedIds.includes(log.id);
                  const isConfidential = log.is_confidential;
                  const wordCount = (log.processed_output || "").split(/\s+/).filter(Boolean).length;

                  if (isConfidential) {
                    return (
                      <div
                        key={log.id}
                        className="h-16 rounded-xl bg-surface-muted/60 opacity-60 px-3.5 flex items-center gap-3 border border-border/50 cursor-not-allowed select-none"
                      >
                        <div className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center text-ink-400 shrink-0">
                          <Lock size={15} />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <span className="font-subheading text-subheading text-ink-900 tabular-nums leading-snug">
                            {formatShortDate(log.date)}
                          </span>
                          <span className="font-caption text-caption text-ink-600 truncate leading-tight flex items-center gap-1">
                            Confidential, excluded from exports
                          </span>
                        </div>
                        <span className="font-caption text-caption text-ink-600 shrink-0 tabular-nums">
                          {wordCount} words
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={log.id}
                      onClick={() => toggleSelect(log.id, false)}
                      className={`h-16 rounded-xl px-3.5 flex items-center gap-3 transition-all cursor-pointer select-none border ${
                        isSelected
                          ? "bg-accent-50 border-accent-200"
                          : "bg-surface border-border hover:bg-surface-muted/50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-accent-600 text-surface shadow-sm"
                            : "border border-border-strong bg-surface text-transparent"
                        }`}
                      >
                        <Check size={16} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className="font-subheading text-subheading text-ink-900 tabular-nums leading-snug font-semibold">
                          {formatShortDate(log.date)}
                        </span>
                        <span className="font-caption text-caption text-ink-600 truncate leading-tight">
                          {(log.processed_output || "").slice(0, 68).replace(/[#*]/g, "")}...
                        </span>
                      </div>
                      <span className="font-caption text-caption text-ink-600 shrink-0 tabular-nums">
                        {wordCount} words
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-ink-600 font-small text-small bg-surface-muted rounded-xl">
                  No logbook entries found in this date range.
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Export Format */}
          <section className="flex flex-col gap-2">
            <span className="font-overline text-overline text-ink-600 uppercase tracking-wider px-1 font-semibold">
              EXPORT FORMAT
            </span>
            <div className="h-12 bg-surface-muted rounded-full p-1 flex items-center gap-1 select-none border border-border">
              <button
                type="button"
                onClick={() => setFormat("docx")}
                className={`flex-1 h-full rounded-full font-small-medium text-small flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  format === "docx"
                    ? "bg-accent-600 text-surface shadow-sm font-semibold"
                    : "text-ink-600 hover:text-ink-900"
                }`}
              >
                <FileSpreadsheet size={18} />
                <span>Word (.docx)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex-1 h-full rounded-full font-small-medium text-small flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  format === "pdf"
                    ? "bg-accent-600 text-surface shadow-sm font-semibold"
                    : "text-ink-600 hover:text-ink-900"
                }`}
              >
                <FileDown size={18} />
                <span>PDF (.pdf)</span>
              </button>
            </div>
          </section>

          {/* Section 4: Document Options */}
          <section className="bg-surface rounded-xl shadow-sm border border-border p-5 flex flex-col gap-3">
            <span className="font-overline text-overline text-ink-600 uppercase tracking-wider font-semibold">
              DOCUMENT OPTIONS
            </span>
            <div className="flex flex-col divide-y divide-border/60">
              <label className="flex justify-between items-center py-2.5 cursor-pointer select-none">
                <span className="font-small-medium text-small text-ink-900 font-medium">
                  Include cover page with my name and dates
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeCoverPage}
                  onClick={() => setIncludeCoverPage(!includeCoverPage)}
                  className={`relative shrink-0 w-[48px] h-[28px] rounded-full transition-colors cursor-pointer focus:outline-none ${
                    includeCoverPage ? "bg-accent-600" : "bg-border-strong"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-surface shadow-sm transition-transform duration-200 ${
                      includeCoverPage ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>

              <label className="flex justify-between items-center py-2.5 cursor-pointer select-none">
                <span className="font-small-medium text-small text-ink-900 font-medium">
                  Number entries sequentially by day
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={numberEntries}
                  onClick={() => setNumberEntries(!numberEntries)}
                  className={`relative shrink-0 w-[48px] h-[28px] rounded-full transition-colors cursor-pointer focus:outline-none ${
                    numberEntries ? "bg-accent-600" : "bg-border-strong"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-surface shadow-sm transition-transform duration-200 ${
                      numberEntries ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            </div>
          </section>

          {/* Section 5: Document Preview */}
          <section className="bg-surface rounded-xl shadow-sm border border-border p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-overline text-overline text-ink-600 uppercase tracking-wider font-semibold">
                DOCUMENT PREVIEW
              </span>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="font-small text-small text-accent-600 hover:text-accent-700 font-semibold cursor-pointer"
              >
                {showPreview ? "Hide preview" : "Show preview"}
              </button>
            </div>

            {showPreview && (
              <div className="p-4 bg-surface-muted rounded-xl border border-border max-h-96 overflow-y-auto text-ink-900 space-y-4">
                {selectedLogs.length > 0 ? (
                  selectedLogs.map((l, idx) => (
                    <div key={l.id} className="p-3.5 bg-surface rounded-lg border border-border">
                      <div className="font-subheading text-small font-semibold text-accent-700 pb-1.5 border-b border-border/60 mb-2">
                        {numberEntries ? `Day ${idx + 1} • ` : ""}{formatShortDate(l.date)} ({l.date})
                      </div>
                      <div className="whitespace-pre-line text-ink-900 text-xs leading-relaxed">
                        {l.processed_output}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-ink-600 text-xs">No entries selected to preview.</p>
                )}
              </div>
            )}
          </section>

          {/* Summary Banner */}
          <div className="bg-accent-50 rounded-xl p-4 flex items-center gap-3 border border-accent-200">
            <FileText size={20} className="text-accent-600 shrink-0" />
            <span className="font-small-medium text-small text-accent-700">
              {selectedCount} of {allSelectable.length} logs selected, about {estimatedPages} pages
            </span>
          </div>
        </div>

        {/* Sticky Floating Action Bar above mobile navigation */}
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md shadow-md py-3 px-gutter border-t border-border">
          <div className="max-w-[640px] mx-auto w-full">
            <button
              type="button"
              disabled={exporting || selectedCount === 0}
              onClick={handleDownload}
              className="w-full h-14 rounded-full bg-accent-600 hover:bg-accent-700 active:scale-[0.99] disabled:opacity-50 text-white font-subheading text-subheading font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {exporting ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Compiling {format.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Download size={20} />
                  <span>Download {format === "docx" ? "Word document" : "PDF document"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <Toast message={toastMessage} isOpen={!!toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}
