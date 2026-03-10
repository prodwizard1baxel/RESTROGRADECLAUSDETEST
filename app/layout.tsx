import type { Metadata } from "next";
import Script from "next/script";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RestoRank — Competitive Intelligence for Restaurants",
    template: "%s | RestoRank",
  },
  description:
    "Get a detailed competitive intelligence report for your restaurant in minutes. 2 years of historic data, Google Maps insights, competitor analysis, SEO keywords & more.",
  keywords: [
    "restaurant competitive intelligence",
    "restaurant competitor analysis",
    "Google Maps restaurant data",
    "restaurant SEO",
    "restaurant review analysis",
    "restaurant market research",
    "Zomato competitor analysis",
    "Swiggy competitor analysis",
    "restaurant business intelligence India",
    "restaurant analytics",
  ],
  authors: [{ name: "RestoRank" }],
  creator: "RestoRank",
  publisher: "RestoRank",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://restorank.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "RestoRank",
    title: "RestoRank — Competitive Intelligence for Restaurants",
    description:
      "Get a detailed competitive intelligence report for your restaurant in minutes. Powered by 2 years of real Google Maps data.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RestoRank — Restaurant Competitive Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RestoRank — Competitive Intelligence for Restaurants",
    description:
      "Get a detailed competitive intelligence report for your restaurant in minutes.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
