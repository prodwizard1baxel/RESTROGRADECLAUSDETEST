"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

function getThreatColor(score: number) {
  if (score >= 75) return "#dc2626"
  if (score >= 50) return "#d97706"
  return "#059669"
}

function getThreatBg(score: number) {
  if (score >= 75) return "#fef2f2"
  if (score >= 50) return "#fffbeb"
  return "#ecfdf5"
}

function getThreatLabel(score: number) {
  if (score >= 75) return "High"
  if (score >= 50) return "Medium"
  return "Low"
}

export default function ThreatRadar({ competitors, scoreKey = "threatScore" }: { competitors: any, scoreKey?: string }) {
  const barData = (competitors || [])
    .map((c: any) => ({
      name: c.name?.length > 18 ? c.name.substring(0, 18) + "..." : c.name,
      fullName: c.name,
      threat: Number(c[scoreKey] || c.threatScore),
      rating: c.rating,
      distance: c.distanceKm,
    }))
    .sort((a: any, b: any) => b.threat - a.threat)

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-500">High Threat (75-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-500">Medium Threat (50-74)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-500">Low Threat (0-49)</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-[300px]" style={{ minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fill: "#334155", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "12px 16px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: "#0f172a", fontWeight: 600, marginBottom: 4 }}
              formatter={(value: any) => [`${value}/100`, "Threat Score"]}
              labelFormatter={(label: any, payload: any) => {
                const item = payload?.[0]?.payload
                return item?.fullName || label
              }}
              cursor={{ fill: "rgba(0,0,0,0.02)" }}
            />
            <Bar dataKey="threat" radius={[0, 6, 6, 0]} barSize={28}>
              {barData.map((entry: any, index: number) => (
                <Cell key={index} fill={getThreatColor(entry.threat)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed breakdown cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {barData.map((comp: any, i: number) => (
          <div
            key={i}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-slate-300 transition-colors duration-200"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0"
              style={{
                borderColor: getThreatColor(comp.threat),
                color: getThreatColor(comp.threat),
                backgroundColor: getThreatBg(comp.threat),
              }}
            >
              {comp.threat}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{comp.fullName}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span>Rating: {comp.rating}</span>
                <span>{comp.distance} km</span>
                <span
                  className="font-medium"
                  style={{ color: getThreatColor(comp.threat) }}
                >
                  {getThreatLabel(comp.threat)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
