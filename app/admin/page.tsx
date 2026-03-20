"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

type AnalyticsData = {
  filter: string
  startDate: string
  endDate: string
  cityFilter: string | null
  period: {
    registrations: number
    payments: number
    starterPayments: number
    growthPayments: number
    revenue: number
    reportsGenerated: number
    newUsers: number
    repeatUsers: number
  }
  allTime: {
    totalUsers: number
    totalReports: number
    totalPayments: number
    totalRevenue: number
  }
  cityBreakdown: { city: string; count: number }[]
}

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [filter, setFilter] = useState<"day" | "week" | "month">("month")
  const [city, setCity] = useState("")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchData = useCallback(async (key: string, f: string, c: string) => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ filter: f, key })
      if (c) params.set("city", c)
      const res = await fetch(`/api/admin/analytics?${params}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to fetch")
      }
      const json = await res.json()
      setData(json)
      setAuthenticated(true)
    } catch (err: any) {
      setError(err.message || "Failed to fetch analytics")
      if (err.message === "Unauthorized") setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated && adminKey) {
      fetchData(adminKey, filter, city)
    }
  }, [filter, city, authenticated, adminKey, fetchData])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminKey.trim()) return
    fetchData(adminKey, filter, city)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-xl">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">R</div>
            <span className="font-semibold text-lg tracking-tight text-slate-800">Resto<span className="text-emerald-600">Rank</span></span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mb-6">Enter your admin key to access analytics.</p>
          {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin API Key"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all mb-4"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">R</div>
              <span className="font-semibold text-lg tracking-tight text-slate-800">Resto<span className="text-emerald-600">Rank</span></span>
            </Link>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">Admin</span>
          </div>
          <Link href="/" className="text-sm text-slate-400 hover:text-emerald-600 transition-colors">Back to Site</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
              {(["day", "week", "month"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    filter === f
                      ? "bg-emerald-600 text-white"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {f === "day" ? "Today" : f === "week" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filter by city..."
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all w-44"
            />
            <button
              onClick={() => fetchData(adminKey, filter, city)}
              disabled={loading}
              className="bg-emerald-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {loading ? "..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

        {data && (
          <>
            {/* Period Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Registrations" value={data.period.registrations} subtitle={`${filter === "day" ? "Today" : filter === "week" ? "This week" : "This month"}`} color="emerald" />
              <StatCard label="Payments" value={data.period.payments} subtitle={`Revenue: \u20B9${data.period.revenue.toLocaleString()}`} color="blue" />
              <StatCard label="New Users" value={data.period.newUsers} subtitle={`${data.cityFilter ? `in ${data.cityFilter}` : "All cities"}`} color="violet" />
              <StatCard label="Repeat Users" value={data.period.repeatUsers} subtitle="Returned this period" color="amber" />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Reports Generated" value={data.period.reportsGenerated} subtitle="In this period" color="slate" />
              <StatCard label="Starter Plans" value={data.period.starterPayments} subtitle={`\u20B91 each`} color="slate" />
              <StatCard label="Growth Plans" value={data.period.growthPayments} subtitle={`\u20B91,299 each`} color="slate" />
              <StatCard label="Avg Revenue/User" value={data.period.payments > 0 ? Math.round(data.period.revenue / data.period.payments) : 0} subtitle={`\u20B9 per paying user`} color="slate" prefix="\u20B9" />
            </div>

            {/* All-time stats */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">All-Time Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{data.allTime.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 mt-1">Total Users</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{data.allTime.totalReports.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 mt-1">Total Reports</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{data.allTime.totalPayments.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 mt-1">Total Payments</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-600">{"\u20B9"}{data.allTime.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 mt-1">Total Revenue</p>
                </div>
              </div>
            </div>

            {/* City Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Registrations by City
                <span className="text-sm font-normal text-slate-400 ml-2">
                  ({filter === "day" ? "Today" : filter === "week" ? "This week" : "This month"})
                </span>
              </h2>
              {data.cityBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400">No registrations with city data in this period.</p>
              ) : (
                <div className="space-y-3">
                  {data.cityBreakdown.map((item, i) => {
                    const maxCount = data.cityBreakdown[0]?.count || 1
                    const pct = Math.round((item.count / maxCount) * 100)
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm text-slate-700 w-40 truncate font-medium">{item.city}</span>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-lg flex items-center pl-3 transition-all duration-500"
                            style={{ width: `${Math.max(pct, 8)}%` }}
                          >
                            <span className="text-xs font-bold text-white">{item.count}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  subtitle,
  color,
  prefix = "",
}: {
  label: string
  value: number
  subtitle: string
  color: string
  prefix?: string
}) {
  const colorMap: Record<string, string> = {
    emerald: "border-emerald-200 bg-emerald-50/50",
    blue: "border-blue-200 bg-blue-50/50",
    violet: "border-violet-200 bg-violet-50/50",
    amber: "border-amber-200 bg-amber-50/50",
    slate: "border-slate-200 bg-white",
  }

  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color] || colorMap.slate}`}>
      <p className="text-sm text-slate-500 font-medium mb-2">{label}</p>
      <p className="text-3xl font-bold text-slate-900 tabular-nums">
        {prefix}{value.toLocaleString()}
      </p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  )
}
