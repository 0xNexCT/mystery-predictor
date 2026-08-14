"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Entry {
  username: string;
  score: number;
  isYou?: boolean;
}

interface LeaderboardData {
  weekId: string;
  totalPlayers: number;
  entries: Entry[];
  you: { rank: number; score: number; username: string } | null;
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-400">Could not load the leaderboard.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card p-8 text-center pulse-glow">
        <p className="text-[var(--muted)]">Consulting the oracle...</p>
      </div>
    );
  }

  const medal = ["🥇", "🥈", "🥉"];

  return (
    <div className="w-full max-w-2xl">
      <div className="card fade-up overflow-hidden">
        <div className="border-b border-white/10 p-6 text-center">
          <p className="text-xs tracking-[0.3em] text-[var(--muted)] uppercase">
            Week {data.weekId}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-glow">Weekly Leaderboard</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {data.totalPlayers} predictor{data.totalPlayers === 1 ? "" : "s"} this week
          </p>
        </div>

        <ul className="max-h-[52vh] divide-y divide-white/5 overflow-y-auto">
          {data.entries.length === 0 && (
            <li className="p-8 text-center text-[var(--muted)]">
              No scores yet. Be the first to be revealed.
            </li>
          )}
          {data.entries.map((e, i) => (
            <li
              key={e.username + i}
              className={`flex items-center gap-4 px-6 py-4 ${
                e.isYou ? "bg-purple-500/10" : ""
              }`}
            >
              <span className="w-8 text-center text-lg">
                {medal[i] ?? <span className="text-sm text-[var(--muted)]">{i + 1}</span>}
              </span>
              <span className="flex-1 truncate font-medium">
                @{e.username}
                {e.isYou && (
                  <span className="ml-2 rounded-full border border-cyan-400/40 px-2 py-0.5 text-[10px] tracking-widest text-cyan-300 uppercase">
                    You
                  </span>
                )}
              </span>
              <span className="font-bold text-glow">{e.score}</span>
            </li>
          ))}
        </ul>

        {data.you && !data.entries.some((e) => e.isYou) && (
          <div className="border-t border-purple-400/30 bg-purple-500/10 px-6 py-4">
            <div className="flex items-center gap-4">
              <span className="w-8 text-center text-sm text-[var(--muted)]">
                #{data.you.rank}
              </span>
              <span className="flex-1 truncate font-medium">
                @{data.you.username}
              </span>
              <span className="font-bold text-glow">{data.you.score}</span>
            </div>
          </div>
        )}

        <div className="border-t border-white/10 p-4 text-center">
          <Link href="/play" className="text-sm text-cyan-300 hover:text-cyan-200">
            Play this week →
          </Link>
        </div>
      </div>
    </div>
  );
}
