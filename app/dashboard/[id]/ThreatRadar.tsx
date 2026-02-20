"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"

export default function ThreatRadar({ competitors }: any) {
  const radarData =
    competitors?.map((c: any) => ({
      competitor: c.name,
      threat: Number(c.threatScore),
    })) || []

  return (
    <div className="w-full h-[400px]" style={{ minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis dataKey="competitor" tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} />
          <Radar
            dataKey="threat"
            stroke="#4ade80"
            fill="#22c55e"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
