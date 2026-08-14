import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";

export function GET(req: Request) {
  const url = new URL(req.url);
  const username = (url.searchParams.get("username") ?? "mystery_user").slice(0, 15);
  const score = url.searchParams.get("score") ?? "0";
  const streak = url.searchParams.get("streak") ?? "0";
  const rank = url.searchParams.get("rank") ?? "-";
  const weekId = url.searchParams.get("weekId") ?? "";
  const base = getSiteUrl();

  const qs = `username=${encodeURIComponent(username)}&score=${encodeURIComponent(score)}&streak=${encodeURIComponent(streak)}&rank=${encodeURIComponent(rank)}&weekId=${encodeURIComponent(weekId)}`;
  const imageUrl = `${base}/api/og?${qs}`;
  const playUrl = `${base}/play`;
  const title = `Mystery Predictor — @${username} scored ${score}`;
  const description = `Rank #${rank} in week ${weekId}. Think you can out-predict me? #MysteryPredictor`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Mystery Predictor share card" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${playUrl}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${imageUrl}" />
<meta name="twitter:url" content="${playUrl}" />
<style>
  body { margin: 0; background: #05060f; color: #e7e9f8; font-family: system-ui, sans-serif; display: flex; min-height: 100vh; align-items: center; justify-content: center; text-align: center; }
  img { max-width: 90vw; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
  a { color: #22d3ee; text-decoration: none; }
</style>
</head>
<body>
  <div>
    <a href="${playUrl}"><img src="${imageUrl}" width="1200" height="630" alt="Mystery Predictor share card" style="cursor:pointer;" /></a>
    <p>Score ${score} · Rank #${rank} · Week ${weekId}</p>
    <p><a href="${playUrl}" style="display:inline-block; padding:12px 28px; border-radius:9999px; background:linear-gradient(135deg,#a855f7,#22d3ee); color:#fff; font-weight:600;">Play Mystery Predictor</a></p>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}