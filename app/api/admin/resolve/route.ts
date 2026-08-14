import { NextResponse } from "next/server";
import { KV } from "@/lib/db";
import { QUESTIONS, QUESTIONS_BY_ID } from "@/lib/questions";

export const runtime = "nodejs";

function isAuthorized(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return req.headers.get("x-admin-secret") === secret;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { questionId?: string; correctAnswer?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { questionId, correctAnswer } = body;
  const q = questionId ? QUESTIONS_BY_ID.get(questionId) : undefined;
  if (!q) {
    return NextResponse.json({ error: "Unknown questionId" }, { status: 404 });
  }
  if (!correctAnswer || !q.options.includes(correctAnswer)) {
    return NextResponse.json(
      { error: "correctAnswer must be one of the question options" },
      { status: 400 }
    );
  }

  await KV.setResolveAnswer(questionId as string, correctAnswer as string);
  return NextResponse.json({
    ok: true,
    questionId,
    correctAnswer,
    resolvesAt: q.resolvesAt,
  });
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved: Record<string, string> = {};
  const overridden: string[] = [];
  for (const q of QUESTIONS) {
    const override = await KV.getResolveAnswer(q.id);
    resolved[q.id] = override ?? q.correctAnswer;
    if (override) overridden.push(q.id);
  }

  return NextResponse.json({
    total: QUESTIONS.length,
    overridden,
    resolved,
  });
}