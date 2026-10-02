"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import WeekStrip from "@/components/WeekStrip";
import LogCard from "@/components/LogCard";
import { getUserProfile, getUserLogs } from "@/lib/api";
import { Plus, Search, BookOpen, ChevronDown } from "lucide-react";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const userUuid = params.uuid;

  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!userUuid) return;
      try {
        const [userData, logsData] = await Promise.all([
          getUserProfile(userUuid),
          getUserLogs(userUuid),
        ]);
        setUser(userData);
        setLogs(logsData || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userUuid]);

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

      <main className="w-full max-w-[640px] mx-auto px-gutter py-space-xl flex flex-col flex-1">
        
        {/* Greeting Section */}
        <section className="flex flex-col gap-space-xs mb-space-xl">
          <div className="flex items-center justify-between">
            <h1 className="font-title text-title text-ink-900 font-semibold tracking-tight">
              Good morning, {user ? user.name.split(" ")[0] : "Student"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-50 text-accent-700 font-caption-medium text-caption">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-600 animate-pulse"></span>
              Week 6 • SIWES
            </span>
          </div>
          <p className="font-small text-small text-ink-600">
            You've logged {logs.length} days this week.
          </p>
        </section>

        {/* Week Strip Card */}
        <WeekStrip loggedDates={loggedDates} />

        {/* Primary Voice Record CTA */}
        <section className="w-full mb-space-2xl">
          <button 
            onClick={() => router.push(`/u/${userUuid}/log/new`)}
            aria-label="Start recording new daily log" 
            className="w-full h-14 rounded-full bg-accent-600 hover:bg-accent-700 active:scale-[0.98] transition-all flex items-center justify-center gap-space-sm text-surface shadow-sm font-subheading text-subheading"
          >
            <Plus size={20} strokeWidth={2} />
            <span>New Log</span>
          </button>
        </section>

        {/* List Header & Filter Controls */}
        <div className="flex items-center justify-between mb-space-lg">
          <h2 className="font-heading text-heading text-ink-900 font-semibold tracking-tight">Your logs</h2>
          <div className="flex items-center gap-space-sm">
            <button className="h-9 px-3.5 rounded-full bg-surface border border-border shadow-sm text-ink-900 flex items-center gap-1.5 font-small-medium text-small hover:bg-surface-muted transition-colors">
              <span>This month</span>
              <ChevronDown size={16} className="text-ink-600" />
            </button>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-10 focus:w-48 pl-10 pr-4 rounded-full bg-surface border border-border shadow-sm text-ink-900 transition-all outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent placeholder:text-transparent focus:placeholder:text-ink-400" 
              />
            </div>
          </div>
        </div>

        {/* Logs List */}
        <section className="flex flex-col gap-space-md mb-space-2xl">
          <span className="font-overline text-overline uppercase tracking-wider text-ink-600 font-semibold">THIS WEEK</span>
          
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="w-full h-32 rounded-xl skeleton-shimmer" />
            ))
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <LogCard key={log.id} log={log} userUuid={userUuid} />
            ))
          ) : (
            <div className="p-space-2xl bg-surface border border-border rounded-xl flex flex-col items-center justify-center text-center mt-4">
              <div className="w-12 h-12 rounded-full bg-accent-50 flex items-center justify-center mb-space-md shadow-sm">
                <BookOpen size={24} className="text-accent-600" />
              </div>
              <h3 className="font-subheading text-subheading text-ink-900 font-semibold mb-1">No logs yet</h3>
              <p className="font-small text-small text-ink-600 max-w-[240px]">
                {searchQuery ? "No entries match your search." : "Tap New Log and just start talking."}
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
