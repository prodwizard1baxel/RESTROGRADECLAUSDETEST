"use client"

import ThreatRadar from "../dashboard/[id]/ThreatRadar"

// ─── Mock Data ────────────────────────────────────────────────────────────────

const RESTAURANT = { name: "Spice Garden", city: "Bandra West, Mumbai" }

const KPI = {
  threatIndex: 71,
  overallThreatLevel: "Moderate-High",
  revenueLoss: 48000,
  revenueGain: 85000,
}

const EXECUTIVE_SUMMARY =
  "Spice Garden operates in a highly competitive corridor in Bandra West, Mumbai. The top 5 nearby competitors maintain an average rating of 4.3 stars with strong review volumes, posing a significant threat to market share. Competitors like The Bombay Canteen and Bastian lead with exceptional branding, food quality, and online visibility. However, Spice Garden has a clear opportunity to differentiate through regional authenticity, aggressive SEO keyword ownership, and loyalty programs. Immediate action on digital presence and menu storytelling is recommended."

const STRATEGIC_VERDICT =
  "Spice Garden faces moderate-to-high competitive pressure. The primary threat comes from well-funded restaurant brands with polished digital footprints. To counter this, prioritise Google Business Profile optimisation, invest in content marketing around regional cuisine keywords, and launch a weekday lunch deal to capture the underserved office crowd. Your cuisine niche is defensible — lean into it."

const YOUR_KEYWORDS = [
  "authentic Indian food Bandra",
  "best dal makhani Mumbai",
  "regional thali restaurant",
  "family dining Bandra West",
  "homestyle North Indian Mumbai",
  "butter chicken Bandra",
]

const TOP_COMPETITORS = [
  {
    name: "The Bombay Canteen",
    address: "Unit-1, Process House, Kamala Mills, Lower Parel",
    rating: 4.5,
    totalRatings: 4820,
    distanceKm: 1.2,
    threatScore: 88,
    sentimentLabel: "Very Positive",
    sentimentScore: 9.1,
    strengths: [
      "Iconic brand with national media coverage",
      "Strong cocktail & beverage programme",
      "Exceptional interior design and ambience",
    ],
    weaknesses: [
      "Premium pricing alienates budget diners",
      "Long wait times on weekends",
      "Limited parking availability",
    ],
    keywords: ["modern Indian cuisine", "craft cocktails Mumbai", "upscale dining Bandra"],
  },
  {
    name: "Bastian",
    address: "B/1, New Kamal Building, Linking Road, Bandra West",
    rating: 4.4,
    totalRatings: 3210,
    distanceKm: 0.7,
    threatScore: 83,
    sentimentLabel: "Very Positive",
    sentimentScore: 8.8,
    strengths: [
      "Celebrity-chef association drives aspirational dining",
      "Seafood sourcing story resonates with customers",
      "Strong repeat footfall from affluent clientele",
    ],
    weaknesses: [
      "Very high price point",
      "Cuisine overlap with Indian crowd is limited",
      "Reservation-only reduces walk-in traffic",
    ],
    keywords: ["seafood restaurant Mumbai", "celebrity chef restaurant", "fine dining Bandra"],
  },
  {
    name: "Pali Village Cafe",
    address: "Pali Naka, Bandra West",
    rating: 4.2,
    totalRatings: 2100,
    distanceKm: 0.4,
    threatScore: 74,
    sentimentLabel: "Positive",
    sentimentScore: 7.9,
    strengths: [
      "Beloved neighbourhood spot with loyal regulars",
      "Outdoor seating is highly rated in reviews",
    ],
    weaknesses: [
      "Service inconsistency highlighted in 1-star reviews",
      "Smaller kitchen limits menu variety",
    ],
    keywords: ["brunch Bandra", "outdoor seating Mumbai", "pet-friendly cafe"],
  },
  {
    name: "Smoke House Deli",
    address: "Linking Road, Bandra West",
    rating: 4.0,
    totalRatings: 1870,
    distanceKm: 1.8,
    threatScore: 63,
    sentimentLabel: "Positive",
    sentimentScore: 7.3,
    strengths: [
      "Chain brand recognition across Mumbai",
      "Consistent food quality across outlets",
    ],
    weaknesses: [
      "Chain feel reduces uniqueness",
      "Menu changes infrequently",
    ],
    keywords: ["deli food Mumbai", "healthy breakfast Bandra", "salads Mumbai"],
  },
  {
    name: "Sequel",
    address: "Ground Floor, Bandra Linking Road",
    rating: 4.1,
    totalRatings: 980,
    distanceKm: 1.1,
    threatScore: 58,
    sentimentLabel: "Neutral-Positive",
    sentimentScore: 6.8,
    strengths: [
      "Strong positioning in growing vegan/healthy niche",
      "Active influencer collaborations",
    ],
    weaknesses: [
      "Niche appeal limits total addressable market",
      "Smaller review volume limits SEO authority",
    ],
    keywords: ["vegan food Mumbai", "healthy restaurant Bandra", "gluten-free Mumbai"],
  },
]

