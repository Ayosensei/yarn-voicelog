"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import WeekStrip from "@/components/WeekStrip";
import LogCard from "@/components/LogCard";
import Chip from "@/components/Chip";
import Button from "@/components/Button";
import { getUserProfile, getUserLogs } from "@/lib/api";
import { Plus, Search, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const userUuid = params.uuid;

  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'saved' | 'confidential'
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

  // Extract logged dates for WeekStrip
  const loggedDates = logs.map((l) => l.date);

  // Filter logs logic
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

      <main className="content-column">
        {/* User Greeting & Header */}
        <div style={styles.headerBlock}>
          <div>
            <h1 className="title-text" style={styles.greetingTitle}>
              Hello, {user ? user.name.split(" ")[0] : "Student"} 👋
            </h1>
            <p className="small-text" style={styles.greetingSubtitle}>
              {user?.field_of_work || "SIWES Logbook"}
            </p>
          </div>
          <Button
            variant="primary"
            size="M"
            leadingIcon={Plus}
            onClick={() => router.push(`/u/${userUuid}/log/new`)}
          >
            New Log
          </Button>
        </div>

        {/* 7-Day Week Progress Strip */}
        <div style={{ marginBottom: "var(--s-6)" }}>
          <WeekStrip loggedDates={loggedDates} />
        </div>

        {/* Search & Filter Bar */}
        <div style={styles.filterBar}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="var(--ink-400)" style={styles.searchIcon} />
            <input
              type="text"
              className="yarn-input"
              style={styles.searchInput}
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={styles.chipRow}>
            <Chip
              label="All Logs"
              variant="filter"
              selected={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <Chip
              label="Saved"
              variant="filter"
              selected={filter === "saved"}
              onClick={() => setFilter("saved")}
            />
            <Chip
              label="Confidential"
              variant="filter"
              selected={filter === "confidential"}
              onClick={() => setFilter("confidential")}
            />
          </div>
        </div>

        {/* Logs List / Loading Skeletons / Empty State */}
        <div style={styles.logsList}>
          {loading ? (
            // Skeleton Loaders
            [1, 2, 3].map((i) => (
              <div key={i} className="yarn-card skeleton-shimmer" style={{ height: "120px" }} />
            ))
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <LogCard key={log.id} log={log} userUuid={userUuid} />
            ))
          ) : (
            // Empty State (Section 9.1)
            <div style={styles.emptyState}>
              <div style={styles.emptyIconCircle}>
                <BookOpen size={24} color="var(--accent-600)" />
              </div>
              <h2 className="heading-text">No logs found</h2>
              <p className="small-text" style={{ color: "var(--ink-600)" }}>
                {searchQuery
                  ? "No log entries match your search query."
                  : "You haven't yarned any daily work entries yet."}
              </p>
              <Button
                variant="primary"
                size="M"
                leadingIcon={Plus}
                onClick={() => router.push(`/u/${userUuid}/log/new`)}
                style={{ marginTop: "12px" }}
              >
                Yarn your first log
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

const styles = {
  headerBlock: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "var(--s-6)",
  },
  greetingTitle: {
    color: "var(--ink-900)",
  },
  greetingSubtitle: {
    color: "var(--ink-600)",
    marginTop: "2px",
  },
  filterBar: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-3)",
    marginBottom: "var(--s-5)",
  },
  searchWrapper: {
    position: "relative",
    width: "100%",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  searchInput: {
    paddingLeft: "42px",
  },
  chipRow: {
    display: "flex",
    alignItems: "center",
    gap: "var(--s-2)",
    overflowX: "auto",
    paddingBottom: "4px",
  },
  logsList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-4)",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "var(--s-10) var(--s-5)",
    gap: "var(--s-2)",
  },
  emptyIconCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "var(--r-full)",
    backgroundColor: "var(--accent-50)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "8px",
  },
};
