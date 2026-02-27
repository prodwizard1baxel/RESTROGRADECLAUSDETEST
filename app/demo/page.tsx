"use client"

import ThreatRadar from "../dashboard/[id]/ThreatRadar"

// ─── Mock Data ────────────────────────────────────────────────────────────────

const RESTAURANT = { name: "Spice Garden", city: "Bandra West, Mumbai" }

const EXECUTIVE_SUMMARY = {
  overview: "Spice Garden operates in a highly competitive corridor in Bandra West with 42 restaurants within 5km. Your 4.1 rating places you in the 65th percentile, but competitors like The Bombay Canteen lead with stronger digital presence and review volumes.",
  keyFindings: [
    "5 direct competitors within 2km serve the same North Indian cuisine, creating intense local competition",
    "Your Google Business Profile is missing 3 key optimisations that top competitors have completed",
    "Review volume (1,240) is 40% below the area average — more reviews will significantly boost visibility",
    "Swiggy and Zomato ratings lag behind the top 3 competitors by 0.3-0.5 points",
  ],
  immediateThreats: "The Bombay Canteen and Bastian dominate local search rankings with 3-4x your review volume. Pali Village Cafe at just 0.4km is your closest same-cuisine threat.",
  growthOpportunities: "Competitors are weak in regional authenticity and weekday lunch offerings. Owning keywords like 'best dal makhani Mumbai' and 'homestyle thali Bandra' is achievable within 3 months.",
  recommendation: "Prioritise Google Business Profile optimisation and launch a review collection campaign to close the gap with top competitors.",
}

const REVIEW_METRICS = {
  totalReviews: 1240,
  reviewPercentile: 65,
  ratingPercentile: 58,
  rating: 4.1,
  totalCompetitors: 42,
}

const GOOGLE_CHECKS = {
  websiteAvailable: { pass: true, note: "Website found: spicegarden.in" },
  googlePageUpdated: { pass: true, note: "Business is marked as operational on Google" },
  seoOptimised: { pass: true, note: "1,240 reviews and 4.1 rating help local SEO" },
  timingsUpdated: { pass: true, note: "Business hours are listed on Google" },
  ownerPhotosAdded: { pass: true, note: "12 photos found on profile" },
  respondingToReviews: { pass: false, note: "No owner responses found — respond to reviews to build trust" },
  menuAvailable: { pass: true, note: "Menu likely accessible via website" },
  contactInfoComplete: { pass: false, note: "No phone number found — add contact info to your profile" },
}

const YOUR_KEYWORDS = {
  primary: ["authentic Indian food Bandra", "best dal makhani Mumbai", "regional thali restaurant", "family dining Bandra West", "homestyle North Indian Mumbai", "butter chicken Bandra"],
  positive: ["authentic flavours", "generous portions", "family-friendly", "warm service", "value for money", "homestyle cooking"],
  negative: ["slow service", "crowded seating", "inconsistent quality", "long wait time", "stale food", "rude staff"],
}

