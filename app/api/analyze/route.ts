// temp change to trigger commit

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import OpenAI from "openai"

type Restaurant = {
  name: string
  address: string
  rating: number
  totalRatings: number
  distanceKm: number
  cuisine: string[]
  averagePrice: number
  threatScore: number
  sentimentLabel?: string
  sentimentScore?: number
  strengths?: string[]
  weaknesses?: string[]
}

const prisma = new PrismaClient()

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
}

function getGoogleKey() {
  return process.env.GOOGLE_MAPS_API_KEY!
}

// ==============================
// Distance Formula
// ==============================
function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

// ==============================
// Threat Score Formula
// ==============================
function calculateThreatScore(
  rating: number,
  totalRatings: number,
  distanceKm: number
) {
  const ratingImpact = rating * 20
  const reviewImpact = Math.log(totalRatings + 1) * 8
  const proximityImpact = Math.max(0, 40 - distanceKm * 6)

  const finalScore =
    ratingImpact * 0.4 +
    reviewImpact * 0.3 +
    proximityImpact * 0.3

  return Math.min(100, Math.round(finalScore))
}

// ==============================
// Get Coordinates
// ==============================
async function getCoordinates(address: string) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${getGoogleKey()}`
  )

  const data = await res.json()

  if (data.status !== "OK") {
    throw new Error("Geocode failed: " + data.status)
  }

  return data.results[0].geometry.location
}

// ==============================
// Get Nearby Restaurants
// ==============================
async function getNearbyRestaurants(lat: number, lng: number) {
  const radius = 7000

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&key=${getGoogleKey()}`
  )

  const data = await res.json()

  if (data.status !== "OK") {
    throw new Error("Places API failed: " + data.status)
  }

  return data.results
}

// ==============================
// MAIN API
// ==============================
export async function POST(req: Request) {
  try {
    const { name, city } = await req.json()

    if (!name || !city) {
      return NextResponse.json(
        { error: "Missing name or city" },
        { status: 400 }
      )
    }

    const baseLocation = await getCoordinates(`${name}, ${city}`)
    const places = await getNearbyRestaurants(
      baseLocation.lat,
      baseLocation.lng
    )

    // ==============================
    // Map Google Data
    // ==============================
    const mapped: Restaurant[] = places.map((place: any) => {
      const distance = getDistanceKm(
        baseLocation.lat,
        baseLocation.lng,
        place.geometry.location.lat,
        place.geometry.location.lng
      )

      const threatScore = calculateThreatScore(
        place.rating || 0,
        place.user_ratings_total || 0,
        distance
      )

      return {
        name: place.name,
        address: place.vicinity,
        rating: place.rating || 0,
        totalRatings: place.user_ratings_total || 0,
        distanceKm: Number(distance.toFixed(2)),
        cuisine: place.types?.slice(0, 3) || ["Restaurant"],
        averagePrice: 400,
        threatScore,
      }
    })

    const topCompetitors = [...mapped]
      .sort((a, b) => b.threatScore - a.threatScore)
      .slice(0, 5)

  const sameCuisineNearby = mapped
  .filter((r: Restaurant) => r.distanceKm <= 5)
  .slice(0, 5)

const newHighRatedRestaurants = mapped
  .filter((r: Restaurant) => r.rating > 3.5 && r.totalRatings < 120)
  .slice(0, 5)


    // ==============================
    // AI ANALYSIS
    // ==============================
    const ai = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior restaurant competitive intelligence strategist. You write detailed, actionable, and easy-to-understand analyses. Your executive summaries are structured with clear sections that any restaurant owner can follow.",
        },
        {
          role: "user",
          content: `
Analyze the competitive landscape for a restaurant.

Restaurant: ${name}
City: ${city}

Top Competitors (with their data):
${JSON.stringify(topCompetitors)}

Return STRICT JSON with these fields:

{
  "executiveSummary": {
    "overview": "A 2-3 sentence high-level overview of the competitive landscape. What is the overall situation?",
    "keyFindings": ["Finding 1", "Finding 2", "Finding 3", "Finding 4"],
    "immediateThreats": "1-2 sentences about the most urgent competitive threats to address right now.",
    "growthOpportunities": "1-2 sentences about the biggest opportunities for growth based on competitor weaknesses.",
    "recommendation": "A clear, actionable 1-2 sentence recommendation for what the restaurant owner should do first."
  },
  "finalStrategicVerdict": "",
  "yourKeywordCluster": {
    "primary": ["5-8 primary SEO/brand keywords that define this restaurant"],
    "positive": ["5-8 positive sentiment keywords - words customers associate with good experiences at this type of restaurant"],
    "negative": ["5-8 negative sentiment keywords - words customers use when leaving bad reviews for this type of restaurant, things to avoid"]
  },
  "competitorKeywordClusters": [
    {
      "restaurant": "competitor name",
      "keywords": ["their top keywords"]
    }
  ],
  "competitorEnhancements": [
    {
      "restaurant": "competitor name",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
      "sentimentLabel": "Positive/Negative/Mixed",
      "sentimentScore": 0.0,
      "whatTheyDoBetter": ["specific thing this competitor does better than ${name}", "another thing"],
      "whereYouWin": ["specific area where ${name} has an advantage over this competitor", "another area"]
    }
  ]
}

IMPORTANT:
- Make executiveSummary.keyFindings exactly 4 items, each a specific insight (not generic)
- Make yourKeywordCluster.primary, .positive, and .negative each have 5-8 keywords
- For each competitor in competitorEnhancements, include 2-3 items in whatTheyDoBetter and whereYouWin
- Be specific to the actual restaurants, not generic advice
`
        },
      ],
      temperature: 0.7,
    })

    const aiParsed = JSON.parse(ai.choices[0].message.content!)

    // Merge enhancements
    topCompetitors.forEach((comp) => {
      const enhancement = aiParsed.competitorEnhancements?.find(
        (e: any) => e.restaurant === comp.name
      )

      if (enhancement) {
        comp.strengths = enhancement.strengths
        comp.weaknesses = enhancement.weaknesses
        comp.sentimentLabel = enhancement.sentimentLabel
        comp.sentimentScore = enhancement.sentimentScore
      }
    })

    const avgScore = Math.round(
      topCompetitors.reduce((sum, c) => sum + c.threatScore, 0) / topCompetitors.length
    ) || 0

    const finalData = {
      restaurantName: name,
      restaurantCity: city,
      executiveSummary: aiParsed.executiveSummary,
      yourKeywordCluster: aiParsed.yourKeywordCluster,
      competitorKeywordClusters:
        aiParsed.competitorKeywordClusters,
      competitorAnalysis: {
        topCompetitors,
        sameCuisineNearby,
        newHighRatedRestaurants,
        overallThreatLevel: avgScore >= 70 ? "High" : avgScore >= 45 ? "Moderate" : "Low",
        averageThreatScore: avgScore,
      },
      finalStrategicVerdict:
        aiParsed.finalStrategicVerdict,
    }

    const restaurant = await prisma.restaurant.upsert({
      where: { id: `${name}-${city}` },
      update: {},
      create: {
        id: `${name}-${city}`,
        name,
        city,
      },
    })

    const savedReport = await prisma.report.create({
      data: {
        restaurantId: restaurant.id,
        data: finalData,
      },
    })

    return NextResponse.json({
      reportId: savedReport.id,
    })
  } catch (error: any) {
    console.error("FULL ERROR:", error)

    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
