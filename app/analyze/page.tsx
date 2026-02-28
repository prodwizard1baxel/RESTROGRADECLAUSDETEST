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
  const geocoder = useRef<google.maps.Geocoder | null>(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [cityBounds, setCityBounds] = useState<google.maps.LatLngBounds | null>(null)

  /* ─── Load Google Maps Places library ──────────────────────────── */
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google?.maps?.places) {
      const existing = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existing) return

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) return

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        autocompleteService.current = new google.maps.places.AutocompleteService()
        geocoder.current = new google.maps.Geocoder()
        setMapsLoaded(true)
      }
      document.head.appendChild(script)
    } else if (window.google?.maps?.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService()
      geocoder.current = new google.maps.Geocoder()
      setMapsLoaded(true)
    }
  }, [])

  /* ─── Geocode selected city to get bounds for location restriction ─ */
  useEffect(() => {
    if (!geocoder.current || !city || !mapsLoaded) {
      setCityBounds(null)
      return
    }
    const validCity = INDIAN_CITIES.find(c => c.toLowerCase() === city.toLowerCase())
    if (!validCity) {
      setCityBounds(null)
      return
    }
    geocoder.current.geocode(
      { address: `${validCity}, India`, componentRestrictions: { country: "IN" } },
      (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          // Use viewport which covers the whole city area
          const viewport = results[0].geometry.viewport
          if (viewport) {
            // Expand bounds by ~30% to include outskirts and suburbs
            const ne = viewport.getNorthEast()
            const sw = viewport.getSouthWest()
            const latPad = (ne.lat() - sw.lat()) * 0.3
            const lngPad = (ne.lng() - sw.lng()) * 0.3
            const expanded = new google.maps.LatLngBounds(
              { lat: sw.lat() - latPad, lng: sw.lng() - lngPad },
              { lat: ne.lat() + latPad, lng: ne.lng() + lngPad }
            )
            setCityBounds(expanded)
          } else {
            setCityBounds(null)
          }
        }
      }
    )
  }, [city, mapsLoaded])

  /* ─── Restaurant name autocomplete via Google Places ───────────── */
  const searchPlaces = useCallback((input: string) => {
    if (!autocompleteService.current || input.length < 2) {
      setPlaceSuggestions([])
      return
    }

    // Use locationBias (soft preference) when bounds available, otherwise fall back to city in query
    const request: google.maps.places.AutocompletionRequest = {
      input: cityBounds ? `${input} ${city}` : `${input} in ${city}`,
      types: ["establishment"],
      componentRestrictions: { country: "in" },
    }

    // locationBias prefers results within bounds but still shows results from nearby areas
    if (cityBounds) {
      request.locationBias = cityBounds
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
  }, [city, cityBounds])

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

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 90000)

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `API request failed (${res.status})`)
      }

      const data = await res.json()
      if (!data.reportId) throw new Error("No reportId returned")

      router.push(`/dashboard/${data.reportId}`)
    } catch (err: any) {
      console.error("Error:", err)
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.")
      } else {
        setError(err.message || "Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-[15%] w-64 h-64 bg-emerald-100/40 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-[10%] w-80 h-80 bg-teal-100/30 rounded-full blur-[120px] animate-float-delayed pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors duration-200 text-sm mb-6 group"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          <span>Back to Home</span>
        </a>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-xl shadow-slate-200/50">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-emerald-200">
              R
            </div>
            <span className="text-sm text-emerald-600 font-medium tracking-wide">RetroGrade</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-4 mb-2">
            Generate Report
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Select your city first, then pick your restaurant from the list.
          </p>

          {/* Step 1: City Input with Autofill */}
          <div ref={cityRef} className="relative mb-5">
            <label className="block text-sm text-slate-700 font-medium mb-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mr-2">1</span>
              Select City
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <input
                placeholder="Enter city name..."
                value={cityQuery}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-300"
                onChange={(e) => {
                  setCityQuery(e.target.value)
                  setCity(e.target.value)
                  // Reset restaurant when city changes
                  setName("")
                  setNameQuery("")
                  setPlaceSuggestions([])
                  setShowPlaceDropdown(false)
                }}
                onFocus={() => {
                  if (citySuggestions.length > 0) setShowCityDropdown(true)
                }}
              />
              {city && INDIAN_CITIES.some(c => c.toLowerCase() === city.toLowerCase()) && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* City suggestions dropdown */}
            {showCityDropdown && citySuggestions.length > 0 && (
              <div className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl shadow-slate-200/50 max-h-52 overflow-y-auto">
                {citySuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors duration-200 border-b border-slate-100 last:border-0 text-sm text-slate-700"
                    onClick={() => {
                      setCity(suggestion)
                      setCityQuery(suggestion)
                      setShowCityDropdown(false)
                      // Reset restaurant when city is selected
                      setName("")
                      setNameQuery("")
                      setPlaceSuggestions([])
                      setShowPlaceDropdown(false)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Restaurant Name Input — only shown after city is selected */}
          <div
            ref={placeRef}
            className={`relative mb-6 transition-all duration-500 ${
              city && INDIAN_CITIES.some(c => c.toLowerCase() === city.toLowerCase())
                ? "opacity-100 translate-y-0"
                : "opacity-40 pointer-events-none translate-y-1"
            }`}
          >
            <label className="block text-sm text-slate-700 font-medium mb-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mr-2">2</span>
              Select Restaurant in {city || "..."}
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                placeholder={city ? `Search restaurants in ${city}...` : "Select a city first..."}
                value={nameQuery}
                disabled={!city || !INDIAN_CITIES.some(c => c.toLowerCase() === city.toLowerCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-300 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
              <div className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl shadow-slate-200/50 max-h-60 overflow-y-auto">
                {placeSuggestions.map((place) => (
                  <button
                    key={place.place_id}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors duration-200 border-b border-slate-100 last:border-0"
                    onClick={() => {
                      const mainText = place.structured_formatting.main_text
                      setName(mainText)
                      setNameQuery(mainText)
                      setShowPlaceDropdown(false)
                    }}
                  >
                    <p className="text-sm text-slate-800 font-medium">{place.structured_formatting.main_text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{place.structured_formatting.secondary_text}</p>
                  </button>
                ))}
              </div>
            )}

            {!mapsLoaded && nameQuery.length >= 2 && city && (
              <p className="text-xs text-slate-400 mt-1.5">Type your restaurant name manually</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="cta-hero cta-gradient w-full text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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

          <p className="text-center text-xs text-slate-400 mt-5">
            Based on 2 years of data &bull; Results in under 2 minutes
          </p>
        </div>
      </div>
    </div>
  )
}
