"use client"

import { useEffect, useRef, useState } from "react"
import ThreatRadar from "./ThreatRadar"

/* ─── Scroll-reveal hook ────────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

/* ─── Animated counter ──────────────────────────────────────────────── */
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf: number
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])
  return count
}

/* ─── Reveal wrapper ────────────────────────────────────────────────── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, visible } = useReveal()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}

/* ─── Metric Card ──────────────────────────────────────────────────── */
function MetricCard({
  label,
  value,
  suffix = "",
  icon,
  color = "text-slate-800",
  delay = 0,
}: {
  label: string
  value: number
  suffix?: string
  icon: React.ReactNode
  color?: string
  delay?: number
}) {
  const { ref, visible } = useReveal()
  const count = useCounter(value, 2000, visible)

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-100 hover:border-slate-300 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
          {icon}
        </div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
      </div>
      <h2 className={`text-3xl font-bold ${color} tabular-nums tracking-tight`}>
        {count.toLocaleString()}{suffix}
      </h2>
    </div>
  )
}

/* ─── Keyword Tag ───────────────────────────────────────────────────── */
function KeywordTag({
  keyword,
  color,
  index,
}: {
  keyword: string
  color: "blue" | "green" | "red"
  index: number
}) {
  const colors = {
    blue: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    green: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    red: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
  }

  return (
    <span
      className={`${colors[color]} border px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 cursor-default`}
      style={{
        animation: `fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 50}ms both`,
      }}
    >
      {keyword}
    </span>
  )
}

