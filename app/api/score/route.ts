import { NextResponse } from "next/server";
import { KV } from "@/lib/db";
import { getUuidFromRequest } from "@/lib/auth";
import { getWeekId } from "@/lib/week";
import { QUESTIONS_BY_ID } from "@/lib/questions";

export const runtime = "nodejs";

const POINTS_PER_CORRECT = 10;

export async function POST(req: Request) {
  const uuid = getUuidFromRequest(req);
  if (!uuid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { answers?: { questionId: string; selectedIndex: number }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!Array.isArray(body?.answers) || body.answers.length === 0) {
    return NextResponse.json({ error: "No answers provided" }, { status: 400 });
  }

  let correct = 0;
  let streak = 0;
  let maxStreak = 0;

  for (const answer of body.answers) {
    const q = QUESTIONS_BY_ID.get(answer.questionId);
    if (!q) continue;
    const isCorrect = q.options[answer.selectedIndex] === q.correctAnswer;
    if (isCorrect) {
      correct++;
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }

  const total = body.answers.length;
  const score = correct * POINTS_PER_CORRECT;
  const weekId = getWeekId();

  await KV.addScore(weekId, uuid, score);
  await KV.addPlayed(weekId, uuid);

  const rank = (await KV.getRank(weekId, uuid)) ?? -1;
  const position = rank + 1;
  const totalPlayers = await KV.playedCount(weekId);

  const percentile =
    totalPlayers <= 1
      ? 100
      : Math.max(0, Math.round(((totalPlayers - position) / (totalPlayers - 1)) * 100));

  const user = await KV.getUser(uuid);

  return NextResponse.json({
    username: user?.username ?? null,
    score,
    correct,
    total,
    maxStreak,
    weekId,
    rank: position,
    totalPlayers,
    percentile,
  });
}
