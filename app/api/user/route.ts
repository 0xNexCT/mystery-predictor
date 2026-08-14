import { NextResponse } from "next/server";
import { KV } from "@/lib/db";
import {
  USERNAME_COOKIE,
  USERNAME_REGEX,
  UUID_COOKIE,
  isValidUuid,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { uuid?: string; username?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { uuid, username } = body;
  if (!uuid || !isValidUuid(uuid)) {
    return NextResponse.json({ error: "Missing or invalid uuid" }, { status: 400 });
  }
  if (!username || !USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3-15 characters: letters, numbers, underscore only" },
      { status: 400 }
    );
  }

  const normalized = username.toLowerCase();

  const existing = await KV.findUsername(normalized);
  if (existing && existing !== uuid) {
    let suggestion = `${username}${Math.floor(Math.random() * 900 + 100)}`;
    const suggestionTaken = await KV.findUsername(suggestion.toLowerCase());
    if (suggestionTaken) {
      suggestion = `${username}${Date.now().toString().slice(-4)}`;
    }
    return NextResponse.json(
      {
        error: "Username already taken",
        suggestion,
      },
      { status: 409 }
    );
  }

  const user = await KV.getUser(uuid);
  if (user) {
    if (user.username.toLowerCase() !== normalized) {
      const oldClaim = await KV.findUsername(user.username.toLowerCase());
      if (oldClaim === uuid) {
        await KV.findUsername(normalized);
        await KV.claimUsername(normalized, uuid);
      }
    }
  } else {
    await KV.createUser(uuid, username);
  }

  await KV.claimUsername(normalized, uuid);
  await KV.setSession(uuid, username);

  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(UUID_COOKIE, uuid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  res.cookies.set(USERNAME_COOKIE, username, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

export async function GET(req: Request) {
  const header = req.headers.get("cookie") ?? "";
  const uuid = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${UUID_COOKIE}=`))
    ?.slice(`${UUID_COOKIE}=`.length);

  if (!uuid || !isValidUuid(uuid)) {
    return NextResponse.json({ username: null }, { status: 200 });
  }

  const user = await KV.getUser(uuid);
  return NextResponse.json(
    { username: user?.username ?? null },
    { status: 200 }
  );
}
