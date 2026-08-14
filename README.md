# Mystery Predictor 🔮

A cryptic weekly prediction mini-game inspired by the world.xyz aesthetic — dark theme, glowing orb, neon purple/cyan accents. Answer 10 mystery questions, reveal the truth, and climb the weekly leaderboard.

> **Not financial advice.** All questions are evergreen trivia / fun "what happens next" prompts. No real-world predictions, no money, no tokens.

## Features

- **Anonymous identity** — a UUID cookie + username (3–15 chars, `[a-zA-Z0-9_]`). No auth provider needed.
- **10 questions per session** — randomly sampled from `data/questions.json`, with **no repeats for the same user within the same ISO week** (tracked in Redis sets).
- **Reveal animations** — glowing flip/rotate reveal after each answer, live score & streak.
- **Weekly leaderboard** — keyed by ISO week id (e.g. `2026-W34`). Old data is never deleted; queries always target the current week, so the board "resets" automatically each week.
- **Percentile + own rank** — even when you're outside the visible top 50.
- **Share card** — dynamic OG image (`@vercel/og`) with username, score, streak, week rank + "Share on X" pre-filled tweet intent (editable before posting; no auto-tagged accounts).

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (custom dark theme + glow utilities)
- Vercel KV (Upstash Redis) — falls back to an in-memory store for local dev when env vars are absent
- `@vercel/og` for share card images

## Project Structure

```
app/
  page.tsx                  Landing + username modal trigger
  play/page.tsx             Game screen
  leaderboard/page.tsx      Weekly leaderboard page
  api/user/route.ts         Create/check username
  api/questions/route.ts    Get unseen questions for the week
  api/score/route.ts        Submit session score
  api/leaderboard/route.ts  Current-week leaderboard
  api/og/route.tsx          Share card image generation
data/questions.json         Question pool (~35 questions)
lib/db.ts                   KV client wrapper (+ in-memory dev fallback)
lib/week.ts                 ISO week id helper
lib/auth.ts                 UUID/username validation + cookie helpers
lib/questions.ts            Question loading, shuffle, session picking
components/                 UsernameModal, QuestionCard, ResultsScreen, Leaderboard, Stars
```

## Local Development

```bash
npm install
npm run dev
```

No env vars needed locally — `lib/db.ts` auto-detects missing KV credentials and uses an in-memory store (resets on server restart).

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `KV_REST_API_URL` | Production | Vercel KV REST endpoint |
| `KV_REST_API_TOKEN` | Production | Vercel KV REST token |
| `KV_REST_API_READ_ONLY_TOKEN` | Optional | Read-only token |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public base URL (used for share cards / tweet links) |

See `.env.example`.

## Redis Key Patterns

```
user:{uuid}                         Hash  — username, createdAt
username:{lowercase}                Str   — uuid (claim map, NX)
session:{uuid}                      Hash  — username, startedAt
week:{weekId}:seen:{uuid}           Set   — question ids served this week
week:{weekId}:scores                ZSet  — member=uuid, score=cumulative (10 pts/correct)
week:{weekId}:played                Set   — distinct players this week (for percentile)
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new) — the Next.js preset is detected automatically.
3. Create a KV store: Vercel Dashboard → Storage → **KV** → Create → copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
4. Add both as environment variables in the Vercel project (Production + Preview), plus `NEXT_PUBLIC_SITE_URL=https://<your-project>.vercel.app`.
5. Deploy. Done.

Optional: add a Vercel Cron to snapshot weekly leaderboards for a future "Hall of Fame" page — the weekly reset itself needs no cron.

## Out of Scope (MVP)

- Real money, tokens, or crypto integration
- Auto-tagging any X/Twitter account in shared posts
- Auth beyond anonymous UUID + username