"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import WeekStrip from "@/components/WeekStrip";
import LogCard from "@/components/LogCard";
import WeeklyTimeline from "@/components/WeeklyTimeline";
import { getUserProfile, getUserLogs } from "@/lib/api";
import { Plus, Search, BookOpen, ChevronDown, Calendar, List } from "lucide-react";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const userUuid = params.uuid;

  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("feed"); // 'feed' | 'timeline'

  useEffect(() => {
    async function loadData() {
      if (!userUuid) return;
      try {
        const [userData, logsData] = await Promise.all([
          getUserProfile(userUuid),
          getUserLogs(userUuid),
        ]);
        const locallyOnboarded =
          typeof window !== "undefined" &&
          localStorage.getItem(`yarn_onboarded_${userUuid}`) === "true";

        if (userData && userData.is_onboarded === false && !locallyOnboarded) {
          router.replace(`/u/${userUuid}/onboarding`);
          return;
        }
        setUser(userData);
        setLogs(logsData || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userUuid, router]);

  const loggedDates = logs.map((l) => l.date);

  const filteredLogs = logs.filter((log) => {
    if (filter === "confidential" && !log.is_confidential) return false;
    if (filter === "saved" && log.is_confidential) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (log.processed_output || "" ) + (log.raw_transcript || "");
      return matchText.toLowerCase().includes(q) || log.date.includes(q);
    }
    return true;
  });

  return (
    <>
      <Navbar userUuid={userUuid} />

      <main className="w-full max-w-[640px] mx-auto px-gutter py-space-lg sm:py-space-xl flex flex-col flex-1 pb-24 md:pb-12">
        
        {/* Greeting Section */}
        <section className="flex flex-col gap-1.5 mb-space-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="font-title text-[22px] sm:text-title text-ink-900 font-semibold tracking-tight">
              Good day, {user ? user.name.split(" ")[0] : "Student"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-50 text-accent-700 font-caption-medium text-caption uppercase tracking-wide w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-600 animate-pulse"></span>
              {user?.training_type ? `${user.training_type.toUpperCase()} • Part ${user.training_type === 'swep' ? '2' : user.training_type === 'siwes' ? '3' : '4'}` : "SIWES • Part 3"}
            </span>
          </div>
          <p className="font-small text-small text-ink-600">
            {user?.department ? `${user.department}${user?.institution ? ` (${user.institution})` : ''} • ` : ''}
            {logs.length} {logs.length === 1 ? "entry" : "entries"} recorded.
          </p>
        </section>

        {/* Week Strip Card */}
        <WeekStrip loggedDates={loggedDates} />

        {/* Primary Voice Record CTA */}
        <section className="w-full mb-space-lg">
          <button 
            onClick={() => router.push(`/u/${userUuid}/log/new`)}
            aria-label="Start recording new daily log" 
            className="w-full h-14 rounded-full bg-accent-600 hover:bg-accent-700 active:scale-[0.98] transition-all flex items-center justify-center gap-space-sm text-white shadow-sm font-subheading text-subheading"
          >
            <Plus size={20} strokeWidth={2} />
            <span>New Log</span>
          </button>
        </section>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-surface-muted rounded-xl mb-space-lg border border-border/60">
          <button
            type="button"
            onClick={() => setActiveView("feed")}
            className={`py-2 px-3 rounded-lg text-small font-small-medium text-center flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeView === "feed"
                ? "bg-surface text-ink-900 shadow-sm font-semibold"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            <List size={16} />
            <span>All Logs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("timeline")}
            className={`py-2 px-3 rounded-lg text-small font-small-medium text-center flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeView === "timeline"
                ? "bg-surface text-ink-900 shadow-sm font-semibold"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            <Calendar size={16} />
            <span>Weekly Timeline</span>
          </button>
        </div>

        {/* View 1: Weekly Timeline & Analytics */}
        {activeView === "timeline" ? (
          <section className="w-full mb-space-2xl">
            <WeeklyTimeline
              logs={logs}
              userUuid={userUuid}
              trainingType={user?.training_type}
            />
          </section>
        ) : (
          /* View 2: Feed of Logs with search & filtering */
          <>
            {/* List Header & Filter Controls */}
            <div className="flex items-center justify-between mb-space-lg gap-2">
              <h2 className="font-heading text-heading text-ink-900 font-semibold tracking-tight">
                Your logs
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input 
                    type="text" 
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-32 sm:w-44 pl-9 pr-3 rounded-full bg-surface border border-border shadow-sm text-ink-900 text-small transition-all outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent placeholder:text-ink-400" 
                  />
                </div>
              </div>
            </div>

            {/* Logs List */}
            <section className="flex flex-col gap-space-md mb-space-2xl">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="w-full h-32 rounded-xl skeleton-shimmer" />
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <LogCard key={log.id} log={log} userUuid={userUuid} />
                ))
              ) : (
                <div className="p-space-2xl bg-surface border border-border rounded-xl flex flex-col items-center justify-center text-center mt-2 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-accent-50 flex items-center justify-center mb-space-md shadow-sm">
                    <BookOpen size={24} className="text-accent-600" />
                  </div>
                  <h3 className="font-subheading text-subheading text-ink-900 font-semibold mb-1">
                    {searchQuery ? "No matching logs found" : "No logs yet"}
                  </h3>
                  <p className="font-small text-small text-ink-600 max-w-[260px]">
                    {searchQuery
                      ? "Try searching for a different keyword or date."
                      : "Tap 'New Log' above to speak your work activities for today."}
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
