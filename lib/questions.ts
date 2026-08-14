import questionsJson from "@/data/questions.json";
import { KV } from "@/lib/db";

export interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
  resolvesAt: string;
}

export const QUESTIONS: Question[] = questionsJson as Question[];

export const QUESTIONS_BY_ID = new Map(
  QUESTIONS.map((q) => [q.id, q] as const)
);

export async function getEffectiveAnswer(questionId: string): Promise<string> {
  const q = QUESTIONS_BY_ID.get(questionId);
  if (!q) return "";
  return (await KV.getResolveAnswer(questionId)) ?? q.correctAnswer;
}

export const SESSION_SIZE = 10;

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickSessionQuestions(seenIds: string[], count: number): Question[] {
  let pool = QUESTIONS.filter((q) => !seenIds.includes(q.id));
  if (pool.length < count) {
    pool = QUESTIONS.filter((q) => seenIds.includes(q.id));
  }
  return shuffle(pool).slice(0, count);
}
