"use client"

import ThreatRadar from "./ThreatRadar"

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
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* HEADER */}
      <div className="px-10 py-12 border-b border-neutral-800">
        <h1 className="text-4xl font-semibold tracking-tight">
          Competitive Intelligence Dashboard
        </h1>
        <p className="text-neutral-400 mt-2">
          AI-Powered Market Intelligence
        </p>
      </div>

      <div className="p-10 space-y-16">

        {/* KPI STRIP */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
            <p className="text-sm text-neutral-400">Threat Index</p>
            <h2 className="text-3xl font-semibold mt-2">
              {avgThreat}/100
            </h2>
          </div>

          <div className="bg-red-900/20 p-6 rounded-xl border border-red-700/40">
            <p className="text-sm text-neutral-400">
              Estimated Monthly Revenue Loss
            </p>
            <h2 className="text-3xl font-semibold text-red-400 mt-2">
              ₹{revenueLoss.toLocaleString()}
            </h2>
          </div>

          <div className="bg-emerald-900/20 p-6 rounded-xl border border-emerald-700/40">
            <p className="text-sm text-neutral-400">
              Revenue Recovery Opportunity
            </p>
            <h2 className="text-3xl font-semibold text-emerald-400 mt-2">
              ₹{revenueGain.toLocaleString()}
            </h2>
          </div>

        </div>

        {/* EXECUTIVE SUMMARY */}
        <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
          <h2 className="text-2xl mb-4">Executive Summary</h2>
          <p className="text-neutral-300 leading-relaxed">
            {data?.executiveSummary}
          </p>
        </div>

        {/* YOUR KEYWORDS */}
        <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
          <h2 className="text-2xl mb-4">Your Keyword Cluster</h2>
          <div className="flex flex-wrap gap-3">
            {data?.yourKeywordCluster?.map(
              (kw: string, i: number) => (
                <span
                  key={i}
                  className="bg-blue-600/20 border border-blue-600 px-3 py-1 rounded-full text-sm"
                >
                  {kw}
                </span>
              )
            )}
          </div>
        </div>

        {/* RADAR */}
        <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
          <h2 className="text-2xl mb-6">
            Competitive Threat Map
          </h2>
          <ThreatRadar competitors={competitors} />
        </div>

        {/* TOP COMPETITORS */}
        <div>
          <h2 className="text-2xl mb-6">
            Top 5 Competitors
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {competitors.map((comp: any, i: number) => (
              <div
                key={i}
                className="bg-neutral-900 p-6 rounded-xl border border-neutral-800"
              >
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">
                    {comp.name}
                  </h3>
                  <span className="text-sm bg-red-700/30 px-3 py-1 rounded-full">
                    {comp.threatScore}
                  </span>
                </div>

                <p className="text-sm text-neutral-400 mt-1">
                  📍 {comp.address}
                </p>

                <div className="mt-3 text-sm space-y-1">
                  <p>⭐ {comp.rating}</p>
                  <p>📏 {comp.distanceKm} km</p>
                  <p>
                    💬 {comp.sentimentLabel} (
                    {comp.sentimentScore})
                  </p>
                </div>

                <div className="mt-4">
                  <p className="font-semibold text-sm">
                    Strengths
                  </p>
                  <ul className="list-disc ml-5 text-sm text-neutral-300">
                    {comp.strengths?.map(
                      (s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      )
                    )}
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="font-semibold text-sm">
                    Weaknesses
                  </p>
                  <ul className="list-disc ml-5 text-sm text-neutral-300">
                    {comp.weaknesses?.map(
                      (w: string, idx: number) => (
                        <li key={idx}>{w}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPETITOR KEYWORDS */}
        <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
          <h2 className="text-2xl mb-4">
            Competitor Keyword Clusters
          </h2>

          {data?.competitorKeywordClusters?.map(
            (cluster: any, i: number) => (
              <div key={i} className="mb-6">
                <h3 className="font-semibold">
                  {cluster.restaurant}
                </h3>

                <div className="flex flex-wrap gap-2 mt-2">
                  {cluster.keywords?.map(
                    (kw: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-purple-600/20 border border-purple-600 px-3 py-1 rounded-full text-sm"
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

        {/* SAME CUISINE TABLE */}
        <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
          <h2 className="text-2xl mb-6">
            Top 5 Same Cuisine (≤5km)
          </h2>

          <table className="w-full text-sm">
            <thead className="text-neutral-400">
              <tr>
                <th className="text-left pb-2">Name</th>
                <th>Rating</th>
                <th>Distance</th>
                <th>Threat</th>
              </tr>
            </thead>
            <tbody>
              {sameCuisine.map((r: any, i: number) => (
                <tr
                  key={i}
                  className="border-t border-neutral-800"
                >
                  <td className="py-3">
                    {r.name}
                  </td>
                  <td className="text-center">
                    {r.rating}
                  </td>
                  <td className="text-center">
                    {r.distanceKm} km
                  </td>
                  <td className="text-center">
                    {r.threatScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* NEW RESTAURANTS */}
        <div>
          <h2 className="text-2xl mb-6">
            Top 5 Newly Opened
          </h2>

          {newRestaurants.length === 0 ? (
            <p className="text-neutral-400">
              No new high-rated restaurants found.
            </p>
          ) : (
            newRestaurants.map((r: any, i: number) => (
              <div
                key={i}
                className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 mb-4"
              >
                <h3>{r.name}</h3>
                <p className="text-sm text-neutral-400">
                  📍 {r.address}
                </p>
                <p>⭐ {r.rating}</p>
                <p>Threat Score: {r.threatScore}</p>
              </div>
            ))
          )}
        </div>

        {/* FINAL VERDICT */}
        <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
          <h2 className="text-2xl mb-4">
            Final Strategic Verdict
          </h2>
          <p className="text-neutral-300">
            {data?.finalStrategicVerdict}
          </p>
        </div>

      </div>
    </div>
  )
}
