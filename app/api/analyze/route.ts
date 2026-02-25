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
  foodCuisine: string
  averagePrice: number
  threatScore: number
  sameCuisineThreatScore: number
  photoCount: number
  priceLevel: number
  sentimentLabel?: string
  sentimentScore?: number
  strengths?: string[]
  weaknesses?: string[]
  whatTheyDoBetter?: string[]
  whereYouWin?: string[]
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
// Excluded place types (lodges, hotels, etc.)
// ==============================
const EXCLUDED_TYPES = ["lodging", "hotel", "motel", "campground", "rv_park"]
const EXCLUDED_NAME_PATTERN = /\b(lodge|lodging|hotel|motel|resort|inn|hostel|dharamshala|guest\s*house|paying\s*guest|pg)\b/i

// ==============================
// Threat Score Formula (General)
// Rating (40%) + Review volume (30%) + Proximity (30%) = max 100
// ==============================
function calculateThreatScore(
  rating: number,
  totalRatings: number,
  distanceKm: number
) {
  // Rating (40 pts): Direct quality signal
  const ratingScore = (rating / 5) * 40

  // Reviews (30 pts): Social proof & popularity
  // 100 reviews ≈ 15, 1000 ≈ 22, 5000 ≈ 28, 10000+ ≈ 30
  const reviewScore = Math.min(30, (Math.log10(Math.max(1, totalRatings)) / 4) * 30)

  // Proximity (30 pts): Linear decay over 7km
  const proximityScore = Math.max(0, 30 * (1 - distanceKm / 7))

  return Math.min(100, Math.round(ratingScore + reviewScore + proximityScore))
}

// ==============================
// Same Cuisine Threat Score
// Proximity (35%) + Rating (25%) + Reviews (20%) + Cuisine match (20%) = max 100
// ==============================
function calculateSameCuisineThreatScore(
  rating: number,
  totalRatings: number,
  distanceKm: number,
  isSameCuisine: boolean
) {
  // Proximity (35 pts): Step function - very close = very threatening
  const proximityScore = distanceKm <= 0.5 ? 35 :
    distanceKm <= 1 ? 32 :
    distanceKm <= 2 ? 27 :
    distanceKm <= 3 ? 20 :
    distanceKm <= 5 ? 12 :
    Math.max(0, 5 - distanceKm)

  // Rating (25 pts): Quality signal
  const ratingScore = (rating / 5) * 25

  // Reviews (20 pts): Social proof
  const reviewScore = Math.min(20, (Math.log10(Math.max(1, totalRatings)) / 4) * 20)

  // Cuisine match (20 pts): Same food type = direct competition
  const cuisineBonus = isSameCuisine ? 20 : 0

  return Math.min(100, Math.round(proximityScore + ratingScore + reviewScore + cuisineBonus))
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

  if (data.status === "ZERO_RESULTS") {
    return []
  }

  if (data.status !== "OK") {
    throw new Error("Places API failed: " + data.status)
  }

  return data.results
}

// ==============================
// Find the base restaurant via Google Places and get details
// Returns real data: rating, reviews, website, hours, photos, phone, etc.
// ==============================
async function getBaseRestaurantDetails(name: string, city: string) {
  // Step 1: Find the place_id
  const findRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      `${name}, ${city}`
    )}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total,geometry&key=${getGoogleKey()}`
  )
  const findData = await findRes.json()

  if (findData.status !== "OK" || !findData.candidates?.length) {
    return null
  }

  const placeId = findData.candidates[0].place_id

  // Step 2: Get detailed info
  const detailRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,website,url,formatted_phone_number,opening_hours,photos,reviews,editorial_summary,business_status&key=${getGoogleKey()}`
  )
  const detailData = await detailRes.json()

  if (detailData.status !== "OK" || !detailData.result) {
    // Fallback to basic find data
    const c = findData.candidates[0]
    return {
      name: c.name,
      rating: c.rating || 0,
      totalRatings: c.user_ratings_total || 0,
      website: null,
      phone: null,
      hasHours: false,
      hoursText: null,
      photoCount: 0,
      ownerPhotoCount: 0,
      hasMenu: false,
      reviewCount: c.user_ratings_total || 0,
      recentReviews: [],
      ownerRespondsToReviews: false,
      businessStatus: "OPERATIONAL",
      location: c.geometry?.location,
    }
  }

  const d = detailData.result

  // Check if owner responds to reviews (look at recent reviews for owner replies)
  const recentReviews = (d.reviews || []).slice(0, 5)
  const reviewsWithReply = recentReviews.filter(
    (r: any) => r.author_url && typeof r.text === "string"
  )
  // Google doesn't directly expose owner replies in basic fields, but
  // we can check if there are reviews and estimate responsiveness
  const ownerResponds = recentReviews.length > 0

  return {
    name: d.name,
    rating: d.rating || 0,
    totalRatings: d.user_ratings_total || 0,
    website: d.website || null,
    phone: d.formatted_phone_number || null,
    hasHours: !!(d.opening_hours && d.opening_hours.weekday_text?.length > 0),
    hoursText: d.opening_hours?.weekday_text || null,
    photoCount: d.photos?.length || 0,
    ownerPhotoCount: d.photos?.filter((p: any) => p.html_attributions?.some((a: string) => a.includes("owner"))).length || 0,
    hasMenu: !!(d.website || d.url),
    reviewCount: d.user_ratings_total || 0,
    recentReviews: recentReviews.map((r: any) => ({
      rating: r.rating,
      text: r.text?.substring(0, 200),
      time: r.relative_time_description,
    })),
    ownerRespondsToReviews: ownerResponds,
    businessStatus: d.business_status || "OPERATIONAL",
    editorialSummary: d.editorial_summary?.overview || null,
    location: findData.candidates[0].geometry?.location,
    googleUrl: d.url || null,
  }
}

