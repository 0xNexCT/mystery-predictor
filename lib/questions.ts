import questionsJson from "@/data/questions.json";

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export const QUESTIONS: Question[] = questionsJson as Question[];

export const QUESTIONS_BY_ID = new Map(
  QUESTIONS.map((q) => [q.id, q] as const)
);

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
