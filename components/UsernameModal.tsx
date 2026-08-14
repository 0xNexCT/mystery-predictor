"use client";

import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onSuccess: (username: string) => void;
}

export default function UsernameModal({ open, onSuccess }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const submit = async (username: string) => {
    const trimmed = username.trim();
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(trimmed)) {
      setError("3-15 characters. Letters, numbers, underscore only.");
      setSuggestion(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestion(null);

    let uuid = localStorage.getItem("mp_client_uuid");
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem("mp_client_uuid", uuid);
    }

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, username: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.username);
      } else if (res.status === 409) {
        setError(data.error ?? "Username taken");
        setSuggestion(data.suggestion ?? null);
      } else {
        setError(data.error ?? "Something went wrong");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const useSuggestion = () => {
    setValue(suggestion ?? "");
    setSuggestion(null);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="card fade-up w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-glow">Enter the Mystery</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Choose a username to begin your weekly predictions.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
          className="flex flex-col gap-4"
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
              setSuggestion(null);
            }}
            placeholder="mystic_oracle"
            maxLength={15}
            className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-purple-400/70 focus:shadow-[0_0_18px_rgba(168,85,247,0.35)]"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {suggestion && (
            <button
              type="button"
              onClick={useSuggestion}
              className="text-left text-sm text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
            >
              Try instead: {suggestion}
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Summoning..." : "Begin"}
          </button>
        </form>
      </div>
    </div>
  );
}