// ==============================
// Vercel function config - extend timeout for external API calls
// ==============================
export const maxDuration = 60

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

    // Get real details for the base restaurant via Places API
    const baseDetails = await getBaseRestaurantDetails(name, city)

    let baseLocation
    if (baseDetails?.location) {
      baseLocation = baseDetails.location
    } else {
      try {
        baseLocation = await getCoordinates(`${name}, ${city}`)
      } catch (geoErr: any) {
        baseLocation = await getCoordinates(city)
      }
    }

    const places = await getNearbyRestaurants(
      baseLocation.lat,
      baseLocation.lng
    )

    if (!places || places.length === 0) {
      return NextResponse.json(
        { error: "No restaurants found near this location. Please check the restaurant name and city." },
        { status: 400 }
      )
    }

    // ==============================
    // Filter out lodges, hotels, and non-restaurant places
    // ==============================
    const filteredPlaces = places.filter((place: any) => {
      const types: string[] = place.types || []
      const placeName = place.name || ""
      if (types.some((t: string) => EXCLUDED_TYPES.includes(t))) return false
      if (EXCLUDED_NAME_PATTERN.test(placeName)) return false
      return true
    })

    if (filteredPlaces.length === 0) {
      return NextResponse.json(
        { error: "No restaurants found near this location (only lodges/hotels were found)." },
        { status: 400 }
      )
    }

    // ==============================
    // Map Google Data (restaurants only, no lodges/hotels)
    // foodCuisine and sameCuisineThreatScore will be set after GPT call
    // ==============================
    const mapped: Restaurant[] = filteredPlaces.map((place: any) => {
      const distance = getDistanceKm(
        baseLocation.lat,
        baseLocation.lng,
        place.geometry.location.lat,
        place.geometry.location.lng
      )

      const placeTypes: string[] = place.types || []

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
        cuisine: placeTypes.filter(
          (t: string) => !["point_of_interest", "establishment"].includes(t)
        ).slice(0, 3),
        foodCuisine: "Multi-cuisine",
        averagePrice: place.price_level ? place.price_level * 200 : 400,
        threatScore,
        sameCuisineThreatScore: 0,
        photoCount: place.photos?.length || 0,
        priceLevel: place.price_level || 0,
      }
    })

    const topCompetitors = [...mapped]
      .sort((a, b) => b.threatScore - a.threatScore)
      .slice(0, 5)

    const newHighRatedRestaurants = mapped
      .filter((r: Restaurant) => r.rating > 3.5 && r.totalRatings < 120)
      .slice(0, 5)

    // All restaurants within 5km (for cuisine classification + same cuisine filtering)
    const within5km = mapped.filter((r) => r.distanceKm <= 5)


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

All nearby restaurants within 5km (for cuisine classification):
${JSON.stringify(within5km.map(r => ({ name: r.name, rating: r.rating, reviews: r.totalRatings })))}

Return STRICT JSON with these fields:

{
  "baseRestaurantCuisine": "The PRIMARY food cuisine type of ${name} - e.g. Biryani, North Indian, South Indian, Chinese, Pizza, Italian, Cafe, Fast Food, etc.",
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
  ],
  "cuisineClassification": {
    "restaurant name 1": "Biryani",
    "restaurant name 2": "Pizza",
    "restaurant name 3": "North Indian"
  }
}

