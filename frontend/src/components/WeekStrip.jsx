"use client";

import { Check } from "lucide-react";

export default function WeekStrip({ loggedDates = [] }) {
  // Generate current week Monday - Sunday
  const getDaysOfWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMon = (currentDay + 6) % 7;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMon);

    const days = [];
    const dayNames = ["M", "T", "W", "T", "F", "S", "S"];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      const isoDate = dayDate.toISOString().split("T")[0];
      const isToday = dayDate.toDateString() === today.toDateString();
      const isPast = dayDate < today && !isToday;
      const isFuture = dayDate > today && !isToday;
      const isLogged = loggedDates.includes(isoDate);

      days.push({
        label: dayNames[i],
        date: isoDate,
        isToday,
        isPast,
        isFuture,
        isLogged,
      });
    }

    return days;
  };

  const days = getDaysOfWeek();

  return (
    <div style={styles.container}>
      <div style={styles.stripRow}>
        {days.map((d, index) => {
          let circleStyle = { ...styles.circle };

          if (d.isLogged) {
            circleStyle = { ...circleStyle, backgroundColor: "var(--accent-600)", color: "#FFFFFF", border: "none" };
          } else if (d.isToday) {
            circleStyle = { ...circleStyle, border: "2px solid var(--accent-600)", backgroundColor: "transparent" };
          } else if (d.isFuture) {
            circleStyle = { ...circleStyle, backgroundColor: "var(--surface-muted)", opacity: 0.5 };
          } else {
            // Missed past day
            circleStyle = { ...circleStyle, backgroundColor: "var(--surface-muted)" };
          }

          return (
            <div key={index} style={styles.dayCol}>
              <div style={circleStyle}>
                {d.isLogged ? <Check size={16} strokeWidth={2.5} /> : null}
              </div>
              <span style={{ ...styles.dayLabel, color: d.isToday ? "var(--accent-600)" : "var(--ink-600)", fontWeight: d.isToday ? 600 : 400 }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "16px var(--s-5)",
    boxShadow: "var(--shadow-1)",
  },
  stripRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  circle: {
    width: "32px",
    height: "32px",
    borderRadius: "var(--r-full)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all var(--dur-fast) var(--ease)",
  },
  dayLabel: {
    fontSize: "12px",
    lineHeight: "16px",
  },
};
