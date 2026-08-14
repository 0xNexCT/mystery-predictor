import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Mystery Predictor",
  description:
    "A cryptic weekly prediction game. Answer, reveal, and climb the leaderboard.",
  openGraph: {
    title: "Mystery Predictor",
    description:
      "A cryptic weekly prediction game. Answer, reveal, and climb the leaderboard.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="pb-6 text-center">
          <a
            href="https://x.com/0xNexCT"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--muted)] transition-colors hover:text-cyan-300"
          >
            Created by @0xNexCT
          </a>
        </footer>
      </body>
    </html>
  );
}