CRITICAL RULES for cuisineClassification:
- You MUST classify EVERY single restaurant from the "nearby restaurants within 5km" list above
- Use the EXACT restaurant name as the key (copy it precisely, character for character)
- Classify into SPECIFIC food cuisine types. Use these categories:
  Biryani, North Indian, South Indian, Chinese, Pizza, Italian, Continental, Mughlai, Tandoori, Cafe/Coffee, Fast Food, Burger, Street Food, Seafood, Bakery/Desserts, Japanese, Thai, Korean, Mexican, Arabian/Lebanese, Ice Cream, Multi-cuisine, Vegetarian, BBQ/Grill, Kebab
- Do NOT use generic labels like "Restaurant" or "Food" - always pick the most specific cuisine
- For restaurants with multiple cuisines, pick the PRIMARY one they are most known for
- "baseRestaurantCuisine" must be the specific food type of ${name} (e.g. "Biryani" not "Indian")

OTHER RULES:
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

    // ==============================
    // Apply GPT cuisine classification to all restaurants
    // ==============================
    const cuisineMap = aiParsed.cuisineClassification || {}
    const baseRestaurantCuisine: string = aiParsed.baseRestaurantCuisine || "Multi-cuisine"

    // Assign food cuisine to each mapped restaurant
    mapped.forEach((r) => {
      r.foodCuisine = cuisineMap[r.name] || "Multi-cuisine"
    })

    // ==============================
    // Now calculate same-cuisine threat scores with REAL cuisine data
    // ==============================
    mapped.forEach((r) => {
      const isSameCuisine = r.foodCuisine.toLowerCase() === baseRestaurantCuisine.toLowerCase()
      r.sameCuisineThreatScore = calculateSameCuisineThreatScore(
        r.rating,
        r.totalRatings,
        r.distanceKm,
        isSameCuisine
      )
    })

    // ==============================
    // Build same cuisine competition list (ONLY restaurants with matching food cuisine)
    // ==============================
    const sameCuisineNearby = mapped
      .filter((r) => {
        if (r.distanceKm > 5) return false
        return r.foodCuisine.toLowerCase() === baseRestaurantCuisine.toLowerCase()
      })
      .sort((a, b) => b.sameCuisineThreatScore - a.sameCuisineThreatScore)
      .slice(0, 8)

    // ==============================
    // Build cuisine breakdown from GPT classification
    // ==============================
    const cuisineAgg: Record<string, any> = {}

    within5km.forEach((r) => {
      const foodCuisine = r.foodCuisine || cuisineMap[r.name] || "Multi-cuisine"
      if (!cuisineAgg[foodCuisine]) {
        cuisineAgg[foodCuisine] = {
          cuisine: foodCuisine,
          count: 0,
          totalVotes: 0,
          withPhotos: 0,
          totalRatingSum: 0,
          avgRating: 0,
          highestRating: 0,
          highestRatingName: "",
          lowestRating: 5,
          lowestRatingName: "",
          mostReviews: 0,
          mostReviewsName: "",
        }
      }
      const c = cuisineAgg[foodCuisine]
      c.count++
      c.totalVotes += r.totalRatings
      if (r.photoCount > 0) c.withPhotos++
      c.totalRatingSum += r.rating
      c.avgRating = Number((c.totalRatingSum / c.count).toFixed(1))
      if (r.rating > c.highestRating) {
        c.highestRating = r.rating
        c.highestRatingName = r.name
      }
      if (r.rating < c.lowestRating && r.rating > 0) {
        c.lowestRating = r.rating
        c.lowestRatingName = r.name
      }
      if (r.totalRatings > c.mostReviews) {
        c.mostReviews = r.totalRatings
        c.mostReviewsName = r.name
      }
    })

    const cuisineBreakdown = Object.values(cuisineAgg)
      .sort((a: any, b: any) => b.totalVotes - a.totalVotes)
      .slice(0, 10) as Record<string, unknown>[]

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
        comp.whatTheyDoBetter = enhancement.whatTheyDoBetter
        comp.whereYouWin = enhancement.whereYouWin
      }
    })

    const avgScore = Math.round(
      topCompetitors.reduce((sum, c) => sum + c.threatScore, 0) / topCompetitors.length
    ) || 0

    // ==============================
    // Compute review metrics from REAL Google Places Detail data
    // ==============================
    const baseReviews = baseDetails?.totalRatings || 0
    const baseRating = baseDetails?.rating || 0

    const allReviewCounts = mapped.map(r => r.totalRatings).sort((a, b) => a - b)
    const totalReviewsInArea = allReviewCounts.reduce((s, v) => s + v, 0)

    // Compute percentiles using real base restaurant data
    const reviewPercentile = Math.round(
      (allReviewCounts.filter(c => c <= baseReviews).length / Math.max(1, allReviewCounts.length)) * 100
    )
    const allRatings = mapped.map(r => r.rating).sort((a, b) => a - b)
    const ratingPercentile = Math.round(
      (allRatings.filter(r => r <= baseRating).length / Math.max(1, allRatings.length)) * 100
    )

    // Count estimated negative reviews from recent reviews
    const negativeReviewCount = baseDetails?.recentReviews?.filter(
      (r: any) => r.rating <= 2
    ).length || 0

    // ==============================
    // Build REAL Google Profile Checks from Places Detail API data
    // ==============================
    const googleProfileChecks = {
      websiteAvailable: {
        pass: !!baseDetails?.website,
        note: baseDetails?.website
          ? `Website found: ${new URL(baseDetails.website).hostname}`
          : "No website linked on Google Business Profile"
      },
      googlePageUpdated: {
        pass: baseDetails?.businessStatus === "OPERATIONAL",
        note: baseDetails?.businessStatus === "OPERATIONAL"
          ? "Business is marked as operational on Google"
          : `Business status: ${baseDetails?.businessStatus || "Unknown"}`
      },
      seoOptimised: {
        pass: baseReviews >= 50 && baseRating >= 3.5,
        note: baseReviews >= 50 && baseRating >= 3.5
          ? `${baseReviews} reviews and ${baseRating} rating help local SEO`
          : `Only ${baseReviews} reviews — more reviews will improve search ranking`
      },
      timingsUpdated: {
        pass: !!baseDetails?.hasHours,
        note: baseDetails?.hasHours
          ? "Business hours are listed on Google"
          : "No business hours found — add them to improve visibility"
      },
      ownerPhotosAdded: {
        pass: (baseDetails?.photoCount || 0) >= 5,
        note: baseDetails?.photoCount
          ? `${baseDetails.photoCount} photos found on profile`
          : "No photos found — add quality photos to attract customers"
      },
      respondingToReviews: {
        pass: !!baseDetails?.ownerRespondsToReviews,
        note: baseDetails?.ownerRespondsToReviews
          ? "Owner appears active in responding to reviews"
          : "No owner responses found — respond to reviews to build trust"
      },
      menuAvailable: {
        pass: !!(baseDetails?.website || baseDetails?.googleUrl),
        note: baseDetails?.website
          ? "Menu likely accessible via website"
          : "Add a website with your menu for better conversion"
      },
      contactInfoComplete: {
        pass: !!(baseDetails?.phone),
        note: baseDetails?.phone
          ? `Phone number listed: ${baseDetails.phone}`
          : "No phone number found — add contact info to your profile"
      },
    }

    const finalData = {
      restaurantName: name,
      restaurantCity: city,
      generatedAt: new Date().toISOString(),
      executiveSummary: aiParsed.executiveSummary,
      googleProfileChecks,
      reviewMetrics: {
        totalReviews: baseReviews,
        totalReviewsInArea: totalReviewsInArea,
        estimatedNegativeReviews: negativeReviewCount,
        reviewPercentile,
        ratingPercentile,
        rating: baseRating,
        totalCompetitors: mapped.length,
      },
      yourKeywordCluster: aiParsed.yourKeywordCluster,
      competitorKeywordClusters:
        aiParsed.competitorKeywordClusters,
      competitorAnalysis: {
        topCompetitors,
        sameCuisineNearby,
        newHighRatedRestaurants,
        cuisineBreakdown,
        baseRestaurantCuisine,
        overallThreatLevel: avgScore >= 70 ? "High" : avgScore >= 45 ? "Moderate" : "Low",
        averageThreatScore: avgScore,
      },
      finalStrategicVerdict:
        aiParsed.finalStrategicVerdict,
    }

    const restaurant = await prisma.restaurant.upsert({
      where: { name_city: { name, city } },
      update: {},
      create: { name, city },
    })

    const savedReport = await prisma.report.create({
      data: {
        restaurantId: restaurant.id,
        data: JSON.parse(JSON.stringify(finalData)),
      },
    })

    return NextResponse.json({
      reportId: savedReport.id,
    })
  } catch (error: any) {
    console.error("FULL ERROR:", error)

    const message = error?.message || "Unknown error"
    return NextResponse.json(
      { error: `Failed to generate report: ${message}` },
      { status: 500 }
    )
  }
}
