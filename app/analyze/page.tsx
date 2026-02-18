"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Analyze() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("Calling API...")

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, city })
      })

      console.log("Response status:", res.status)

      if (!res.ok) {
        throw new Error("API request failed")
      }

      const data = await res.json()

      console.log("Response data:", data)

      if (!data.reportId) {
        throw new Error("No reportId returned")
      }

      router.push(`/dashboard/${data.reportId}`)
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Generate AI Report</h1>

        <input
          placeholder="Restaurant Name"
          className="w-full border p-3 rounded mb-4"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="City"
          className="w-full border p-3 rounded mb-6"
          onChange={(e) => setCity(e.target.value)}
        />

        {error && (
          <div className="mb-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Generate Report"}
        </button>
      </div>
    </div>
  )
}
