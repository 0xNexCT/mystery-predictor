"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Stars from "@/components/Stars";
import QuestionCard, { PlayQuestion } from "@/components/QuestionCard";
import ResultsScreen, { SessionResult } from "@/components/ResultsScreen";

export default function Play() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PlayQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState<SessionResult | null>(null);
  const answersRef = useRef<{ questionId: string; selectedIndex: number }[]>([]);

  useEffect(() => {
    fetch("/api/questions")
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/");
          return null;
        }
        if (!r.ok) {
          throw new Error("Failed to load questions");
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.questions.length === 0) {
          setError("No questions available. Check back soon.");
          return;
        }
        setQuestions(data.questions);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  const handleAnswer = useCallback((questionId: string, selectedIndex: number) => {
    answersRef.current.push({ questionId, selectedIndex });
    const q = questions.find((x) => x.id === questionId);
    if (q && selectedIndex === q.correct) {
      setScore((s) => s + 10);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }, [questions]);

  const handleNext = useCallback(async () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersRef.current }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.replace("/");
        return;
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to submit score");
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit score");
    } finally {
      setLoading(false);
    }
  }, [index, questions.length, router]);

  if (loading && questions.length === 0) {
    return (
      <main className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        <Stars />
        <div className="orb mb-8 h-20 w-20 pulse-glow" />
        <p className="text-[var(--muted)]">Shuffling the unknown...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <Stars />
        <p className="mb-6 text-red-400">{error}</p>
        <Link href="/" className="btn-ghost">
          Back Home
        </Link>
      </main>
    );
  }

  return (
    <main className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-8">
      <Stars />
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-white"
        >
          ← Home
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-sm tracking-widest text-cyan-300 uppercase">
          The Weekly Trial
        </span>
      </div>

      {result ? (
        <ResultsScreen
          username={result.username ?? "you"}
          result={result}
        />
      ) : (
        <QuestionCard
          key={questions[index]?.id}
          question={questions[index]}
          index={index}
          total={questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
          isLast={index + 1 === questions.length}
          score={score}
          streak={streak}
        />
      )}
    </main>
  );
}
