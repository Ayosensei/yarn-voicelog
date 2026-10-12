"use client";

import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] bg-surface rounded-t-2xl sm:rounded-2xl p-6 shadow-xl border border-border flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200 pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-10 h-1 rounded-full bg-border-strong mx-auto mb-1 sm:hidden" />

        <div className="flex items-center justify-between pb-1">
          <h2 className="font-heading text-heading text-ink-900 font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 -mr-1 rounded-full text-ink-400 hover:text-ink-600 hover:bg-surface-muted transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="font-body text-body text-ink-600 leading-relaxed">{children}</div>

        {actions && <div className="flex flex-col gap-2.5 mt-2">{actions}</div>}
      </div>
    </div>
  );
}
