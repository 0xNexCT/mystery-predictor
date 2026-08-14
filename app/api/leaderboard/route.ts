import { NextResponse } from "next/server";
import { KV } from "@/lib/db";
import { getUuidFromRequest } from "@/lib/auth";
import { getWeekId } from "@/lib/week";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const uuid = getUuidFromRequest(req);
  const weekId = getWeekId();

  const top = await KV.leaderboard(weekId, 50);
  const totalPlayers = await KV.playedCount(weekId);

  const entries: {
    username: string;
    score: number;
    uuid?: string;
    isYou?: boolean;
  }[] = [];

  for (let i = 0; i < top.length; i += 2) {
    const member = top[i] as string;
    const score = Number(top[i + 1]);
    const user = await KV.getUser(member);
    entries.push({
      username: user?.username ?? "mystery_user",
      score,
      isYou: member === uuid,
    });
  }

  let you: { rank: number; score: number; username: string } | null = null;
  if (uuid) {
    const rank = await KV.getRank(weekId, uuid);
    const score = await KV.getScore(weekId, uuid);
    const user = await KV.getUser(uuid);
    if (rank !== null && score !== null) {
      you = {
        rank: rank + 1,
        score,
        username: user?.username ?? "mystery_user",
      };
    }
  }

  return NextResponse.json({
    weekId,
    totalPlayers,
    entries,
    you,
  });
}
