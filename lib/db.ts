import { kv as vercelKv } from "@vercel/kv";

export interface UserRecord {
  username: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface SessionRecord {
  username: string;
  startedAt: string;
  [key: string]: unknown;
}

type Hash = Record<string, string>;
type Entry = { member: string; score: number };

interface KvLike {
  hgetall<T extends Record<string, unknown>>(key: string): Promise<T | null>;
  hset(key: string, value: Hash): Promise<number>;
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: string, opts?: { nx?: boolean }): Promise<string | null>;
  smembers<T>(key: string): Promise<T[]>;
  sadd(key: string, members: string[]): Promise<number>;
  zscore(key: string, member: string): Promise<number | null>;
  zincrby(key: string, increment: number, member: string): Promise<number>;
  zrevrank(key: string, member: string): Promise<number | null>;
  zrange(
    key: string,
    start: number,
    stop: number,
    opts?: { rev?: boolean; withScores?: boolean }
  ): Promise<string[]>;
  zcard(key: string): Promise<number>;
  scard(key: string): Promise<number>;
}

class MemoryKv implements KvLike {
  private hashes = new Map<string, Hash>();
  private strings = new Map<string, string>();
  private sets = new Map<string, Set<string>>();
  private zsets = new Map<string, Map<string, number>>();

  async hgetall<T>(key: string): Promise<T | null> {
    const h = this.hashes.get(key);
    if (!h) return null;
    return { ...h } as unknown as T;
  }
  async hset(key: string, value: Hash): Promise<number> {
    const h = this.hashes.get(key) ?? {};
    Object.assign(h, value);
    this.hashes.set(key, h);
    return Object.keys(h).length;
  }
  async get<T>(key: string): Promise<T | null> {
    const v = this.strings.get(key);
    if (v === undefined) return null;
    try {
      return JSON.parse(v) as T;
    } catch {
      return v as unknown as T;
    }
  }
  async set(key: string, value: string, opts?: { nx?: boolean }): Promise<"OK" | null> {
    if (opts?.nx && this.strings.has(key)) return null;
    this.strings.set(key, value);
    return "OK";
  }
  async smembers<T>(key: string): Promise<T[]> {
    const s = this.sets.get(key);
    return s ? (Array.from(s) as T[]) : [];
  }
  async sadd(key: string, members: string[]): Promise<number> {
    const s = this.sets.get(key) ?? new Set<string>();
    let added = 0;
    for (const m of members) {
      if (!s.has(m)) added++;
      s.add(m);
    }
    this.sets.set(key, s);
    return added;
  }
  async zscore(key: string, member: string): Promise<number | null> {
    return this.zsets.get(key)?.get(member) ?? null;
  }
  async zincrby(key: string, increment: number, member: string): Promise<number> {
    const z = this.zsets.get(key) ?? new Map<string, number>();
    const next = (z.get(member) ?? 0) + increment;
    z.set(member, next);
    this.zsets.set(key, z);
    return next;
  }
  async zrevrank(key: string, member: string): Promise<number | null> {
    const entries = this.sorted(key);
    const i = entries.findIndex((e) => e.member === member);
    return i === -1 ? null : i;
  }
  async zrange(
    key: string,
    start: number,
    stop: number,
    opts?: { rev?: boolean; withScores?: boolean }
  ): Promise<string[]> {
    const entries = this.sorted(key);
    const sliced = opts?.rev ? entries.slice(start, stop + 1) : [...entries].reverse().slice(start, stop + 1);
    if (!opts?.withScores) return sliced.map((e) => e.member);
    return sliced.flatMap((e) => [e.member, String(e.score)]);
  }
  async zcard(key: string): Promise<number> {
    return this.zsets.get(key)?.size ?? 0;
  }
  async scard(key: string): Promise<number> {
    return this.sets.get(key)?.size ?? 0;
  }
  private sorted(key: string): Entry[] {
    const z = this.zsets.get(key);
    return Array.from(z ? z.entries() : [])
      .map(([member, score]) => ({ member, score }))
      .sort((a, b) => b.score - a.score || a.member.localeCompare(b.member));
  }
}

const hasKv = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

const client: KvLike = hasKv
  ? {
      hgetall: <T extends Record<string, unknown>>(k: string) => vercelKv.hgetall<T>(k),
      hset: (k, v) => vercelKv.hset(k, v),
      get: <T>(k: string) => vercelKv.get<T>(k),
      set: (k, v, o) => vercelKv.set(k, v, o as never),
      smembers: <T>(k: string) =>
        vercelKv.smembers<T extends unknown[] ? T : string[]>(k) as unknown as Promise<T[]>,
      sadd: (k, m) => vercelKv.sadd(k, m),
      zscore: (k, m) => vercelKv.zscore(k, m),
      zincrby: (k, inc, m) => vercelKv.zincrby(k, inc, m),
      zrevrank: (k, m) => vercelKv.zrevrank(k, m),
      zrange: (k, s, e, o) =>
        vercelKv.zrange<never[]>(k, s, e, {
          rev: o?.rev ?? true,
          withScores: o?.withScores ?? false,
        }) as unknown as Promise<string[]>,
      zcard: (k) => vercelKv.zcard(k),
      scard: (k) => vercelKv.scard(k),
    }
  : new MemoryKv();

export const KV = {
  getUser: (uuid: string) => client.hgetall<UserRecord>(`user:${uuid}`),

  createUser: (uuid: string, username: string) =>
    client.hset(`user:${uuid}`, {
      username,
      createdAt: new Date().toISOString(),
    }),

  findUsername: (username: string) =>
    client.get<string>(`username:${username.toLowerCase()}`),

  claimUsername: (username: string, uuid: string) =>
    client.set(`username:${username.toLowerCase()}`, uuid, { nx: true }),

  getSession: (uuid: string) => client.hgetall<SessionRecord>(`session:${uuid}`),

  setSession: (uuid: string, username: string) =>
    client.hset(`session:${uuid}`, {
      username,
      startedAt: new Date().toISOString(),
    }),

  seenIds: (weekId: string, uuid: string) =>
    client.smembers<string>(`week:${weekId}:seen:${uuid}`),

  markSeen: (weekId: string, uuid: string, ids: string[]) =>
    client.sadd(`week:${weekId}:seen:${uuid}`, ids),

  getScore: (weekId: string, uuid: string) =>
    client.zscore(`week:${weekId}:scores`, uuid),

  addScore: (weekId: string, uuid: string, points: number) =>
    client.zincrby(`week:${weekId}:scores`, points, uuid),

  addPlayed: (weekId: string, uuid: string) =>
    client.sadd(`week:${weekId}:played`, [uuid]),

  getRank: (weekId: string, uuid: string) =>
    client.zrevrank(`week:${weekId}:scores`, uuid),

  leaderboard: (weekId: string, limit = 50) =>
    client.zrange(`week:${weekId}:scores`, 0, limit - 1, {
      rev: true,
      withScores: true,
    }),

  leaderboardCount: (weekId: string) => client.zcard(`week:${weekId}:scores`),

  playedCount: (weekId: string) => client.scard(`week:${weekId}:played`),
};
