import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "RetroGrade AI — Competitive Intelligence for Restaurants",
  description:
    "AI-powered competitive analysis for restaurants. Analyze reviews, beat competitors, and increase your ratings with actionable intelligence reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