const SAME_CUISINE = [
  { name: "Highway Gomantak", rating: 4.3, distanceKm: 2.1, threatScore: 69 },
  { name: "Aswad Restaurant", rating: 4.4, distanceKm: 3.4, threatScore: 72 },
  { name: "Rajdhani", rating: 4.2, distanceKm: 4.2, threatScore: 65 },
  { name: "Hotel Sagar", rating: 3.9, distanceKm: 1.6, threatScore: 54 },
  { name: "Swati Snacks", rating: 4.6, distanceKm: 4.8, threatScore: 80 },
]

const NEW_RESTAURANTS = [
  { name: "The Bohri Kitchen", rating: 4.5, totalRatings: 87, threatScore: 62 },
  { name: "Gaia", rating: 4.3, totalRatings: 44, threatScore: 55 },
  { name: "Cariappa", rating: 4.4, totalRatings: 110, threatScore: 61 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function threatColor(score: number) {
  if (score >= 80) return "text-red-400"
  if (score >= 60) return "text-yellow-400"
  return "text-green-400"
}

function threatBg(score: number) {
  if (score >= 80) return "bg-red-500/20 border-red-500/40 text-red-400"
  if (score >= 60) return "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
  return "bg-green-500/20 border-green-500/40 text-green-400"
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* Demo Banner */}
      <div className="bg-yellow-500 text-black text-center py-2.5 text-sm font-semibold tracking-wide">
        DEMO REPORT — Sample analysis for &quot;{RESTAURANT.name}, {RESTAURANT.city}&quot;. No real API calls.
        <a href="/analyze" className="ml-4 underline font-bold">Run a real report →</a>
      </div>

      {/* Header */}
      <div className="px-8 md:px-16 py-12 border-b border-neutral-800 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm text-yellow-500 font-semibold uppercase tracking-widest mb-2">
            Competitive Intelligence Report
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{RESTAURANT.name}</h1>
          <p className="text-neutral-400 mt-2 text-lg">{RESTAURANT.city}</p>
        </div>
        <div className="text-sm text-neutral-500 md:text-right">
          <p>Overall Threat Level</p>
          <p className="text-2xl font-semibold text-yellow-400 mt-1">{KPI.overallThreatLevel}</p>
        </div>
      </div>

      <div className="px-8 md:px-16 py-12 space-y-16">

        {/* KPI Strip */}
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <p className="text-sm text-neutral-400 mb-1">Threat Index</p>
            <p className={`text-4xl font-bold ${threatColor(KPI.threatIndex)}`}>
              {KPI.threatIndex}<span className="text-xl font-normal text-neutral-500">/100</span>
            </p>
          </div>

          <div className="bg-red-950/30 border border-red-700/30 rounded-2xl p-6">
            <p className="text-sm text-neutral-400 mb-1">Est. Monthly Revenue at Risk</p>
            <p className="text-4xl font-bold text-red-400">
              ₹{KPI.revenueLoss.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-700/30 rounded-2xl p-6">
            <p className="text-sm text-neutral-400 mb-1">Revenue Recovery Opportunity</p>
            <p className="text-4xl font-bold text-emerald-400">
              ₹{KPI.revenueGain.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Executive Summary</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-7">
            <p className="text-neutral-300 leading-relaxed text-base">{EXECUTIVE_SUMMARY}</p>
          </div>
        </section>

        {/* Radar + Your Keywords side-by-side */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-7">
            <h2 className="text-xl font-semibold mb-6">Competitive Threat Map</h2>
            <ThreatRadar competitors={TOP_COMPETITORS} />
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-7">
            <h2 className="text-xl font-semibold mb-2">Your SEO Keyword Cluster</h2>
            <p className="text-sm text-neutral-400 mb-5">
              Own these search terms to drive organic discovery.
            </p>
            <div className="flex flex-wrap gap-3">
              {YOUR_KEYWORDS.map((kw, i) => (
                <span
                  key={i}
                  className="bg-blue-600/20 border border-blue-600/50 text-blue-300 px-3 py-1.5 rounded-full text-sm"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Top Competitors */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Top 5 Competitors</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {TOP_COMPETITORS.map((c, i) => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-lg leading-snug">{c.name}</h3>
                  <span className={`shrink-0 text-sm font-bold border px-3 py-1 rounded-full ${threatBg(c.threatScore)}`}>
                    {c.threatScore}
                  </span>
                </div>

                <p className="text-sm text-neutral-400 mb-4">📍 {c.address}</p>

                <div className="flex gap-5 text-sm text-neutral-300 mb-4">
                  <span>⭐ {c.rating} <span className="text-neutral-500">({c.totalRatings.toLocaleString("en-IN")})</span></span>
                  <span>📏 {c.distanceKm} km</span>
                  <span>💬 {c.sentimentLabel}</span>
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {c.keywords.map((kw, j) => (
                    <span key={j} className="bg-purple-600/15 border border-purple-600/40 text-purple-300 px-2.5 py-0.5 rounded-full text-xs">
                      {kw}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-emerald-400 mb-1.5">Strengths</p>
                    <ul className="text-xs text-neutral-300 space-y-1">
                      {c.strengths.map((s, j) => <li key={j} className="leading-snug">• {s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-1.5">Weaknesses</p>
                    <ul className="text-xs text-neutral-300 space-y-1">
                      {c.weaknesses.map((w, j) => <li key={j} className="leading-snug">• {w}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Same Cuisine + New Restaurants side-by-side */}
        <section className="grid md:grid-cols-2 gap-8">

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-7">
            <h2 className="text-xl font-semibold mb-5">Same Cuisine Nearby (≤5 km)</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-neutral-400 text-xs uppercase tracking-wide border-b border-neutral-800">
                  <th className="text-left pb-2">Restaurant</th>
                  <th className="pb-2">Rating</th>
                  <th className="pb-2">km</th>
                  <th className="pb-2">Threat</th>
                </tr>
              </thead>
              <tbody>
                {SAME_CUISINE.map((r, i) => (
                  <tr key={i} className="border-b border-neutral-800/60">
                    <td className="py-2.5 font-medium">{r.name}</td>
                    <td className="py-2.5 text-center text-yellow-300">⭐ {r.rating}</td>
                    <td className="py-2.5 text-center text-neutral-400">{r.distanceKm}</td>
                    <td className={`py-2.5 text-center font-bold ${threatColor(r.threatScore)}`}>{r.threatScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-7">
            <h2 className="text-xl font-semibold mb-2">Newly Opened — High Rated</h2>
            <p className="text-sm text-neutral-400 mb-5">Emerging competitors with &lt;120 reviews but strong early ratings.</p>
            <div className="space-y-3">
              {NEW_RESTAURANTS.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-neutral-800/50 rounded-xl px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">⭐ {r.rating} · {r.totalRatings} reviews</p>
                  </div>
                  <span className={`text-sm font-bold border px-3 py-1 rounded-full ${threatBg(r.threatScore)}`}>
                    {r.threatScore}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* Strategic Verdict */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Final Strategic Verdict</h2>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-7">
            <p className="text-yellow-100 leading-relaxed text-base">{STRATEGIC_VERDICT}</p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8 border-t border-neutral-800">
          <p className="text-neutral-400 mb-6 text-lg">
            This is sample data. Run a real analysis for your restaurant.
          </p>
          <a
            href="/analyze"
            className="inline-block bg-yellow-500 text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors"
          >
            Get My Restaurant Report →
          </a>
        </section>

      </div>
    </div>
  )
}
