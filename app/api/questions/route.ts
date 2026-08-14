import { NextResponse } from "next/server";
import { KV } from "@/lib/db";
import { getUuidFromRequest } from "@/lib/auth";
import { getWeekId } from "@/lib/week";
import { pickSessionQuestions, SESSION_SIZE, getEffectiveAnswer } from "@/lib/questions";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const uuid = getUuidFromRequest(req);
  if (!uuid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const weekId = getWeekId();
  const seenIds = await KV.seenIds(weekId, uuid);
  const questions = pickSessionQuestions(seenIds, SESSION_SIZE);

  if (questions.length > 0) {
    await KV.markSeen(
      weekId,
      uuid,
      questions.map((q) => q.id)
    );
  }

  return NextResponse.json({
    weekId,
    questions: await Promise.all(
      questions.map(async (q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct: q.options.indexOf(await getEffectiveAnswer(q.id)),
      }))
    ),
  });
}
