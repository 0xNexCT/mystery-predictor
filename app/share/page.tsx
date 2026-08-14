import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";

interface Props {
  searchParams: {
    username?: string;
    score?: string;
    streak?: string;
    rank?: string;
    weekId?: string;
  };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const username = (searchParams.username ?? "mystery_user").slice(0, 15);
  const score = searchParams.score ?? "0";
  const streak = searchParams.streak ?? "0";
  const rank = searchParams.rank ?? "-";
  const weekId = searchParams.weekId ?? "";
  const base = getSiteUrl();

  const imageUrl = `${base}/api/og?username=${encodeURIComponent(username)}&score=${encodeURIComponent(score)}&streak=${encodeURIComponent(streak)}&rank=${encodeURIComponent(rank)}&weekId=${encodeURIComponent(weekId)}`;
  const title = `Mystery Predictor — @${username} scored ${score}`;
  const description = `Rank #${rank} in week ${weekId}. Think you can out-predict me?`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "Mystery Predictor share card" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function SharePage({ searchParams }: Props) {
  const username = (searchParams.username ?? "mystery_user").slice(0, 15);
  const score = searchParams.score ?? "0";
  const streak = searchParams.streak ?? "0";
  const rank = searchParams.rank ?? "-";
  const weekId = searchParams.weekId ?? "";
  const base = getSiteUrl();

  const imageUrl = `${base}/api/og?username=${encodeURIComponent(username)}&score=${encodeURIComponent(score)}&streak=${encodeURIComponent(streak)}&rank=${encodeURIComponent(rank)}&weekId=${encodeURIComponent(weekId)}`;
  const text = `I scored ${score} in Mystery Predictor this week — rank #${rank}. Think you can out-predict me? #MysteryPredictor`;
  const tweetUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({ text, url: `${base}/share?username=${encodeURIComponent(username)}&score=${encodeURIComponent(score)}&streak=${encodeURIComponent(streak)}&rank=${encodeURIComponent(rank)}&weekId=${encodeURIComponent(weekId)}` }).toString()}`;

  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <p className="mb-4 text-xs tracking-[0.4em] text-cyan-300 uppercase">
        Week {weekId}
      </p>
      <h1 className="text-4xl font-extrabold text-glow">The Reveal</h1>
      <p className="mt-2 text-lg text-cyan-300">@{username}</p>

      <div className="mt-8 w-full max-w-xl overflow-hidden rounded-2xl border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Your Mystery Predictor share card"
          width={1200}
          height={630}
          className="w-full"
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Share on X
        </a>
        <Link href="/play" className="btn-ghost">
          Play Again
        </Link>
      </div>
    </main>
  );
}