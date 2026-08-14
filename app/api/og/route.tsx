import { ImageResponse } from "@vercel/og";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = (url.searchParams.get("username") ?? "mystery_user").slice(0, 15);
  const score = url.searchParams.get("score") ?? "0";
  const streak = url.searchParams.get("streak") ?? "0";
  const rank = url.searchParams.get("rank") ?? "-";
  const weekId = url.searchParams.get("weekId") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 20%, #1a1040 0%, #05060f 60%, #000 100%)",
          color: "#e7e9f8",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
            width: 420,
            height: 420,
            borderRadius: 9999,
            background:
              "radial-gradient(circle at 30% 30%, #ffffff 0%, #a855f7 35%, #7c3aed 60%, transparent 75%)",
            boxShadow: "0 0 120px rgba(168,85,247,0.6), 0 0 240px rgba(34,211,238,0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(34,211,238,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#22d3ee",
              marginBottom: 8,
            }}
          >
            Mystery Predictor
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, textAlign: "center" }}>
            {`@${username}`}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 48,
            padding: "24px 48px",
            borderRadius: 24,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Stat label="Score" value={score} color="#a855f7" />
          <Stat label="Streak" value={streak} color="#22d3ee" />
          <Stat label="Week Rank" value={`#${rank}`} color="#e7e9f8" />
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 20,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(231,233,248,0.5)",
          }}
        >
          {weekId}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 20,
          textTransform: "uppercase",
          letterSpacing: 3,
          color: "rgba(231,233,248,0.5)",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 48, fontWeight: 800, color, marginTop: 8 }}>
        {value}
      </div>
    </div>
  );
}
