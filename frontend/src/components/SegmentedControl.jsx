"use client";

export default function SegmentedControl({ options = [], selected, onChange }) {
  return (
    <div style={styles.track}>
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              ...styles.segment,
              backgroundColor: isSelected ? "var(--accent-600)" : "transparent",
              color: isSelected ? "#FFFFFF" : "var(--ink-600)",
              fontWeight: isSelected ? 600 : 500,
            }}
            className="clickable"
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  track: {
    height: "48px",
    backgroundColor: "var(--surface-muted)",
    borderRadius: "var(--r-full)",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    width: "100%",
  },
  segment: {
    flex: 1,
    height: "40px",
    borderRadius: "var(--r-full)",
    border: "none",
    fontSize: "14px",
    lineHeight: "20px",
    cursor: "pointer",
    transition: "all var(--dur-fast) var(--ease)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