const TOP_COMPETITORS = [
  { name: "The Bombay Canteen", address: "Unit-1, Process House, Kamala Mills, Lower Parel", rating: 4.5, totalRatings: 4820, distanceKm: 1.2, threatScore: 88, sameCuisineThreatScore: 75, sentimentLabel: "Very Positive", sentimentScore: 9.1, strengths: ["Iconic brand with national media coverage", "Strong cocktail & beverage programme", "Exceptional interior design and ambience"], weaknesses: ["Premium pricing alienates budget diners", "Long wait times on weekends", "Limited parking availability"], whatTheyDoBetter: ["Instagram-worthy plating drives organic social traffic", "Celebrity chef association builds trust"], whereYouWin: ["Authentic regional cuisine feels more genuine", "Better value pricing for families"], photoCount: 18, foodCuisine: "Modern Indian" },
  { name: "Bastian", address: "B/1, New Kamal Building, Linking Road, Bandra West", rating: 4.4, totalRatings: 3210, distanceKm: 0.7, threatScore: 83, sameCuisineThreatScore: 68, sentimentLabel: "Very Positive", sentimentScore: 8.8, strengths: ["Celebrity-chef association drives aspirational dining", "Seafood sourcing story resonates", "Strong repeat footfall"], weaknesses: ["Very high price point", "Cuisine overlap is limited", "Reservation-only model"], whatTheyDoBetter: ["Superior seafood menu variety", "Stronger brand positioning on Zomato"], whereYouWin: ["Vegetarian-friendly menu options", "Walk-in accessibility"], photoCount: 15, foodCuisine: "Seafood" },
  { name: "Pali Village Cafe", address: "Pali Naka, Bandra West", rating: 4.2, totalRatings: 2100, distanceKm: 0.4, threatScore: 74, sameCuisineThreatScore: 71, sentimentLabel: "Positive", sentimentScore: 7.9, strengths: ["Beloved neighbourhood spot with loyal regulars", "Outdoor seating is highly rated"], weaknesses: ["Service inconsistency in 1-star reviews", "Smaller kitchen limits menu"], whatTheyDoBetter: ["Better outdoor/pet-friendly ambience", "Stronger brunch positioning"], whereYouWin: ["More diverse menu for dinner crowd", "Better weekend availability"], photoCount: 10, foodCuisine: "Cafe" },
  { name: "Smoke House Deli", address: "Linking Road, Bandra West", rating: 4.0, totalRatings: 1870, distanceKm: 1.8, threatScore: 63, sameCuisineThreatScore: 55, sentimentLabel: "Positive", sentimentScore: 7.3, strengths: ["Chain brand recognition across Mumbai", "Consistent food quality across outlets"], weaknesses: ["Chain feel reduces uniqueness", "Menu changes infrequently"], whatTheyDoBetter: ["Brand consistency across multiple outlets", "Breakfast/brunch positioning"], whereYouWin: ["Authentic home-style cooking vs chain feel", "More unique dining experience"], photoCount: 8, foodCuisine: "Continental" },
  { name: "Sequel", address: "Ground Floor, Bandra Linking Road", rating: 4.1, totalRatings: 980, distanceKm: 1.1, threatScore: 58, sameCuisineThreatScore: 48, sentimentLabel: "Neutral-Positive", sentimentScore: 6.8, strengths: ["Strong positioning in vegan/healthy niche", "Active influencer collaborations"], weaknesses: ["Niche appeal limits total market", "Smaller review volume limits SEO authority"], whatTheyDoBetter: ["Stronger health-conscious positioning", "Better influencer marketing"], whereYouWin: ["Broader cuisine appeal", "Larger portion sizes for value"], photoCount: 6, foodCuisine: "Healthy" },
]

const COMPETITOR_RANKING = {
  rank: 8,
  total: 42,
  competitorsAbove: 7,
  topRanked: [
    { rank: 1, name: "The Bombay Canteen", rating: 4.5, reviews: 4820, isBase: false },
    { rank: 2, name: "Bastian", rating: 4.4, reviews: 3210, isBase: false },
    { rank: 3, name: "Pali Village Cafe", rating: 4.2, reviews: 2100, isBase: false },
    { rank: 4, name: "Smoke House Deli", rating: 4.0, reviews: 1870, isBase: false },
    { rank: 5, name: "Swati Snacks", rating: 4.6, reviews: 1650, isBase: false },
    { rank: 6, name: "Aswad Restaurant", rating: 4.4, reviews: 1420, isBase: false },
    { rank: 7, name: "Highway Gomantak", rating: 4.3, reviews: 1310, isBase: false },
    { rank: 8, name: "Spice Garden", rating: 4.1, reviews: 1240, isBase: true },
    { rank: 9, name: "Sequel", rating: 4.1, reviews: 980, isBase: false },
    { rank: 10, name: "Hotel Sagar", rating: 3.9, reviews: 870, isBase: false },
  ],
}

