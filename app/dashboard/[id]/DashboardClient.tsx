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

/* ─── Animated KPI Card ─────────────────────────────────────────────── */
function KpiCard({
  label,
  value,
  prefix = "",
  suffix = "",
  color = "text-white",
  borderColor = "border-green-500/20",
  bgColor = "bg-neutral-900/80",
  delay = 0,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  color?: string
  borderColor?: string
  bgColor?: string
  delay?: number
}) {
  const { ref, visible } = useReveal()
  const count = useCounter(value, 2000, visible)

  return (
    <div
      ref={ref}
      className={`${bgColor} p-6 rounded-2xl border ${borderColor} dashboard-card relative overflow-hidden`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/[0.02] to-transparent rounded-bl-full" />
      <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-3">{label}</p>
      <h2 className={`text-3xl font-bold ${color} tabular-nums tracking-tight`}>
        {prefix}{count.toLocaleString()}{suffix}
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
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20",
    green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20",
    red: "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20",
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

export default function DashboardClient({ data }: any) {
  const competitors =
    data?.competitorAnalysis?.topCompetitors || []

  const sameCuisine =
    data?.competitorAnalysis?.sameCuisineNearby || []

  const newRestaurants =
    data?.competitorAnalysis?.newHighRatedRestaurants || []

  const avgThreat =
    data?.competitorAnalysis?.averageThreatScore || 0

  const threatLevel =
    data?.competitorAnalysis?.overallThreatLevel || "Moderate"

  const cuisineBreakdown =
    data?.competitorAnalysis?.cuisineBreakdown || []

  const baseRestaurantCuisine: string =
    data?.competitorAnalysis?.baseRestaurantCuisine || ""

  /* ─── Handle both old (string) and new (object) executiveSummary format ── */
  const execSummary = data?.executiveSummary
  const isStructuredSummary = typeof execSummary === "object" && execSummary !== null

  /* ─── Handle both old (array) and new (object) keyword format ── */
  const keywords = data?.yourKeywordCluster
  const isStructuredKeywords = typeof keywords === "object" && !Array.isArray(keywords) && keywords !== null

  const restaurantName = data?.restaurantName || "Your Restaurant"
  const restaurantCity = data?.restaurantCity || ""

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-500/[0.03] rounded-full blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* ═══════ HEADER with Restaurant Name ═══════ */}
      <div className="relative px-6 md:px-10 py-10 md:py-14 border-b border-green-500/10">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-black text-sm shadow-lg shadow-green-500/20">
                R
              </div>
              <span className="text-sm text-green-400 font-medium tracking-wide uppercase">RetroGrade AI</span>
            </div>
          </Reveal>

          {/* Restaurant identity - prominent at top */}
          <Reveal delay={100}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-xs text-green-400 font-semibold uppercase tracking-[0.2em] mb-3">
                  Competitive Intelligence Report
                </p>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight gradient-text-animated">
                  {restaurantName}
                </h1>
                {restaurantCity && (
                  <p className="text-neutral-400 mt-2 text-base md:text-lg flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {restaurantCity}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 bg-neutral-900/60 border border-white/[0.06] rounded-xl px-5 py-3">
                <div className="text-right">
                  <p className="text-xs text-neutral-500 mb-0.5">Overall Threat Level</p>
                  <p className={`text-lg font-bold ${
                    threatLevel === "High" ? "text-red-400" :
                    threatLevel === "Moderate" ? "text-amber-400" : "text-green-400"
                  }`}>
                    {threatLevel}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                    threatLevel === "High" ? "border-red-500 text-red-400" :
                    threatLevel === "Moderate" ? "border-amber-500 text-amber-400" : "border-green-500 text-green-400"
                  }`}
                >
                  {avgThreat}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-12 md:space-y-16">

        {/* ═══════ KPI STRIP ═══════ */}
        <div className="grid md:grid-cols-3 gap-5">
          <KpiCard
            label="Threat Index"
            value={avgThreat}
            suffix="/100"
            color="text-white"
            borderColor="border-green-500/15"
            bgColor="bg-neutral-900/60"
            delay={0}
          />
          <KpiCard
            label="Competitors Analyzed"
            value={competitors.length}
            suffix=" found"
            color="text-blue-400"
            borderColor="border-blue-500/20"
            bgColor="bg-blue-950/20"
            delay={100}
          />
          <KpiCard
            label="Same Cuisine Nearby"
            value={sameCuisine.length}
            suffix=" within 5km"
            color="text-amber-400"
            borderColor="border-amber-500/20"
            bgColor="bg-amber-950/20"
            delay={200}
          />
        </div>

        {/* ═══════ EXECUTIVE SUMMARY (Structured) ═══════ */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold gradient-text">Executive Summary</h2>
            </div>

            {isStructuredSummary ? (
              <div className="space-y-6">
                {/* Overview */}
                <div className="bg-neutral-800/15 border-l-2 border-green-500/40 rounded-r-xl pl-5 pr-5 py-4">
                  <p className="text-neutral-200 leading-relaxed text-base">
                    {execSummary.overview}
                  </p>
                </div>

                {/* Key Findings */}
                {execSummary.keyFindings?.length > 0 && (
                  <div className="bg-neutral-800/20 border border-white/[0.04] rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      Key Findings
                    </h3>
                    <ul className="space-y-2.5">
                      {execSummary.keyFindings.map((finding: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-neutral-300 text-sm leading-relaxed">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Threats & Opportunities side by side */}
                <div className="grid md:grid-cols-2 gap-4">
                  {execSummary.immediateThreats && (
                    <div className="bg-red-950/15 border border-red-500/10 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        Immediate Threats
                      </h3>
                      <p className="text-neutral-300 text-sm leading-relaxed">{execSummary.immediateThreats}</p>
                    </div>
                  )}
                  {execSummary.growthOpportunities && (
                    <div className="bg-emerald-950/15 border border-emerald-500/10 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                        Growth Opportunities
                      </h3>
                      <p className="text-neutral-300 text-sm leading-relaxed">{execSummary.growthOpportunities}</p>
                    </div>
                  )}
                </div>

                {/* Recommendation */}
                {execSummary.recommendation && (
                  <div className="bg-green-500/[0.06] border border-green-500/15 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Our Recommendation
                    </h3>
                    <p className="text-white text-sm leading-relaxed font-medium">{execSummary.recommendation}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Fallback for old string-format summaries */
              <p className="text-neutral-300 leading-relaxed">
                {execSummary}
              </p>
            )}
          </div>
        </Reveal>

        {/* ═══════ KEYWORD CLUSTER (Bifurcated) ═══════ */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold gradient-text">Your Keyword Strategy</h2>
            </div>

            {isStructuredKeywords ? (
              <div className="space-y-6">
                {/* Primary Keywords */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    </svg>
                    Your Brand Keywords
                  </h3>
                  <p className="text-xs text-neutral-500 mb-3">Keywords that define your restaurant identity and should be present in your online profiles</p>
                  <div className="flex flex-wrap gap-2.5">
                    {(keywords.primary || []).map((kw: string, i: number) => (
                      <KeywordTag key={i} keyword={kw} color="blue" index={i} />
                    ))}
                  </div>
                </div>

                {/* Positive Keywords */}
                <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                    </svg>
                    Positive Keywords
                  </h3>
                  <p className="text-xs text-neutral-500 mb-3">Keywords customers associate with great experiences - aim to trigger these in reviews</p>
                  <div className="flex flex-wrap gap-2.5">
                    {(keywords.positive || []).map((kw: string, i: number) => (
                      <KeywordTag key={i} keyword={kw} color="green" index={i} />
                    ))}
                  </div>
                </div>

                {/* Negative Keywords */}
                <div className="bg-red-950/10 border border-red-500/10 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
                    </svg>
                    Negative Keywords to Avoid
                  </h3>
                  <p className="text-xs text-neutral-500 mb-3">Common complaints in your market - make sure these never appear in your reviews</p>
                  <div className="flex flex-wrap gap-2.5">
                    {(keywords.negative || []).map((kw: string, i: number) => (
                      <KeywordTag key={i} keyword={kw} color="red" index={i} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback for old array format */
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

        {/* ═══════ COMPETITION THREAT MAP (Clearer) ═══════ */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold gradient-text">Competitive Threat Map</h2>
                <p className="text-xs text-neutral-500 mt-0.5">How each competitor ranks against {restaurantName} on a 0-100 threat scale</p>
              </div>
            </div>
            <ThreatRadar competitors={competitors} />
          </div>
        </Reveal>

        {/* ═══════ SAME CUISINE THREAT MAP (within 5km) ═══════ */}
        {sameCuisine.length > 0 && (
          <Reveal>
            <div className="dashboard-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold gradient-text">
                    {baseRestaurantCuisine ? `${baseRestaurantCuisine} Competition` : "Same Cuisine Threat Map"} (within 5km)
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {baseRestaurantCuisine
                      ? `Only ${baseRestaurantCuisine} restaurants near you — scored by proximity, ratings, and reviews`
                      : "Competitors in your cuisine category nearby — scored by proximity, ratings, reviews, and cuisine match"
                    }
                    {baseRestaurantCuisine && (
                      <span className="text-green-400/60"> — {sameCuisine.length} direct competitors found</span>
                    )}
                  </p>
                </div>
              </div>
              <ThreatRadar competitors={sameCuisine} scoreKey="sameCuisineThreatScore" />
            </div>
          </Reveal>
        )}

        {/* ═══════ CUISINE BREAKDOWN ANALYSIS ═══════ */}
        {cuisineBreakdown.length > 0 && (
          <Reveal>
            <div className="dashboard-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold gradient-text">Food Cuisine Breakdown</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">What people are eating within 5km — restaurants, total votes, and ratings by cuisine</p>
                </div>
              </div>

              {/* Cuisine cards grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {cuisineBreakdown.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="bg-neutral-800/30 border border-white/[0.06] rounded-xl p-5 hover:border-orange-500/20 transition-all duration-300 group"
                  >
                    {/* Cuisine name + count */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-white group-hover:text-orange-300 transition-colors duration-300">
                        {c.cuisine}
                      </h3>
                      <span className="bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {c.count} {c.count === 1 ? "place" : "places"}
                      </span>
                    </div>

                    {/* Total votes - prominent */}
                    <div className="bg-neutral-900/60 rounded-lg p-3 mb-3">
                      <p className="text-xs text-neutral-500 mb-0.5">Total Votes / Reviews</p>
                      <p className="text-xl font-bold text-white tabular-nums">{c.totalVotes?.toLocaleString() || 0}</p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-neutral-900/40 rounded-lg p-2">
                        <p className="text-neutral-500 mb-0.5">Avg Rating</p>
                        <p className="text-white font-semibold">{c.avgRating} <span className="text-yellow-500">&#9733;</span></p>
                      </div>
                      <div className="bg-neutral-900/40 rounded-lg p-2">
                        <p className="text-neutral-500 mb-0.5">With Photos</p>
                        <p className={`font-semibold ${c.withPhotos > c.count / 2 ? "text-green-400" : "text-amber-400"}`}>
                          {c.withPhotos}/{c.count}
                        </p>
                      </div>
                    </div>

                    {/* Top & bottom */}
                    <div className="mt-3 space-y-1.5 text-xs">
                      {c.highestRatingName && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 shrink-0">&#9650;</span>
                          <span className="text-neutral-400 truncate">{c.highestRatingName}</span>
                          <span className="text-green-400 font-semibold ml-auto shrink-0">{c.highestRating}</span>
                        </div>
                      )}
                      {c.mostReviewsName && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 shrink-0">&#9679;</span>
                          <span className="text-neutral-400 truncate">{c.mostReviewsName}</span>
                          <span className="text-blue-400 font-semibold ml-auto shrink-0">{c.mostReviews?.toLocaleString()}</span>
                        </div>
                      )}
                      {c.lowestRatingName && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 shrink-0">&#9660;</span>
                          <span className="text-neutral-400 truncate">{c.lowestRatingName}</span>
                          <span className="text-red-400 font-semibold ml-auto shrink-0">{c.lowestRating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ═══════ COMPETITOR COMPARISON TABLE (NEW) ═══════ */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold gradient-text">Where Competition Beats You</h2>
                <p className="text-xs text-neutral-500 mt-0.5">What competitors do better and where you have the advantage</p>
              </div>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left pb-3 text-neutral-400 font-medium pr-4">Competitor</th>
                    <th className="text-left pb-3 text-neutral-400 font-medium pr-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        They Do Better
                      </span>
                    </th>
                    <th className="text-left pb-3 text-neutral-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        You Win Here
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((comp: any, i: number) => (
                    <tr
                      key={i}
                      className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-200"
                    >
                      <td className="py-4 pr-4 align-top">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0"
                            style={{
                              borderColor: comp.threatScore >= 75 ? "#ef4444" : comp.threatScore >= 50 ? "#f59e0b" : "#22c55e",
                              color: comp.threatScore >= 75 ? "#ef4444" : comp.threatScore >= 50 ? "#f59e0b" : "#22c55e",
                            }}
                          >
                            {comp.threatScore}
                          </div>
                          <div>
                            <p className="text-white font-medium">{comp.name}</p>
                            <p className="text-xs text-neutral-500">{comp.distanceKm} km away</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 align-top">
                        <ul className="space-y-1.5">
                          {(comp.whatTheyDoBetter || comp.strengths || []).map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-neutral-300">
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
                            <li key={idx} className="flex items-start gap-2 text-sm text-neutral-300">
                              <svg className="w-4 h-4 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold gradient-text">Top 5 Competitors</h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            {competitors.map((comp: any, i: number) => (
              <Reveal key={i} delay={i * 100}>
                <div className="dashboard-card rounded-2xl p-6 h-full relative overflow-hidden">
                  {/* Threat color accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{
                      background: comp.threatScore >= 75 ? "linear-gradient(90deg, #ef4444, #f97316)" :
                        comp.threatScore >= 50 ? "linear-gradient(90deg, #f59e0b, #eab308)" :
                        "linear-gradient(90deg, #22c55e, #10b981)",
                    }}
                  />

                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-white">
                      {comp.name}
                    </h3>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full border"
                      style={{
                        borderColor: comp.threatScore >= 75 ? "rgba(239,68,68,0.3)" : comp.threatScore >= 50 ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)",
                        color: comp.threatScore >= 75 ? "#ef4444" : comp.threatScore >= 50 ? "#f59e0b" : "#22c55e",
                        backgroundColor: comp.threatScore >= 75 ? "rgba(239,68,68,0.1)" : comp.threatScore >= 50 ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                      }}
                    >
                      {comp.threatScore}/100
                    </span>
                  </div>

                  <p className="text-sm text-neutral-500 mb-4 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {comp.address}
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 mb-5">
                    <div className="bg-neutral-800/40 rounded-xl p-2.5 text-center border border-white/[0.03]">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">Rating</p>
                      <p className="text-sm font-bold text-white">{comp.rating} <span className="text-yellow-500 text-xs">&#9733;</span></p>
                    </div>
                    <div className="bg-neutral-800/40 rounded-xl p-2.5 text-center border border-white/[0.03]">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">Distance</p>
                      <p className="text-sm font-bold text-white">{comp.distanceKm} km</p>
                    </div>
                    <div className="bg-neutral-800/40 rounded-xl p-2.5 text-center border border-white/[0.03]">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">Sentiment</p>
                      <p className={`text-sm font-bold ${
                        comp.sentimentLabel === "Positive" ? "text-green-400" :
                        comp.sentimentLabel === "Negative" ? "text-red-400" : "text-amber-400"
                      }`}>{comp.sentimentLabel || "—"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-xs text-green-400 uppercase tracking-wider mb-2">Strengths</p>
                      <ul className="space-y-1.5">
                        {comp.strengths?.map(
                          (s: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-neutral-300">
                              <span className="text-green-500 mt-0.5 text-xs">&#9679;</span>
                              <span>{s}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-xs text-red-400 uppercase tracking-wider mb-2">Weaknesses</p>
                      <ul className="space-y-1.5">
                        {comp.weaknesses?.map(
                          (w: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-neutral-300">
                              <span className="text-red-500 mt-0.5 text-xs">&#9679;</span>
                              <span>{w}</span>
                            </li>
                          )
                        )}
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
          <div className="dashboard-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold gradient-text">Competitor Keyword Clusters</h2>
            </div>

            <div className="space-y-6">
              {data?.competitorKeywordClusters?.map(
                (cluster: any, i: number) => (
                  <div key={i} className="bg-neutral-800/20 rounded-xl p-5 border border-white/[0.04]">
                    <h3 className="font-semibold text-white mb-3">
                      {cluster.restaurant}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {cluster.keywords?.map(
                        (kw: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm hover:bg-purple-500/20 transition-colors duration-300"
                          >
                            {kw}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </Reveal>

        {/* ═══════ SAME CUISINE TABLE (Enhanced) ═══════ */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8 overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold gradient-text">
                {baseRestaurantCuisine ? `${baseRestaurantCuisine} Competitors` : "Competition in Same Cuisine"} (&#8804;5km)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left pb-3 text-neutral-400 font-medium">Name</th>
                    <th className="text-center pb-3 text-neutral-400 font-medium">Rating</th>
                    <th className="text-center pb-3 text-neutral-400 font-medium">Reviews</th>
                    <th className="text-center pb-3 text-neutral-400 font-medium">Distance</th>
                    <th className="text-center pb-3 text-neutral-400 font-medium">Photos</th>
                    <th className="text-center pb-3 text-neutral-400 font-medium">Cuisine</th>
                    <th className="text-center pb-3 text-neutral-400 font-medium">Threat</th>
                  </tr>
                </thead>
                <tbody>
                  {sameCuisine.map((r: any, i: number) => (
                    <tr
                      key={i}
                      className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-200"
                    >
                      <td className="py-3.5 text-white font-medium">
                        {r.name}
                      </td>
                      <td className="text-center">
                        <span className={`font-medium ${r.rating >= 4.5 ? "text-green-400" : r.rating >= 4 ? "text-white" : "text-amber-400"}`}>
                          {r.rating}
                        </span>
                      </td>
                      <td className="text-center text-neutral-300">
                        {r.totalRatings?.toLocaleString() || "-"}
                      </td>
                      <td className="text-center text-neutral-300">
                        {r.distanceKm} km
                      </td>
                      <td className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.photoCount > 0 ? "bg-green-500/10 text-green-400" : "bg-neutral-800 text-neutral-500"
                        }`}>
                          {r.photoCount > 0 ? `${r.photoCount}` : "None"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="text-xs text-neutral-400 capitalize">
                          {r.foodCuisine || (r.cuisine?.[0] || "restaurant").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          (r.sameCuisineThreatScore || r.threatScore) >= 75 ? "bg-red-500/15 text-red-400" :
                          (r.sameCuisineThreatScore || r.threatScore) >= 50 ? "bg-amber-500/15 text-amber-400" :
                          "bg-green-500/15 text-green-400"
                        }`}>
                          {r.sameCuisineThreatScore || r.threatScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* ═══════ NEW RESTAURANTS ═══════ */}
        <div>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold gradient-text">Top 5 Newly Opened</h2>
            </div>
          </Reveal>

          {newRestaurants.length === 0 ? (
            <Reveal>
              <p className="text-neutral-500 bg-neutral-900/40 rounded-xl p-6 border border-white/[0.04]">
                No new high-rated restaurants found nearby.
              </p>
            </Reveal>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {newRestaurants.map((r: any, i: number) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="dashboard-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{r.name}</h3>
                    <p className="text-sm text-neutral-500 mb-2">{r.address}</p>
                    <div className="flex gap-4">
                      <span className="text-sm text-white">Rating: <span className="font-semibold">{r.rating}</span></span>
                      <span className="text-sm text-red-400">Threat: <span className="font-semibold">{r.threatScore}</span></span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {/* ═══════ FINAL VERDICT ═══════ */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8 border-green-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-green-500/[0.04] rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/[0.03] rounded-full blur-[60px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-5 relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold gradient-text">Final Strategic Verdict</h2>
            </div>
            <div className="relative bg-neutral-800/15 border-l-2 border-green-500/40 rounded-r-xl pl-5 pr-5 py-4">
              <p className="text-neutral-200 leading-relaxed text-base">
                {data?.finalStrategicVerdict}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Back to home link */}
        <Reveal className="text-center pb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-green-400 font-medium hover:text-green-300 transition-colors duration-200 text-sm group"
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
