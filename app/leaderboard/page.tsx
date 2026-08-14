"use client";

import Link from "next/link";
import Stars from "@/components/Stars";
import Leaderboard from "@/components/Leaderboard";

export default function LeaderboardPage() {
  return (
    <main className="relative z-10 flex h-full flex-col items-center px-6 py-8">
      <Stars />
      <div className="mb-8 flex items-center gap-3">
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-white">
          ← Home
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-sm tracking-widest text-cyan-300 uppercase">
          Leaderboard
        </span>
      </div>
      <Leaderboard />
    </main>
  );
}
