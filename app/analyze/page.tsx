"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"

/* ─── Indian cities list for autocomplete ───────────────────────────── */
const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
  "Kolkata", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
  "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara",
  "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
  "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar",
  "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore",
  "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai",
  "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur",
  "Hubli", "Mysore", "Tiruchirappalli", "Bareilly", "Aligarh",
  "Tiruppur", "Moradabad", "Jalandhar", "Bhubaneswar", "Salem",
  "Warangal", "Guntur", "Bhiwandi", "Saharanpur", "Gorakhpur",
  "Bikaner", "Amravati", "Noida", "Jamshedpur", "Bhilai",
  "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar",
  "Dehradun", "Durgapur", "Asansol", "Rourkela", "Nanded",
  "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar",
  "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar",
  "Jammu", "Sangli", "Mangalore", "Erode", "Belgaum",
  "Kurnool", "Ambattur", "Rajahmundry", "Tirunelveli",
  "Malegaon", "Gaya", "Udaipur", "Kakinada", "Davanagere",
  "Kozhikode", "Maheshtala", "Rajpur Sonarpur", "Bokaro",
  "South Dumdum", "Bellary", "Patiala", "Gopalpur", "Agartala",
  "Bhagalpur", "Muzaffarnagar", "Bhatpara", "Panihati",
  "Latur", "Dhule", "Rohtak", "Sagar", "Korba",
  "Bhilwara", "Berhampur", "Muzaffarpur", "Ahmednagar",
  "Mathura", "Kollam", "Avadi", "Kadapa", "Anantapur",
  "Kamarhati", "Bilaspur", "Sambalpur", "Shahjahanpur",
  "Satara", "Bijapur", "Rampur", "Shimoga", "Chandrapur",
  "Junagadh", "Thrissur", "Alwar", "Bardhaman", "Kulti",
  "Nizamabad", "Parbhani", "Tumkur", "Khammam", "Ozhukarai",
  "Bihar Sharif", "Jalgaon", "Udaipur", "Imphal",
  "Goa", "Pondicherry", "Shimla", "Gangtok", "Shillong",
]

