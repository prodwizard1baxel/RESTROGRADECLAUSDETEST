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
      className={`${bgColor} p-6 rounded-2xl border ${borderColor} dashboard-card`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      <p className="text-sm text-neutral-400 mb-2">{label}</p>
      <h2 className={`text-3xl font-bold ${color} tabular-nums`}>
        {prefix}{count.toLocaleString()}{suffix}
      </h2>
    </div>
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

  const revenueLoss =
    data?.revenueInsights?.estimatedMonthlyRevenueLoss || 0

  const revenueGain =
    data?.revenueInsights?.estimatedMonthlyRevenueGain || 0

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-500/[0.03] rounded-full blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* HEADER */}
      <div className="relative px-6 md:px-10 py-10 md:py-14 border-b border-green-500/10">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-black text-sm shadow-lg shadow-green-500/20">
                R
              </div>
              <span className="text-sm text-green-400 font-medium tracking-wide uppercase">RetroGrade AI</span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Competitive Intelligence Dashboard
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-neutral-400 mt-2 text-sm md:text-base">
              AI-Powered Market Intelligence Report
            </p>
          </Reveal>
        </div>
      </div>

      <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-12 md:space-y-16">

        {/* KPI STRIP */}
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
            label="Estimated Monthly Revenue Loss"
            value={revenueLoss}
            prefix="₹"
            color="text-red-400"
            borderColor="border-red-500/20"
            bgColor="bg-red-950/20"
            delay={100}
          />
          <KpiCard
            label="Revenue Recovery Opportunity"
            value={revenueGain}
            prefix="₹"
            color="text-emerald-400"
            borderColor="border-emerald-500/20"
            bgColor="bg-emerald-950/20"
            delay={200}
          />
        </div>

        {/* EXECUTIVE SUMMARY */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Executive Summary</h2>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              {data?.executiveSummary}
            </p>
          </div>
        </Reveal>

        {/* YOUR KEYWORDS */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Your Keyword Cluster</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {data?.yourKeywordCluster?.map(
                (kw: string, i: number) => (
                  <span
                    key={i}
                    className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-500/20 hover:border-blue-500/30 transition-all duration-300 cursor-default"
                    style={{
                      animation: `fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both`,
                    }}
                  >
                    {kw}
                  </span>
                )
              )}
            </div>
          </div>
        </Reveal>

        {/* RADAR */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Competitive Threat Map</h2>
            </div>
            <ThreatRadar competitors={competitors} />
          </div>
        </Reveal>

        {/* TOP COMPETITORS */}
        <div>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Top 5 Competitors</h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            {competitors.map((comp: any, i: number) => (
              <Reveal key={i} delay={i * 100}>
                <div className="dashboard-card rounded-2xl p-6 h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {comp.name}
                    </h3>
                    <span className="text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1 rounded-full">
                      {comp.threatScore}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-500 mb-3">
                    {comp.address}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-neutral-800/40 rounded-lg p-2 text-center">
                      <p className="text-xs text-neutral-500">Rating</p>
                      <p className="text-sm font-semibold text-white">{comp.rating}</p>
                    </div>
                    <div className="bg-neutral-800/40 rounded-lg p-2 text-center">
                      <p className="text-xs text-neutral-500">Distance</p>
                      <p className="text-sm font-semibold text-white">{comp.distanceKm} km</p>
                    </div>
                    <div className="bg-neutral-800/40 rounded-lg p-2 text-center">
                      <p className="text-xs text-neutral-500">Sentiment</p>
                      <p className="text-sm font-semibold text-white">{comp.sentimentLabel}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm text-green-400 mb-1.5">Strengths</p>
                      <ul className="list-disc ml-5 text-sm text-neutral-300 space-y-0.5">
                        {comp.strengths?.map(
                          (s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-sm text-red-400 mb-1.5">Weaknesses</p>
                      <ul className="list-disc ml-5 text-sm text-neutral-300 space-y-0.5">
                        {comp.weaknesses?.map(
                          (w: string, idx: number) => (
                            <li key={idx}>{w}</li>
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

        {/* COMPETITOR KEYWORDS */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Competitor Keyword Clusters</h2>
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

        {/* SAME CUISINE TABLE */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8 overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Top 5 Same Cuisine (&#8804;5km)</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left pb-3 text-neutral-400 font-medium">Name</th>
                    <th className="text-center pb-3 text-neutral-400 font-medium">Rating</th>
                    <th className="text-center pb-3 text-neutral-400 font-medium">Distance</th>
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
                      <td className="text-center text-neutral-300">
                        {r.rating}
                      </td>
                      <td className="text-center text-neutral-300">
                        {r.distanceKm} km
                      </td>
                      <td className="text-center">
                        <span className="bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {r.threatScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* NEW RESTAURANTS */}
        <div>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Top 5 Newly Opened</h2>
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

        {/* FINAL VERDICT */}
        <Reveal>
          <div className="dashboard-card rounded-2xl p-6 md:p-8 border-green-500/15 relative overflow-hidden">
            {/* Green accent glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/[0.05] rounded-full blur-[60px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-5 relative">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Final Strategic Verdict</h2>
            </div>
            <p className="text-neutral-300 leading-relaxed relative">
              {data?.finalStrategicVerdict}
            </p>
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