const DELIVERY_BENCHMARKS = [
  { name: "Spice Garden", isBase: true, address: "Bandra West, Mumbai", images: 18, zomatoRating: 3.9, swiggyRating: 4.0, topDishes: ["Dal Makhani", "Butter Chicken", "Paneer Tikka"], totalItems: 65, itemsAbove4Rating: 22 },
  { name: "The Bombay Canteen", isBase: false, address: "Lower Parel, Mumbai", images: 32, zomatoRating: 4.4, swiggyRating: 4.3, topDishes: ["Keema Pao", "Charcoal Chicken", "Crab Curry"], totalItems: 48, itemsAbove4Rating: 28 },
  { name: "Bastian", isBase: false, address: "Linking Road, Bandra West", images: 28, zomatoRating: 4.3, swiggyRating: 4.2, topDishes: ["Lobster Thermidor", "Fish Tacos", "Prawn Risotto"], totalItems: 42, itemsAbove4Rating: 24 },
  { name: "Pali Village Cafe", isBase: false, address: "Pali Naka, Bandra West", images: 15, zomatoRating: 4.1, swiggyRating: 4.0, topDishes: ["Eggs Benedict", "Avocado Toast", "Pancakes"], totalItems: 38, itemsAbove4Rating: 14 },
  { name: "Smoke House Deli", isBase: false, address: "Linking Road, Bandra West", images: 12, zomatoRating: 3.9, swiggyRating: 3.8, topDishes: ["Smoked Chicken", "Caesar Salad", "Pasta"], totalItems: 55, itemsAbove4Rating: 18 },
]

