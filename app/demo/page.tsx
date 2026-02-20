import DashboardClient from "../dashboard/[id]/DashboardClient"

const DEMO_DATA = {
  executiveSummary:
    "Spice Garden operates in a highly competitive corridor in Bandra West, Mumbai. The top 5 nearby competitors maintain an average rating of 4.3 stars with strong review volumes, posing a significant threat to market share. Competitors like The Bombay Canteen and Bastian lead with exceptional branding, food quality, and online visibility. However, Spice Garden has a clear opportunity to differentiate through regional authenticity, aggressive SEO keyword ownership, and loyalty programs. Immediate action on digital presence and menu storytelling is recommended.",
  finalStrategicVerdict:
    "Spice Garden faces moderate-to-high competitive pressure. The primary threat comes from well-funded restaurant brands with polished digital footprints. To counter this, prioritize Google Business Profile optimisation, invest in content marketing around regional cuisine keywords, and launch a weekday lunch deal to capture the underserved office crowd. Your cuisine niche is defensible — lean into it.",
  yourKeywordCluster: [
    "authentic Indian food Bandra",
    "best dal makhani Mumbai",
    "regional thali restaurant",
    "family dining Bandra West",
    "homestyle North Indian Mumbai",
    "butter chicken Bandra",
  ],
  competitorKeywordClusters: [
    {
      restaurant: "The Bombay Canteen",
      keywords: [
        "modern Indian cuisine",
        "craft cocktails Mumbai",
        "upscale dining Bandra",
        "Instagram food Mumbai",
      ],
    },
    {
      restaurant: "Bastian",
      keywords: [
        "seafood restaurant Mumbai",
        "celebrity chef restaurant",
        "best sushi Mumbai",
        "fine dining Bandra",
      ],
    },
    {
      restaurant: "Pali Village Cafe",
      keywords: [
        "brunch Bandra",
        "outdoor seating Mumbai",
        "pet-friendly cafe",
        "continental food Bandra",
      ],
    },
    {
      restaurant: "Smoke House Deli",
      keywords: [
        "deli food Mumbai",
        "healthy breakfast Bandra",
        "salads Mumbai",
        "European cafe India",
      ],
    },
    {
      restaurant: "Sequel",
      keywords: [
        "vegan food Mumbai",
        "healthy restaurant Bandra",
        "gluten-free Mumbai",
        "wellness dining India",
      ],
    },
  ],
  competitorAnalysis: {
    overallThreatLevel: "Moderate-High",
    averageThreatScore: 71,
    topCompetitors: [
      {
        name: "The Bombay Canteen",
        address: "Unit-1, Process House, Kamala Mills, Lower Parel, Mumbai",
        rating: 4.5,
        totalRatings: 4820,
        distanceKm: 1.2,
        cuisine: ["restaurant", "bar", "Indian"],
        averagePrice: 1800,
        threatScore: 88,
        sentimentLabel: "Very Positive",
        sentimentScore: 9.1,
        strengths: [
          "Iconic brand with national media coverage",
          "Strong cocktail & beverage programme",
          "Exceptional interior design and ambience",
          "High social media engagement",
        ],
        weaknesses: [
          "Premium pricing alienates budget diners",
          "Long wait times on weekends",
          "Limited parking availability",
        ],
      },
      {
        name: "Bastian",
        address: "B/1, New Kamal Building, Linking Road, Bandra West, Mumbai",
        rating: 4.4,
        totalRatings: 3210,
        distanceKm: 0.7,
        cuisine: ["restaurant", "seafood", "fine_dining"],
        averagePrice: 2200,
        threatScore: 83,
        sentimentLabel: "Very Positive",
        sentimentScore: 8.8,
        strengths: [
          "Celebrity-chef association drives aspirational dining",
          "Seafood sourcing story resonates with customers",
          "Strong repeat footfall from affluent clientele",
        ],
        weaknesses: [
          "Very high price point",
          "Cuisine is seafood-focused — limited overlap with Indian cuisine crowd",
          "Reservation-only model reduces walk-in traffic",
        ],
      },
      {
        name: "Pali Village Cafe",
        address: "Pali Naka, Bandra West, Mumbai",
        rating: 4.2,
        totalRatings: 2100,
        distanceKm: 0.4,
        cuisine: ["cafe", "continental", "brunch"],
        averagePrice: 900,
        threatScore: 74,
        sentimentLabel: "Positive",
        sentimentScore: 7.9,
        strengths: [
          "Beloved neighbourhood spot with loyal regulars",
          "Outdoor seating is highly rated in reviews",
          "Strong brunch and breakfast positioning",
        ],
        weaknesses: [
          "Service inconsistency highlighted in 1-star reviews",
          "Limited dinner-focused marketing",
          "Smaller kitchen limits menu variety",
        ],
      },
      {
        name: "Smoke House Deli",
        address: "Linking Road, Bandra West, Mumbai",
        rating: 4.0,
        totalRatings: 1870,
        distanceKm: 1.8,
        cuisine: ["cafe", "deli", "continental"],
        averagePrice: 750,
        threatScore: 63,
        sentimentLabel: "Positive",
        sentimentScore: 7.3,
        strengths: [
          "Chain brand recognition across Mumbai",
          "Consistent food quality across outlets",
          "Good vegetarian and healthy options",
        ],
        weaknesses: [
          "Chain feel reduces uniqueness",
          "Slow adoption of digital marketing trends",
          "Menu changes infrequently",
        ],
      },
      {
        name: "Sequel",
        address: "Ground Floor, Bandra Linking Road, Mumbai",
        rating: 4.1,
        totalRatings: 980,
        distanceKm: 1.1,
        cuisine: ["restaurant", "healthy", "vegan"],
        averagePrice: 1100,
        threatScore: 58,
        sentimentLabel: "Neutral-Positive",
        sentimentScore: 6.8,
        strengths: [
          "Strong positioning in growing vegan/healthy niche",
          "Active influencer collaborations",
          "Modern, photogenic interiors",
        ],
        weaknesses: [
          "Niche appeal limits total addressable market",
          "Smaller review volume limits SEO authority",
          "Higher price vs perceived value for some customers",
        ],
      },
    ],
    sameCuisineNearby: [
      {
        name: "Highway Gomantak",
        address: "Mahim, Mumbai",
        rating: 4.3,
        distanceKm: 2.1,
        threatScore: 69,
      },
      {
        name: "Aswad Restaurant",
        address: "Dadar West, Mumbai",
        rating: 4.4,
        distanceKm: 3.4,
        threatScore: 72,
      },
      {
        name: "Rajdhani",
        address: "Phoenix Palladium, Lower Parel",
        rating: 4.2,
        distanceKm: 4.2,
        threatScore: 65,
      },
      {
        name: "Hotel Sagar",
        address: "Bandra East, Mumbai",
        rating: 3.9,
        distanceKm: 1.6,
        threatScore: 54,
      },
      {
        name: "Swati Snacks",
        address: "Tardeo, Mumbai",
        rating: 4.6,
        distanceKm: 4.8,
        threatScore: 80,
      },
    ],
    newHighRatedRestaurants: [
      {
        name: "The Bohri Kitchen",
        address: "Colaba, Mumbai",
        rating: 4.5,
        totalRatings: 87,
        threatScore: 62,
      },
      {
        name: "Gaia",
        address: "Bandra West, Mumbai",
        rating: 4.3,
        totalRatings: 44,
        threatScore: 55,
      },
      {
        name: "Cariappa",
        address: "Khar West, Mumbai",
        rating: 4.4,
        totalRatings: 110,
        threatScore: 61,
      },
    ],
  },
  revenueInsights: {
    estimatedMonthlyRevenueLoss: 48000,
    estimatedMonthlyRevenueGain: 85000,
  },
}

export default function DemoPage() {
  return (
    <div>
      <div className="bg-yellow-500 text-black text-center py-3 text-sm font-semibold">
        DEMO — Sample report for &quot;Spice Garden, Bandra West, Mumbai&quot;. No real API data.
      </div>
      <DashboardClient data={DEMO_DATA} />
    </div>
  )
}