/* ─── Check Item ────────────────────────────────────────────────────── */
function CheckItem({
  label,
  pass,
  note,
  delay = 0,
}: {
  label: string
  pass: boolean
  note: string
  delay?: number
}) {
  return (
    <div
      className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0"
      style={{
        animation: `fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
      }}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        pass ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
      }`}>
        {pass ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-medium ${pass ? "text-slate-800" : "text-red-700"}`}>{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{note}</p>
      </div>
    </div>
  )
}

/* ─── Cuisine Card (expandable) ─────────────────────────────────────── */
function CuisineCard({ cuisine: c }: { cuisine: any }) {
  const [expanded, setExpanded] = useState(false)
  const restaurants: { name: string; rating: number; reviews: number; distanceKm: number }[] = c.restaurants || []

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-amber-300 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800 group-hover:text-amber-700 transition-colors duration-300">
          {c.cuisine}
        </h3>
        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">
          {c.count} {c.count === 1 ? "place" : "places"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="bg-white rounded-lg p-2 border border-slate-100 text-center">
          <p className="text-slate-500 mb-0.5">Reviews</p>
          <p className="text-slate-800 font-bold text-sm tabular-nums">{c.totalVotes?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-lg p-2 border border-slate-100 text-center">
          <p className="text-slate-500 mb-0.5">Avg Rating</p>
          <p className="text-slate-800 font-bold text-sm">{c.avgRating} <span className="text-amber-500">&#9733;</span></p>
        </div>
        <div className="bg-white rounded-lg p-2 border border-slate-100 text-center">
          <p className="text-slate-500 mb-0.5">Photos</p>
          <p className="text-slate-800 font-bold text-sm">{c.withPhotos}/{c.count}</p>
        </div>
      </div>

      {/* Individual restaurants list */}
      {restaurants.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors duration-200 mb-2"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            {expanded ? "Hide" : "View"} Restaurants
          </button>

          {expanded && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {restaurants.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-100 text-xs"
                  style={{
                    animation: `fade-in-up 0.3s cubic-bezier(0.16,1,0.3,1) ${idx * 40}ms both`,
                  }}
                >
                  <span className="w-5 h-5 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-600 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 font-medium truncate flex-1">{r.name}</span>
                  <span className="text-amber-600 font-semibold shrink-0">{r.rating} <span className="text-amber-400">&#9733;</span></span>
                  <span className="text-slate-400 shrink-0 tabular-nums">{r.reviews?.toLocaleString()}</span>
                  <span className="text-slate-400 shrink-0">{r.distanceKm}km</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DashboardClient({ data }: any) {
  const competitors =
    data?.competitorAnalysis?.topCompetitors || []

  const newRestaurants =
    data?.competitorAnalysis?.newHighRatedRestaurants || []

  const cuisineBreakdown =
    data?.competitorAnalysis?.cuisineBreakdown || []

  const baseRestaurantCuisine: string =
    data?.competitorAnalysis?.baseRestaurantCuisine || ""

  const reviewMetrics = data?.reviewMetrics || {}
  const googleChecks = data?.googleProfileChecks || {}

  /* ─── Handle both old (string) and new (object) executiveSummary format ── */
  const execSummary = data?.executiveSummary
  const isStructuredSummary = typeof execSummary === "object" && execSummary !== null

  /* ─── Handle both old (array) and new (object) keyword format ── */
  const keywords = data?.yourKeywordCluster
  const isStructuredKeywords = typeof keywords === "object" && !Array.isArray(keywords) && keywords !== null

  const restaurantName = data?.restaurantName || "Your Restaurant"
  const restaurantCity = data?.restaurantCity || ""
  const generatedAt = data?.generatedAt ? new Date(data.generatedAt) : null
  const formattedDate = generatedAt
    ? generatedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null
  const formattedTime = generatedAt
    ? generatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null

  /* ─── Compute overall rank label ── */
  const avgThreat = data?.competitorAnalysis?.averageThreatScore || 0
  const overallRank = avgThreat >= 70 ? "Needs Attention" : avgThreat >= 45 ? "Doing Well" : "Excellent"
  const rankColor = avgThreat >= 70 ? "text-red-600" : avgThreat >= 45 ? "text-amber-600" : "text-emerald-600"
  const rankBg = avgThreat >= 70 ? "bg-red-50 border-red-200" : avgThreat >= 45 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"

  /* ─── Google checks labels ── */
  const checkLabels: Record<string, string> = {
    websiteAvailable: "Website Available",
    googlePageUpdated: "Google Page Updated",
    seoOptimised: "SEO Optimised",
    timingsUpdated: "Timings Updated",
    ownerPhotosAdded: "Images Added by Owner",
    respondingToReviews: "Responding to Reviews",
    menuAvailable: "Menu Available Online",
    contactInfoComplete: "Contact Info Complete",
  }

  const checksCount = Object.keys(googleChecks).length
  const passCount = Object.values(googleChecks).filter((c: any) => c?.pass).length

  /* ─── Competitor Ranking data ── */
  const competitorRanking = data?.competitorRanking || {}
  const topRanked: { rank: number; name: string; rating: number; reviews: number; isBase: boolean }[] = competitorRanking.topRanked || []

  /* ─── SEO checks ── */
  const seoChecks = data?.seoChecks || {}
  const seoSections = [
    {
      title: "Domain",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
      checks: seoChecks.domain || {},
    },
    {
      title: "Headline (H1)",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
      checks: seoChecks.headline || {},
    },
    {
      title: "Metadata",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
      checks: seoChecks.metadata || {},
    },
  ]

  /* ─── Search Rankings ── */
  const searchRankings: { query: string; topResult: any; baseRanked: boolean; basePosition: number | null; totalResults: number; inMapPack: boolean }[] = data?.searchRankings || []

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ═══════ HEADER ═══════ */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-emerald-200">
                R
              </div>
              <span className="text-sm text-emerald-600 font-semibold tracking-wide uppercase">RetroGrade AI</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-[0.2em] mb-2">
                  Competitive Intelligence Report
                </p>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  {restaurantName}
                </h1>
                {restaurantCity && (
                  <p className="text-slate-500 mt-1.5 text-base flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {restaurantCity}
                  </p>
                )}
                {formattedDate && (
                  <p className="text-slate-400 mt-1 text-sm flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    Generated on {formattedDate} at {formattedTime}
                  </p>
                )}
              </div>

              {/* Overall Rank Badge */}
              <div className={`inline-flex items-center gap-3 ${rankBg} border rounded-2xl px-6 py-3`}>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Overall Rank</p>
                  <p className={`text-lg font-bold ${rankColor}`}>{overallRank}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  avgThreat >= 70 ? "border-red-400 text-red-600" :
                  avgThreat >= 45 ? "border-amber-400 text-amber-600" : "border-emerald-400 text-emerald-600"
                }`}>
                  {avgThreat}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">

        {/* ═══════ REVIEW METRICS STRIP ═══════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total Reviews"
            value={reviewMetrics.totalReviews || 0}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>}
            color="text-slate-900"
            delay={0}
          />
          <MetricCard
            label="Review Percentile"
            value={reviewMetrics.reviewPercentile || 0}
            suffix="%"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
            color="text-emerald-700"
            delay={100}
          />
          <MetricCard
            label="Rating Percentile"
            value={reviewMetrics.ratingPercentile || 0}
            suffix="%"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>}
            color="text-amber-600"
            delay={200}
          />
          <MetricCard
            label="Competitors Nearby"
            value={reviewMetrics.totalCompetitors || competitors.length}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>}
            color="text-slate-900"
            delay={300}
          />
        </div>

        {/* ═══════ EXECUTIVE SUMMARY ═══════ */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Executive Summary</h2>
            </div>

            {isStructuredSummary ? (
              <div className="space-y-5">
                <div className="bg-slate-50 border-l-3 border-emerald-400 rounded-r-xl pl-5 pr-5 py-4">
                  <p className="text-slate-700 leading-relaxed text-base">
                    {execSummary.overview}
                  </p>
                </div>

                {execSummary.keyFindings?.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      Key Findings
                    </h3>
                    <ul className="space-y-2.5">
                      {execSummary.keyFindings.map((finding: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-slate-600 text-sm leading-relaxed">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {execSummary.immediateThreats && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        Immediate Threats
                      </h3>
                      <p className="text-red-800 text-sm leading-relaxed">{execSummary.immediateThreats}</p>
                    </div>
                  )}
                  {execSummary.growthOpportunities && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                        Growth Opportunities
                      </h3>
                      <p className="text-emerald-800 text-sm leading-relaxed">{execSummary.growthOpportunities}</p>
                    </div>
                  )}
                </div>

                {execSummary.recommendation && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Our Recommendation
                    </h3>
                    <p className="text-emerald-900 text-sm leading-relaxed font-medium">{execSummary.recommendation}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-600 leading-relaxed">{execSummary}</p>
            )}
          </div>
        </Reveal>

        {/* ═══════ YOU'RE RANKING BELOW X COMPETITORS ═══════ */}
        {topRanked.length > 0 && (
          <Reveal>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                    You&apos;re ranking below {competitorRanking.competitorsAbove || 0} competitor{(competitorRanking.competitorsAbove || 0) !== 1 ? "s" : ""}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your position: <span className="font-semibold text-slate-700">#{competitorRanking.rank || "—"}</span> out of {competitorRanking.total || "—"} restaurants within 5km
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-1">
                {topRanked.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                      r.isBase
                        ? "bg-emerald-50 border-2 border-emerald-300 shadow-sm"
                        : "bg-slate-50 border border-transparent hover:border-slate-200"
                    }`}
                    style={{ animation: `fade-in-up 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both` }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                      r.rank === 1 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                      r.rank === 2 ? "bg-slate-200 text-slate-600 border border-slate-300" :
                      r.rank === 3 ? "bg-orange-100 text-orange-700 border border-orange-200" :
                      "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      {r.rank}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${r.isBase ? "text-emerald-800" : "text-slate-700"}`}>
                        {r.name}
                        {r.isBase && (
                          <span className="ml-2 text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                            You
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-sm">
                      <span className="text-amber-600 font-semibold tabular-nums">
                        {r.rating} <span className="text-amber-400">&#9733;</span>
                      </span>
                      <span className="text-slate-400 tabular-nums text-xs">
                        {r.reviews?.toLocaleString()} reviews
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ═══════ THIS IS HOW YOU'RE DOING ONLINE ═══════ */}
        {searchRankings.length > 0 && (
          <Reveal>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">This is how you&apos;re doing online</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Where you are showing up when customers search, next to your competitors</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {searchRankings.map((sr, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all duration-200"
                    style={{ animation: `fade-in-up 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                          </svg>
                          &ldquo;{sr.query}&rdquo;
                        </p>

                        {sr.topResult && (
                          <p className="text-xs text-slate-500 mt-1.5 ml-5.5">
                            <span className="text-slate-400">#1 Result:</span>{" "}
                            <span className="font-medium text-slate-700">{sr.topResult.name}</span>
                            <span className="text-amber-500 ml-1">{sr.topResult.rating} &#9733;</span>
                            <span className="text-slate-400 ml-1">({sr.topResult.reviews?.toLocaleString()} reviews)</span>
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        {sr.inMapPack ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Top 3
                          </span>
                        ) : sr.baseRanked ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                            #{sr.basePosition}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Not ranked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <span className="font-semibold">What is SEO?</span> SEO (Search Engine Optimization) means improving your website so search engines like Google can find it, rank it higher, and help more people discover your restaurant when they search online.
                </p>
              </div>
            </div>
          </Reveal>
        )}

        {/* ═══════ SEO WEBSITE CHECKS ═══════ */}
        {seoChecks.websiteUrl !== undefined && (
          <Reveal>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">Website SEO Audit</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {seoChecks.websiteUrl ? (
                      <>Checked: <span className="font-medium text-slate-600">{seoChecks.websiteUrl}</span></>
                    ) : "No website found on Google profile"}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {seoSections.map((section, si) => {
                  const checks = Object.entries(section.checks)
                  const passed = checks.filter(([, v]: [string, any]) => v?.pass).length
                  return (
                    <div key={si} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                            {section.icon}
                          </div>
                          <h3 className="text-sm font-bold text-slate-800">{section.title}</h3>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          passed === checks.length ? "bg-emerald-100 text-emerald-700" :
                          passed > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                        }`}>
                          {passed}/{checks.length}
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {checks.map(([key, val]: [string, any], ci) => (
                          <div key={key} className="flex items-start gap-2.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              val?.pass ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                            }`}>
                              {val?.pass ? (
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-medium ${val?.pass ? "text-slate-700" : "text-red-700"}`}>
                                {key.replace(/([A-Z])/g, " $1").replace(/^./, (s: string) => s.toUpperCase())}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{val?.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Reveal>
        )}

        {/* ═══════ GOOGLE PROFILE CHECKS ═══════ */}
        {checksCount > 0 && (
          <Reveal>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900">Google Profile Checks</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Quick audit of your Google Business presence</p>
                  </div>
                </div>
                <div className={`text-sm font-bold px-4 py-2 rounded-full ${
                  passCount >= checksCount * 0.75 ? "bg-emerald-100 text-emerald-700" :
                  passCount >= checksCount * 0.5 ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {passCount}/{checksCount} Passed
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8">
                {Object.entries(googleChecks).map(([key, val]: [string, any], i: number) => (
                  <CheckItem
                    key={key}
                    label={checkLabels[key] || key}
                    pass={val?.pass ?? false}
                    note={val?.note || ""}
                    delay={i * 60}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ═══════ KEYWORD CLUSTER ═══════ */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Your Keyword Strategy</h2>
            </div>

            {isStructuredKeywords ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">Your Brand Keywords</h3>
                  <p className="text-xs text-slate-500 mb-3">Keywords that define your restaurant identity</p>
                  <div className="flex flex-wrap gap-2.5">
                    {(keywords.primary || []).map((kw: string, i: number) => (
                      <KeywordTag key={i} keyword={kw} color="blue" index={i} />
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">Positive Keywords</h3>
                  <p className="text-xs text-slate-500 mb-3">Keywords customers associate with great experiences</p>
                  <div className="flex flex-wrap gap-2.5">
                    {(keywords.positive || []).map((kw: string, i: number) => (
                      <KeywordTag key={i} keyword={kw} color="green" index={i} />
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-3">Negative Keywords to Avoid</h3>
                  <p className="text-xs text-slate-500 mb-3">Common complaints in your market</p>
                  <div className="flex flex-wrap gap-2.5">
                    {(keywords.negative || []).map((kw: string, i: number) => (
                      <KeywordTag key={i} keyword={kw} color="red" index={i} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {(Array.isArray(keywords) ? keywords : []).map(
                  (kw: string, i: number) => (
                    <KeywordTag key={i} keyword={kw} color="blue" index={i} />
                  )
                )}
              </div>
            )}
          </div>
        </Reveal>

        {/* ═══════ COMPETITIVE THREAT MAP ═══════ */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Competitive Threat Map</h2>
                <p className="text-xs text-slate-500 mt-0.5">How each competitor ranks on a 0-100 threat scale</p>
              </div>
            </div>
            <ThreatRadar competitors={competitors} />
          </div>
        </Reveal>

        {/* ═══════ CUISINE BREAKDOWN ═══════ */}
        {cuisineBreakdown.length > 0 && (
          <Reveal>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">Food Cuisine Breakdown</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Restaurants within 5km by cuisine type</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cuisineBreakdown.map((c: any, i: number) => (
                  <CuisineCard key={i} cuisine={c} />
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ═══════ COMPETITOR COMPARISON TABLE ═══════ */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Where Competition Beats You</h2>
                <p className="text-xs text-slate-500 mt-0.5">Strengths and weaknesses vs. each competitor</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left pb-3 text-slate-500 font-medium pr-4">Competitor</th>
                    <th className="text-left pb-3 text-slate-500 font-medium pr-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        They Do Better
                      </span>
                    </th>
                    <th className="text-left pb-3 text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        You Win Here
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((comp: any, i: number) => (
                    <tr
                      key={i}
                      className="border-t border-slate-100 hover:bg-slate-50 transition-colors duration-200"
                    >
                      <td className="py-4 pr-4 align-top">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0"
                            style={{
                              borderColor: comp.threatScore >= 75 ? "#fca5a5" : comp.threatScore >= 50 ? "#fcd34d" : "#6ee7b7",
                              color: comp.threatScore >= 75 ? "#dc2626" : comp.threatScore >= 50 ? "#d97706" : "#059669",
                              backgroundColor: comp.threatScore >= 75 ? "#fef2f2" : comp.threatScore >= 50 ? "#fffbeb" : "#ecfdf5",
                            }}
                          >
                            {comp.threatScore}
                          </div>
                          <div>
                            <p className="text-slate-800 font-medium">{comp.name}</p>
                            <p className="text-xs text-slate-400">{comp.distanceKm} km away</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 align-top">
                        <ul className="space-y-1.5">
                          {(comp.whatTheyDoBetter || comp.strengths || []).map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                              <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                              </svg>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-4 align-top">
                        <ul className="space-y-1.5">
                          {(comp.whereYouWin || comp.weaknesses || []).map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                              <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* ═══════ TOP COMPETITORS ═══════ */}
        <div>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Top 5 Competitors</h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            {competitors.map((comp: any, i: number) => (
              <Reveal key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 h-full relative overflow-hidden hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                    style={{
                      background: comp.threatScore >= 75 ? "linear-gradient(90deg, #ef4444, #f97316)" :
                        comp.threatScore >= 50 ? "linear-gradient(90deg, #f59e0b, #eab308)" :
                        "linear-gradient(90deg, #10b981, #34d399)",
                    }}
                  />

                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-slate-800">{comp.name}</h3>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full border"
                      style={{
                        borderColor: comp.threatScore >= 75 ? "#fca5a5" : comp.threatScore >= 50 ? "#fcd34d" : "#6ee7b7",
                        color: comp.threatScore >= 75 ? "#dc2626" : comp.threatScore >= 50 ? "#d97706" : "#059669",
                        backgroundColor: comp.threatScore >= 75 ? "#fef2f2" : comp.threatScore >= 50 ? "#fffbeb" : "#ecfdf5",
                      }}
                    >
                      {comp.threatScore}/100
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mb-4 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {comp.address}
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 mb-5">
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Rating</p>
                      <p className="text-sm font-bold text-slate-800">{comp.rating} <span className="text-amber-500 text-xs">&#9733;</span></p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Distance</p>
                      <p className="text-sm font-bold text-slate-800">{comp.distanceKm} km</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Sentiment</p>
                      <p className={`text-sm font-bold ${
                        comp.sentimentLabel === "Positive" ? "text-emerald-600" :
                        comp.sentimentLabel === "Negative" ? "text-red-500" : "text-amber-600"
                      }`}>{comp.sentimentLabel || "—"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-xs text-emerald-600 uppercase tracking-wider mb-2">Strengths</p>
                      <ul className="space-y-1.5">
                        {comp.strengths?.map((s: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-emerald-500 mt-0.5 text-xs">&#9679;</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-red-500 uppercase tracking-wider mb-2">Weaknesses</p>
                      <ul className="space-y-1.5">
                        {comp.weaknesses?.map((w: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-red-400 mt-0.5 text-xs">&#9679;</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ═══════ COMPETITOR KEYWORDS ═══════ */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Competitor Keyword Clusters</h2>
            </div>

            <div className="space-y-5">
              {data?.competitorKeywordClusters?.map((cluster: any, i: number) => (
                <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">{cluster.restaurant}</h3>
                  <div className="flex flex-wrap gap-2">
                    {cluster.keywords?.map((kw: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-violet-50 border border-violet-200 text-violet-700 px-3 py-1 rounded-full text-sm hover:bg-violet-100 transition-colors duration-300"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ═══════ NEW RESTAURANTS ═══════ */}
        <div>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Top 5 Newly Opened</h2>
            </div>
          </Reveal>

          {newRestaurants.length === 0 ? (
            <Reveal>
              <p className="text-slate-500 bg-slate-50 rounded-xl p-6 border border-slate-200">
                No new high-rated restaurants found nearby.
              </p>
            </Reveal>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {newRestaurants.map((r: any, i: number) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{r.name}</h3>
                    <p className="text-sm text-slate-400 mb-2">{r.address}</p>
                    <div className="flex gap-4">
                      <span className="text-sm text-slate-700">Rating: <span className="font-semibold">{r.rating}</span></span>
                      <span className="text-sm text-red-500">Threat: <span className="font-semibold">{r.threatScore}</span></span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {/* ═══════ FINAL VERDICT ═══════ */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 md:p-8 relative overflow-hidden hover:shadow-lg hover:shadow-emerald-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Final Strategic Verdict</h2>
            </div>
            <div className="bg-emerald-50 border-l-3 border-emerald-400 rounded-r-xl pl-5 pr-5 py-4">
              <p className="text-slate-700 leading-relaxed text-base">
                {data?.finalStrategicVerdict}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Back to home */}
        <Reveal className="text-center pb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-800 transition-colors duration-200 text-sm group"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span>Back to Home</span>
          </a>
        </Reveal>
      </div>
    </div>
  )
}
