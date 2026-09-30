"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

export default function Toast({ message, type = "success", isOpen = false, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={18} color="var(--warning)" />;
      case "info":
        return <Info size={18} color="var(--accent-200)" />;
      case "success":
      default:
        return <CheckCircle2 size={18} color="#4ADE80" />;
    }
  };

  return (
    <div style={styles.toast}>
      {getIcon()}
      <span style={styles.text}>{message}</span>
    </div>
  );
}

const styles = {
  toast: {
    position: "fixed",
    bottom: "calc(80px + env(safe-area-inset-bottom))",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "var(--ink-900)",
    color: "#FFFFFF",
    borderRadius: "var(--r-md)",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "var(--shadow-2)",
    zIndex: 50,
    maxWidth: "90vw",
    width: "max-content",
  },
  text: {
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
  },
};
