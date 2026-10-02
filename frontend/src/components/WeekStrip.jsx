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
    <section className="w-full bg-surface rounded-xl shadow-sm p-space-lg mb-space-xl border border-border">
      <div className="flex items-center justify-between gap-1 w-full max-w-sm mx-auto">
        {days.map((d, index) => {
          
          let circleClasses = "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ";
          let textClasses = "font-caption text-caption mt-1.5 ";

          if (d.isLogged) {
            circleClasses += "bg-accent-600 text-surface";
            textClasses += "text-ink-600";
          } else if (d.isToday) {
            circleClasses += "bg-surface ring-2 ring-accent-600 ring-inset";
            textClasses = "font-caption-medium text-caption text-accent-700 font-semibold mt-1.5 ";
          } else if (d.isFuture) {
            circleClasses += "bg-surface-muted/60 shadow-none";
            textClasses += "text-ink-400";
          } else {
            // Missed past day
            circleClasses += "bg-surface-muted/60 shadow-none";
            textClasses += "text-ink-400";
          }

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className={circleClasses}>
                {d.isLogged ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (d.isToday ? (
                  <span className="w-2 h-2 rounded-full bg-accent-600"></span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-400/40"></span>
                ))}
              </div>
              <span className={textClasses}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
