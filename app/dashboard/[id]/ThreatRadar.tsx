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
  if (score >= 75) return "#ef4444"
  if (score >= 50) return "#f59e0b"
  return "#22c55e"
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
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-neutral-400">High Threat (75-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-neutral-400">Medium Threat (50-74)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-neutral-400">Low Threat (0-49)</span>
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fill: "#d1d5db", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px 16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
              labelStyle={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}
              formatter={(value: any) => [`${value}/100`, "Threat Score"]}
              labelFormatter={(label: any, payload: any) => {
                const item = payload?.[0]?.payload
                return item?.fullName || label
              }}
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
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
            className="bg-neutral-800/30 border border-white/[0.04] rounded-xl p-4 flex items-center gap-4"
          >
            {/* Score circle */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0"
              style={{
                borderColor: getThreatColor(comp.threat),
                color: getThreatColor(comp.threat),
              }}
            >
              {comp.threat}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{comp.fullName}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
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
