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
        <PolarGrid />
        <PolarAngleAxis dataKey="competitor" />
        <PolarRadiusAxis domain={[0, 100]} />
        <Radar
          dataKey="threat"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.4}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
)

}