const STRATEGIC_VERDICT = "Spice Garden faces moderate-to-high competitive pressure. The primary threat comes from well-established restaurant brands with strong digital footprints. To counter this, prioritise Google Business Profile optimisation, invest in content marketing around regional cuisine keywords, and launch a weekday lunch deal to capture the underserved office crowd. Your cuisine niche is defensible — lean into it."

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CheckItem({ label, pass, note }: { label: string; pass: boolean; note: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${pass ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
        {pass ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{note}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const passCount = Object.values(GOOGLE_CHECKS).filter(c => c.pass).length
  const totalChecks = Object.values(GOOGLE_CHECKS).length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Demo Banner */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-center py-2.5 text-sm font-semibold tracking-wide">
        DEMO REPORT — Sample analysis for &quot;{RESTAURANT.name}, {RESTAURANT.city}&quot;
        <a href="/analyze" className="ml-4 underline font-bold text-emerald-700 hover:text-emerald-900">Run a real report &rarr;</a>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-emerald-200">R</div>
            <span className="text-sm text-emerald-600 font-semibold tracking-wide uppercase">RetroGrade</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-[0.2em] mb-2">Competitive Intelligence Report</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{RESTAURANT.name}</h1>
              <p className="text-slate-500 mt-1.5 text-base">{RESTAURANT.city}</p>
            </div>
            <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Overall Rank</p>
                <p className="text-lg font-bold text-amber-600">Doing Well</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 border-amber-400 text-amber-600">71</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">

        {/* Review Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Reviews", value: REVIEW_METRICS.totalReviews.toLocaleString(), color: "text-slate-900" },
            { label: "Review Percentile", value: `${REVIEW_METRICS.reviewPercentile}%`, color: "text-emerald-700" },
            { label: "Rating Percentile", value: `${REVIEW_METRICS.ratingPercentile}%`, color: "text-amber-600" },
            { label: "Competitors Tracked", value: REVIEW_METRICS.totalCompetitors, color: "text-violet-600" },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
              <p className="text-xs text-slate-500 mb-1.5">{m.label}</p>
              <p className={`text-2xl md:text-3xl font-bold tabular-nums ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Executive Summary</h2>
          <p className="text-slate-600 leading-relaxed mb-6">{EXECUTIVE_SUMMARY.overview}</p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {EXECUTIVE_SUMMARY.keyFindings.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-slate-50 rounded-xl p-3.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-slate-600 leading-relaxed">{f}</p>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-sm text-emerald-800 leading-relaxed"><span className="font-semibold">Recommendation:</span> {EXECUTIVE_SUMMARY.recommendation}</p>
          </div>
        </div>

        {/* Google Profile Checks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">Google Profile Audit</h2>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${passCount >= 6 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{passCount}/{totalChecks}</span>
          </div>
          <CheckItem label="Website Available" {...GOOGLE_CHECKS.websiteAvailable} />
          <CheckItem label="Google Page Updated" {...GOOGLE_CHECKS.googlePageUpdated} />
          <CheckItem label="SEO Optimised" {...GOOGLE_CHECKS.seoOptimised} />
          <CheckItem label="Timings Updated" {...GOOGLE_CHECKS.timingsUpdated} />
          <CheckItem label="Owner Photos Added" {...GOOGLE_CHECKS.ownerPhotosAdded} />
          <CheckItem label="Responding to Reviews" {...GOOGLE_CHECKS.respondingToReviews} />
          <CheckItem label="Menu Available" {...GOOGLE_CHECKS.menuAvailable} />
          <CheckItem label="Contact Info Complete" {...GOOGLE_CHECKS.contactInfoComplete} />
        </div>

        {/* Swiggy & Zomato Benchmark */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Swiggy & Zomato Benchmark</h2>
          <p className="text-xs text-slate-500 mb-6">Top same-cuisine competitors on delivery platforms</p>
          <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left pb-3 text-slate-500 font-semibold text-xs uppercase tracking-wider pr-3">Restaurant</th>
                  <th className="text-center pb-3 text-slate-500 font-semibold text-xs uppercase tracking-wider px-2">Images</th>
                  <th className="text-center pb-3 text-red-500 font-semibold text-xs uppercase tracking-wider px-2">Zomato</th>
                  <th className="text-center pb-3 text-orange-500 font-semibold text-xs uppercase tracking-wider px-2">Swiggy</th>
                  <th className="text-left pb-3 text-slate-500 font-semibold text-xs uppercase tracking-wider px-2">Top Dishes</th>
                  <th className="text-center pb-3 text-slate-500 font-semibold text-xs uppercase tracking-wider px-2">Menu Items</th>
                  <th className="text-center pb-3 text-slate-500 font-semibold text-xs uppercase tracking-wider px-2">4+ Rated</th>
                </tr>
              </thead>
              <tbody>
                {DELIVERY_BENCHMARKS.map((b, i) => (
                  <tr key={i} className={`border-t border-slate-100 ${b.isBase ? "bg-emerald-50/60" : "hover:bg-slate-50"}`}>
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-medium ${b.isBase ? "text-emerald-800" : "text-slate-700"}`}>{b.name}</span>
                        {b.isBase && <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full uppercase">You</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{b.address}</p>
                    </td>
                    <td className="py-3.5 text-center px-2 font-semibold tabular-nums">{b.images}</td>
                    <td className="py-3.5 text-center px-2"><span className={`font-bold tabular-nums ${b.zomatoRating >= 4.0 ? "text-emerald-600" : "text-amber-600"}`}>{b.zomatoRating.toFixed(1)}</span></td>
                    <td className="py-3.5 text-center px-2"><span className={`font-bold tabular-nums ${b.swiggyRating >= 4.0 ? "text-emerald-600" : "text-amber-600"}`}>{b.swiggyRating.toFixed(1)}</span></td>
                    <td className="py-3.5 px-2">
                      <div className="flex flex-wrap gap-1">
                        {b.topDishes.map((d, di) => <span key={di} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[11px] font-medium">{d}</span>)}
                      </div>
                    </td>
                    <td className="py-3.5 text-center px-2 font-semibold tabular-nums">{b.totalItems}</td>
                    <td className="py-3.5 text-center px-2">
                      <span className="font-bold tabular-nums text-emerald-600">{b.itemsAbove4Rating}</span>
                      <span className="text-slate-400 text-[11px] ml-0.5">({Math.round((b.itemsAbove4Rating / b.totalItems) * 100)}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Competitor Ranking */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Competitor Ranking</h2>
          <p className="text-xs text-slate-500 mb-6">Your position among {COMPETITOR_RANKING.total} restaurants within 5km</p>
          <div className="space-y-2">
            {COMPETITOR_RANKING.topRanked.map((r) => (
              <div key={r.rank} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${r.isBase ? "bg-emerald-50 border border-emerald-200" : "hover:bg-slate-50"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${r.rank <= 3 ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>{r.rank}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${r.isBase ? "text-emerald-800" : "text-slate-700"}`}>
                    {r.name}
                    {r.isBase && <span className="ml-2 text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full uppercase">You</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-sm">
                  <span className="text-amber-600 font-semibold tabular-nums">{r.rating} &#9733;</span>
                  <span className="text-slate-400 tabular-nums text-xs">{r.reviews?.toLocaleString()} reviews</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Map + Keywords side-by-side */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Competitive Threat Map</h2>
            <ThreatRadar competitors={TOP_COMPETITORS} />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your SEO Keyword Clusters</h2>
            <p className="text-xs text-slate-500 mb-5">Own these search terms to drive organic discovery.</p>
            <div className="mb-4">
              <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wider">Primary Keywords</p>
              <div className="flex flex-wrap gap-2">
                {YOUR_KEYWORDS.primary.map((kw, i) => <span key={i} className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium">{kw}</span>)}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">Positive Signals</p>
              <div className="flex flex-wrap gap-2">
                {YOUR_KEYWORDS.positive.map((kw, i) => <span key={i} className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">{kw}</span>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wider">Watch Out For</p>
              <div className="flex flex-wrap gap-2">
                {YOUR_KEYWORDS.negative.map((kw, i) => <span key={i} className="bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-full text-xs font-medium">{kw}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Top Competitors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">Top 5 Competitors</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {TOP_COMPETITORS.map((c, i) => (
              <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-lg text-slate-800">{c.name}</h3>
                  <span className={`shrink-0 text-sm font-bold px-3 py-1 rounded-full ${c.threatScore >= 80 ? "bg-red-100 text-red-600" : c.threatScore >= 60 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>{c.threatScore}</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{c.address}</p>
                <div className="flex gap-4 text-sm text-slate-500 mb-4">
                  <span className="text-amber-600 font-semibold">{c.rating} &#9733; <span className="text-slate-400 font-normal">({c.totalRatings.toLocaleString()})</span></span>
                  <span>{c.distanceKm} km</span>
                  <span className="text-slate-400">{c.sentimentLabel}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 mb-1.5">What They Do Better</p>
                    <ul className="text-xs text-slate-500 space-y-1">{c.whatTheyDoBetter?.map((s, j) => <li key={j}>&#8226; {s}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 mb-1.5">Where You Win</p>
                    <ul className="text-xs text-slate-500 space-y-1">{c.whereYouWin?.map((w, j) => <li key={j}>&#8226; {w}</li>)}</ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Verdict */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Final Strategic Verdict</h2>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <p className="text-slate-700 leading-relaxed">{STRATEGIC_VERDICT}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8 border-t border-slate-200">
          <p className="text-slate-500 mb-6 text-lg">This is sample data. Run a real analysis for your restaurant.</p>
          <a href="/analyze" className="inline-block cta-gradient text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200">
            Get My Restaurant Report &rarr;
          </a>
        </div>

      </div>
    </div>
  )
}
