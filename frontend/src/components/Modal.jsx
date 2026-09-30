"use client";

import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Drag handle for mobile bottom sheet */}
        <div style={styles.dragHandle} />

        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button type="button" onClick={onClose} style={styles.closeBtn} className="clickable">
            <X size={20} color="var(--ink-600)" />
          </button>
        </div>

        <div style={styles.body}>{children}</div>

        {actions && <div style={styles.footer}>{actions}</div>}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(17, 24, 39, 0.4)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 60,

    "@media (min-width: 768px)": {
      alignItems: "center",
    },
  },
  modalContent: {
    backgroundColor: "var(--surface)",
    borderTopLeftRadius: "var(--r-xl)",
    borderTopRightRadius: "var(--r-xl)",
    width: "100%",
    maxWidth: "420px",
    padding: "20px var(--s-5) calc(24px + env(safe-area-inset-bottom))",
    boxShadow: "var(--shadow-3)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    position: "relative",
  },
  dragHandle: {
    width: "36px",
    height: "4px",
    borderRadius: "var(--r-full)",
    backgroundColor: "var(--border-strong)",
    margin: "0 auto 8px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    color: "var(--ink-900)",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    margin: "-4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    fontSize: "14px",
    lineHeight: "20px",
    color: "var(--ink-600)",
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
  },
};
