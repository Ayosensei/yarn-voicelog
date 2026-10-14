"use client";

import Link from "next/link";
import { Check, Edit2, Lock } from "lucide-react";

export default function LogCard({ log, userUuid }) {
  if (!log) return null;

  const { id, date, processed_output, raw_transcript, is_confidential, is_draft } = log;

  // Format date e.g. "Tuesday, 30 Sep"
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    } catch (e) {
      return dateStr;
    }
  };

  const wordCount = (processed_output || "").split(/\s+/).filter(Boolean).length;
  const previewText = is_confidential
    ? "Confidential entry — Raw text restricted for privacy."
    : (processed_output || raw_transcript || "").replace(/[#*`_]/g, "").slice(0, 140);

  return (
    <article className="w-full bg-surface rounded-xl p-space-lg shadow-sm border border-border flex flex-col gap-space-sm card-interactive cursor-pointer">
      <Link href={`/u/${userUuid}/log/${id}`} className="flex flex-col h-full focus:outline-none">
        
        <div className="flex items-center justify-between">
          <time className="font-subheading text-subheading text-ink-900 font-semibold tabular-nums">
            {formatDate(date)}
          </time>
          
          {is_confidential ? (
             <span className="h-6 px-2.5 rounded-full bg-surface-muted text-ink-600 font-caption-medium text-caption flex items-center gap-1 font-semibold">
               <Lock size={14} /> Confidential
             </span>
          ) : is_draft ? (
             <span className="h-6 px-2.5 rounded-full bg-warning-bg border border-warning-border text-warning font-caption-medium text-caption flex items-center gap-1 font-semibold">
               <Edit2 size={14} /> Draft
             </span>
          ) : (
             <span className="h-6 px-2.5 rounded-full bg-success-bg border border-success-border text-success font-caption-medium text-caption flex items-center gap-1 font-semibold">
               <Check size={14} /> Saved
             </span>
          )}
        </div>

        {is_confidential ? (
           <div className="flex items-center gap-2 py-1 text-ink-600 italic font-small text-small my-1">
             <Lock size={16} className="text-ink-400" />
             <span>Confidential entry — tap to view</span>
           </div>
        ) : (
          <p className="font-small text-small text-ink-600 line-clamp-2 leading-relaxed my-1">
            {previewText || "No content"}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="font-caption text-caption text-ink-400">{wordCount} words</span>
          <span className="font-caption text-caption text-ink-400">
            {is_draft ? "Unsigned draft" : "Export Ready"}
          </span>
        </div>

      </Link>
    </article>
  );
}