export default function Analyze() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* ─── City autocomplete state ──────────────────────────────────── */
  const [cityQuery, setCityQuery] = useState("")
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const cityRef = useRef<HTMLDivElement>(null)

  /* ─── Google Places autocomplete state ─────────────────────────── */
  const [placeSuggestions, setPlaceSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false)
  const [nameQuery, setNameQuery] = useState("")
  const placeRef = useRef<HTMLDivElement>(null)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)

  /* ─── Load Google Maps Places library ──────────────────────────── */
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google?.maps?.places) {
      const existing = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existing) return

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        autocompleteService.current = new google.maps.places.AutocompleteService()
        setMapsLoaded(true)
      }
      document.head.appendChild(script)
    } else if (window.google?.maps?.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService()
      setMapsLoaded(true)
    }
  }, [])

  /* ─── Restaurant name autocomplete via Google Places ───────────── */
  const searchPlaces = useCallback((input: string) => {
    if (!autocompleteService.current || input.length < 2) {
      setPlaceSuggestions([])
      return
    }

    const request: google.maps.places.AutocompletionRequest = {
      input,
      types: ["establishment"],
      componentRestrictions: { country: "in" },
    }

    if (city) {
      request.input = `${input} ${city}`
    }

    autocompleteService.current.getPlacePredictions(
      request,
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPlaceSuggestions(predictions)
          setShowPlaceDropdown(true)
        } else {
          setPlaceSuggestions([])
        }
      }
    )
  }, [city])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (nameQuery.length >= 2 && mapsLoaded) {
        searchPlaces(nameQuery)
      } else {
        setPlaceSuggestions([])
        setShowPlaceDropdown(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [nameQuery, mapsLoaded, searchPlaces])

  /* ─── City filter ──────────────────────────────────────────────── */
  useEffect(() => {
    if (cityQuery.length > 0) {
      const filtered = INDIAN_CITIES.filter((c) =>
        c.toLowerCase().startsWith(cityQuery.toLowerCase())
      ).slice(0, 8)
      setCitySuggestions(filtered)
      setShowCityDropdown(filtered.length > 0)
    } else {
      setCitySuggestions([])
      setShowCityDropdown(false)
    }
  }, [cityQuery])

  /* ─── Click outside handler ────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false)
      }
      if (placeRef.current && !placeRef.current.contains(e.target as Node)) {
        setShowPlaceDropdown(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSubmit = async () => {
    if (!name.trim() || !city.trim()) {
      setError("Please enter both restaurant name and city")
      return
    }

    try {
      setLoading(true)
      setError("")

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `API request failed (${res.status})`)
      }

      const data = await res.json()
      if (!data.reportId) throw new Error("No reportId returned")

      router.push(`/dashboard/${data.reportId}`)
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-[15%] w-64 h-64 bg-green-500/[0.05] rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-[10%] w-80 h-80 bg-emerald-500/[0.04] rounded-full blur-[120px] animate-float-delayed pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              bottom: "0",
              animation: `particle-rise ${8 + i * 2}s linear infinite`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-green-400 transition-colors duration-200 text-sm mb-6 group"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          <span>Back to Home</span>
        </a>

        <div className="glass-card-green rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-black text-sm shadow-lg shadow-green-500/20">
              R
            </div>
            <span className="text-sm text-green-400 font-medium tracking-wide">RetroGrade AI</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mt-4 mb-2">
            Generate AI Report
          </h1>
          <p className="text-neutral-400 text-sm mb-8">
            Enter your restaurant details and we&apos;ll analyze your competitive landscape in under 2 minutes.
          </p>

          {/* Restaurant Name Input with Google Places Autocomplete */}
          <div ref={placeRef} className="relative mb-5">
            <label className="block text-sm text-neutral-300 font-medium mb-2">Restaurant Name</label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                placeholder="Search restaurant..."
                value={nameQuery}
                className="w-full bg-neutral-900/60 border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20 transition-all duration-300"
                onChange={(e) => {
                  setNameQuery(e.target.value)
                  setName(e.target.value)
                }}
                onFocus={() => {
                  if (placeSuggestions.length > 0) setShowPlaceDropdown(true)
                }}
              />
            </div>

            {/* Place suggestions dropdown */}
            {showPlaceDropdown && placeSuggestions.length > 0 && (
              <div className="absolute z-20 mt-1.5 w-full bg-neutral-900 border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl shadow-black/50 max-h-60 overflow-y-auto">
                {placeSuggestions.map((place) => (
                  <button
                    key={place.place_id}
                    className="w-full text-left px-4 py-3 hover:bg-green-500/10 transition-colors duration-200 border-b border-white/[0.04] last:border-0"
                    onClick={() => {
                      const mainText = place.structured_formatting.main_text
                      setName(mainText)
                      setNameQuery(mainText)
                      setShowPlaceDropdown(false)
                    }}
                  >
                    <p className="text-sm text-white font-medium">{place.structured_formatting.main_text}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{place.structured_formatting.secondary_text}</p>
                  </button>
                ))}
              </div>
            )}

            {!mapsLoaded && nameQuery.length >= 2 && (
              <p className="text-xs text-neutral-600 mt-1.5">Loading Google Places...</p>
            )}
          </div>

          {/* City Input with Autofill */}
          <div ref={cityRef} className="relative mb-6">
            <label className="block text-sm text-neutral-300 font-medium mb-2">City</label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <input
                placeholder="Enter city name..."
                value={cityQuery}
                className="w-full bg-neutral-900/60 border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20 transition-all duration-300"
                onChange={(e) => {
                  setCityQuery(e.target.value)
                  setCity(e.target.value)
                }}
                onFocus={() => {
                  if (citySuggestions.length > 0) setShowCityDropdown(true)
                }}
              />
            </div>

            {/* City suggestions dropdown */}
            {showCityDropdown && citySuggestions.length > 0 && (
              <div className="absolute z-20 mt-1.5 w-full bg-neutral-900 border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl shadow-black/50 max-h-52 overflow-y-auto">
                {citySuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="w-full text-left px-4 py-3 hover:bg-green-500/10 transition-colors duration-200 border-b border-white/[0.04] last:border-0 text-sm text-neutral-200"
                    onClick={() => {
                      setCity(suggestion)
                      setCityQuery(suggestion)
                      setShowCityDropdown(false)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="cta-hero w-full bg-gradient-to-r from-green-500 to-emerald-500 text-black py-4 rounded-xl font-bold text-lg hover:from-green-400 hover:to-emerald-400 transition-all duration-300 shadow-xl shadow-green-500/20 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing Your Market...</span>
              </>
            ) : (
              <>
                <span>Generate Report</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* Trust signal */}
          <p className="text-center text-xs text-neutral-600 mt-5">
            No sign-up required &bull; Free &bull; Results in under 2 minutes
          </p>
        </div>
      </div>
    </div>
  )
}
