"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Stars from "@/components/Stars";
import UsernameModal from "@/components/UsernameModal";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((d) => {
        if (d.username) {
          setUsername(d.username);
        } else {
          setModalOpen(true);
        }
      })
      .catch(() => setModalOpen(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-8 text-center">
      <Stars />

      <div className="orb mb-10 h-32 w-32" />

      <p className="fade-up mb-3 text-xs tracking-[0.5em] text-cyan-300 uppercase">
        Enter the mystery
      </p>
      <h1 className="fade-up text-5xl font-extrabold tracking-tight text-glow sm:text-6xl">
        Mystery Predictor
      </h1>
      <p className="fade-up mt-5 max-w-md text-[var(--muted)]">
        Ten cryptic questions a week. Answer, reveal the truth, and climb the
        leaderboard. {username ? `Welcome back, @${username}.` : "Set your name to begin."}
      </p>

      {!loading && (
        <div className="fade-up mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/play" className="btn-primary">
            {username ? "Play Again" : "Play Now"}
          </Link>
          <Link href="/leaderboard" className="btn-ghost">
            View Leaderboard
          </Link>
        </div>
      )}

      <footer className="fade-up mt-16 text-xs text-[var(--muted)]">
        For fun. No real-world predictions, no money, just mystery.
      </footer>

      <UsernameModal
        open={modalOpen}
        onSuccess={(name) => {
          setUsername(name);
          setModalOpen(false);
        }}
      />
    </main>
  );
}
