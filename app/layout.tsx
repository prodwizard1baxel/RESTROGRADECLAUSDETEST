import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetroGrade — Competitive Intelligence for Restaurants",
  description:
    "Competition analysed for historic 2 years data. Analyze reviews, beat competitors, and increase your ratings with data-driven intelligence reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
