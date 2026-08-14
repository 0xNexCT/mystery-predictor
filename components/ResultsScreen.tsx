"use client";

import { useMemo } from "react";
import Link from "next/link";

export interface SessionResult {
  username: string | null;
  score: number;
  correct: number;
  total: number;
  maxStreak: number;
  weekId: string;
  rank: number;
  totalPlayers: number;
  percentile: number;
}

interface Props {
  username: string;
  result: SessionResult;
}

export default function ResultsScreen({ username, result }: Props) {
  const baseUrl =
    (typeof window !== "undefined" && window.location.origin) ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";

  const ogUrl = useMemo(() => {
    const params = new URLSearchParams({
      username,
      score: String(result.score),
      streak: String(result.maxStreak),
      rank: String(result.rank),
      weekId: result.weekId,
    });
    return `${baseUrl}/api/og?${params.toString()}`;
  }, [baseUrl, username, result]);

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams({
      username,
      score: String(result.score),
      streak: String(result.maxStreak),
      rank: String(result.rank),
      weekId: result.weekId,
    });
    const pageUrl = `${baseUrl}/s?${params.toString()}`;
    const text = `I scored ${result.score} in Mystery Predictor this week — rank #${result.rank} of ${result.totalPlayers}. Think you can out-predict me? #MysteryPredictor`;
    const tweet = new URLSearchParams({ text, url: pageUrl });
    return `https://twitter.com/intent/tweet?${tweet.toString()}`;
  }, [baseUrl, username, result]);

  const accuracy = result.total
    ? Math.round((result.correct / result.total) * 100)
    : 0;

  return (
    <div className="w-full max-w-xl">
      <div className="card fade-up p-8 text-center">
        <p className="text-sm tracking-[0.3em] text-[var(--muted)] uppercase">
          Week {result.weekId}
        </p>
        <h2 className="mt-4 text-3xl font-bold text-glow">The Reveal</h2>
        <p className="mt-1 text-lg text-cyan-300">@{username}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Score" value={String(result.score)} />
          <Stat label="Correct" value={`${result.correct}/${result.total}`} />
          <Stat label="Streak" value={String(result.maxStreak)} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
        </div>

        <div className="mt-8 rounded-xl border border-purple-400/30 bg-purple-500/10 p-5">
          <p className="text-sm text-[var(--muted)]">Your weekly rank</p>
          <p className="mt-1 text-4xl font-extrabold text-glow">#{result.rank}</p>
          <p className="mt-2 text-sm text-cyan-300">
            Top {result.percentile}% of {result.totalPlayers} predictors this week
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ogUrl}
            alt="Your Mystery Predictor share card"
            width={600}
            height={315}
            className="w-full"
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-center"
          >
            Share on X
          </a>
          <div className="flex gap-3">
            <Link href="/play" className="btn-ghost flex-1 text-center">
              Play Again
            </Link>
            <Link href="/leaderboard" className="btn-ghost flex-1 text-center">
              Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs tracking-widest text-[var(--muted)] uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
