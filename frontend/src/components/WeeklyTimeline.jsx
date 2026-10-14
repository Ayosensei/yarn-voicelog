"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function WeeklyTimeline({ logs = [], userUuid, trainingType = "siwes" }) {
  // Current active week offset (0 = current week, -1 = last week, etc.)
  const [weekOffset, setWeekOffset] = useState(0);

  // Helper to compute start of week (Monday) with offset
  const getWeekDays = (offset = 0) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sun, 1 is Mon
    const distanceToMon = (currentDay + 6) % 7;

    const baseMonday = new Date(now);
    baseMonday.setDate(now.getDate() - distanceToMon + offset * 7);

    const days = [];
    const dayLabels = [
      { short: "Mon", full: "Monday", isWorkday: true },
      { short: "Tue", full: "Tuesday", isWorkday: true },
      { short: "Wed", full: "Wednesday", isWorkday: true },
      { short: "Thu", full: "Thursday", isWorkday: true },
      { short: "Fri", full: "Friday", isWorkday: true },
      { short: "Sat", full: "Saturday", isWorkday: false },
      { short: "Sun", full: "Sunday", isWorkday: false },
    ];

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + i);

      const iso = d.toISOString().split("T")[0];
      const isToday = d.toDateString() === now.toDateString();
      const isPast = d < now && !isToday;
      const isFuture = d > now && !isToday;

      // Find any log for this day
      const dayLogs = logs.filter((l) => l.date === iso && !l.deleted_at);

      days.push({
        ...dayLabels[i],
        date: iso,
        dateObj: d,
        formattedDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        isToday,
        isPast,
        isFuture,
        logs: dayLogs,
        hasLog: dayLogs.length > 0,
      });
    }

    return days;
  };

  const weekDays = getWeekDays(weekOffset);
  const workDays = weekDays.filter((d) => d.isWorkday);
  const loggedWorkDays = workDays.filter((d) => d.hasLog).length;
  const completionPercent = Math.round((loggedWorkDays / workDays.length) * 100);

  // Calculate total words and entries for this week
  const weekLogs = weekDays.flatMap((d) => d.logs);
  const totalWords = weekLogs.reduce((acc, l) => {
    const text = l.processed_output || "";
    return acc + (text.trim() ? text.trim().split(/\s+/).length : 0);
  }, 0);

  // Compute streak across all logs
  const calculateStreak = () => {
    if (!logs.length) return 0;
    const sortedDates = Array.from(new Set(logs.map((l) => l.date))).sort().reverse();
    const todayObj = new Date();
    const today = todayObj.toISOString().split("T")[0];
    const yesterday = new Date(todayObj.getTime() - 86400000).toISOString().split("T")[0];

    if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date(sortedDates.includes(today) ? today : yesterday);

    while (true) {
      const iso = checkDate.toISOString().split("T")[0];
      if (sortedDates.includes(iso)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  const weekStartStr = weekDays[0].formattedDate;
  const weekEndStr = weekDays[6].formattedDate;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-surface rounded-xl p-3 border border-border shadow-sm">
        <button
          type="button"
          onClick={() => setWeekOffset((prev) => prev - 1)}
          aria-label="Previous week"
          className="p-1.5 rounded-lg border border-border hover:bg-surface-muted text-ink-600 hover:text-ink-900 active:scale-95 transition-all"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-accent-600" />
          <span className="font-subheading text-[14px] font-semibold text-ink-900">
            {weekOffset === 0
              ? `This Week (${weekStartStr} – ${weekEndStr})`
              : weekOffset === -1
              ? `Last Week (${weekStartStr} – ${weekEndStr})`
              : `${weekStartStr} – ${weekEndStr}`}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setWeekOffset((prev) => prev + 1)}
          disabled={weekOffset >= 0}
          aria-label="Next week"
          className="p-1.5 rounded-lg border border-border hover:bg-surface-muted text-ink-600 hover:text-ink-900 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Metric 1: Workday Completion */}
        <div className="bg-surface rounded-xl p-3.5 border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-caption-medium uppercase tracking-wider text-ink-500">
              Week Target
            </span>
            <CheckCircle2 size={16} className="text-accent-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="font-title text-title font-bold text-ink-900">
                {loggedWorkDays}
              </span>
              <span className="text-small text-ink-500">/ 5 days</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-surface-muted rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-accent-600 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Logging Streak */}
        <div className="bg-surface rounded-xl p-3.5 border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-caption-medium uppercase tracking-wider text-ink-500">
              Active Streak
            </span>
            <Flame size={16} className={streak > 0 ? "text-amber-500" : "text-ink-400"} />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="font-title text-title font-bold text-ink-900">
                {streak}
              </span>
              <span className="text-small text-ink-500">
                {streak === 1 ? "day" : "days"}
              </span>
            </div>
            <p className="text-[11px] text-ink-500 font-caption mt-1">
              {streak > 2 ? "Consistent habit!" : "Log daily to build"}
            </p>
          </div>
        </div>

        {/* Metric 3: Words Written */}
        <div className="bg-surface rounded-xl p-3.5 border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-caption-medium uppercase tracking-wider text-ink-500">
              Words Logged
            </span>
            <FileText size={16} className="text-accent-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="font-title text-title font-bold text-ink-900">
                {totalWords}
              </span>
              <span className="text-small text-ink-500">words</span>
            </div>
            <p className="text-[11px] text-ink-500 font-caption mt-1">
              ~{loggedWorkDays > 0 ? Math.round(totalWords / loggedWorkDays) : 0} w/day
            </p>
          </div>
        </div>

        {/* Metric 4: Program Tier Target */}
        <div className="bg-surface rounded-xl p-3.5 border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-caption-medium uppercase tracking-wider text-ink-500">
              Program Tier
            </span>
            <BarChart3 size={16} className="text-accent-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="font-title text-title font-bold text-ink-900 uppercase">
                {trainingType || "SIWES"}
              </span>
            </div>
            <p className="text-[11px] text-accent-700 dark:text-accent-400 font-caption-medium mt-1">
              {trainingType === "swep"
                ? "5–6 lines default"
                : trainingType === "it"
                ? "2–4 lines default"
                : "2–3 lines default"}
            </p>
          </div>
        </div>
      </div>

      {/* Vertical Weekly Schedule Timeline */}
      <section className="bg-surface rounded-2xl p-4 sm:p-5 border border-border shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-accent-600" />
            <h3 className="font-subheading text-subheading font-semibold text-ink-900">
              Daily Schedule Breakdown
            </h3>
          </div>
          <span className="text-caption text-ink-500 font-caption">
            {loggedWorkDays} of 5 workdays completed
          </span>
        </div>

        <div className="flex flex-col gap-3 relative before:absolute before:top-3 before:bottom-3 before:left-4 before:w-[2px] before:bg-border/60">
          {weekDays.map((day) => {
            const hasEntry = day.hasLog;
            const primaryLog = day.logs[0];

            return (
              <div
                key={day.date}
                className={`relative flex items-start gap-4 p-3.5 rounded-xl border transition-all ${
                  day.isToday
                    ? "bg-accent-50/30 border-accent-600/40 shadow-sm"
                    : hasEntry
                    ? "bg-surface border-border hover:border-accent-600/30"
                    : "bg-surface-muted/30 border-border/70 border-dashed"
                }`}
              >
                {/* Timeline Node Badge */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-xs ${
                    hasEntry
                      ? "bg-accent-600 text-white"
                      : day.isToday
                      ? "bg-surface ring-2 ring-accent-600 text-accent-600 font-bold"
                      : "bg-surface-muted text-ink-400"
                  }`}
                >
                  {hasEntry ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <span className="text-[11px] font-semibold">{day.short[0]}</span>
                  )}
                </div>

                {/* Day Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-subheading text-[14px] font-semibold text-ink-900">
                        {day.full}
                      </span>
                      <span className="text-caption text-ink-500 font-caption">
                        {day.formattedDate}
                      </span>
                      {day.isToday && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-600 text-white font-caption-medium">
                          Today
                        </span>
                      )}
                    </div>

                    {!day.isWorkday && (
                      <span className="text-[11px] font-caption text-ink-400 italic">
                        Weekend
                      </span>
                    )}
                  </div>

                  {/* Day Entry Details or Log CTA */}
                  {hasEntry ? (
                    <div className="flex flex-col gap-2 mt-1.5">
                      <Link
                        href={`/u/${userUuid}/log/${primaryLog.id}`}
                        className="group flex flex-col p-2.5 rounded-lg bg-surface-muted/60 hover:bg-surface-muted border border-border/60 transition-colors"
                      >
                        <p className="font-reading text-[13px] text-ink-800 line-clamp-2 leading-[20px]">
                          {primaryLog.processed_output}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40 text-[11px] text-ink-500 font-caption">
                          <span className="font-medium text-accent-700 dark:text-accent-400 group-hover:underline inline-flex items-center gap-1">
                            View or edit entry <ArrowRight size={12} />
                          </span>
                          <span>
                            {primaryLog.processed_output
                              ? primaryLog.processed_output.split("\n").filter(Boolean).length
                              : 1}{" "}
                            lines
                          </span>
                        </div>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-caption text-ink-500 font-caption italic">
                        {day.isFuture ? "Upcoming day" : "No entry logged"}
                      </p>
                      <Link
                        href={`/u/${userUuid}/log/new?date=${day.date}`}
                        className="inline-flex items-center gap-1 text-[12px] font-caption-medium text-accent-700 dark:text-accent-400 hover:text-accent-800 px-2.5 py-1 rounded-lg border border-accent-200 dark:border-accent-800 bg-surface hover:bg-accent-50/50 active:scale-95 transition-all shadow-xs"
                      >
                        <Plus size={13} />
                        <span>Log day</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
