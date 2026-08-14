"use client";

import { useState } from "react";

export interface PlayQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

interface Props {
  question: PlayQuestion;
  index: number;
  total: number;
  onAnswer: (questionId: string, selectedIndex: number) => void;
  onNext: () => void;
  isLast: boolean;
  score: number;
  streak: number;
}

export default function QuestionCard({
  question,
  index,
  total,
  onAnswer,
  onNext,
  isLast,
  score,
  streak,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const pick = (i: number) => {
    if (revealed) return;
    const correct = question.correct === i;
    setIsCorrect(correct);
    setSelected(i);
    setRevealed(true);
    onAnswer(question.id, i);
  };

  return (
    <div className="card reveal w-full max-w-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs tracking-widest text-[var(--muted)] uppercase">
          {index + 1} / {total}
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[var(--muted)]">Score {score}</span>
          <span className="text-[var(--muted)]">Streak {streak}</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <h2 className="mt-6 text-xl font-semibold leading-snug sm:text-2xl">
          {question.question}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => {
          let cls = "option ";
          if (revealed) {
            if (i === question.correct) cls += "option-correct ";
            else if (i === selected) cls += "option-wrong ";
            else cls += "opacity-40 ";
            cls += "option-disabled ";
          }
          return (
            <button key={i} className={cls} onClick={() => pick(i)}>
              <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-xs">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex min-h-[48px] items-center justify-between">
        <div>
          {revealed && (
            <p
              className={`fade-up text-sm font-medium ${
                isCorrect ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isCorrect ? "+10 revealed correctly" : "The truth was revealed"}
            </p>
          )}
        </div>
        {revealed && (
          <button onClick={onNext} className="btn-primary">
            {isLast ? "See Results" : "Next Mystery"}
          </button>
        )}
      </div>
    </div>
  );
}
