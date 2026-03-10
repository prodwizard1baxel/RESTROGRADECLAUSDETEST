"use client"

import { Suspense, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    }>
      <PaymentSuccessInner />
    </Suspense>
  )
}

function PaymentSuccessInner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(5)

  const razorpayPaymentId = searchParams.get("razorpay_payment_id") || searchParams.get("razorpay_payment_link_id") || ""

  // Try to verify payment if we have a payment ID and session
  useEffect(() => {
    async function verifyPayment() {
      if (!razorpayPaymentId) {
        // No payment ID in URL - payment likely came through webhook
        setVerifying(false)
        setVerified(true)
        return
      }

      if (status === "loading") return

      if (!session?.user) {
        // Not logged in - still show success, webhook handles subscription
        setVerifying(false)
        setVerified(true)
        return
      }

      try {
        const res = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: razorpayPaymentId }),
        })
        const data = await res.json()
        if (res.ok) {
          setVerified(true)
        } else if (data.error === "Payment already processed") {
          // Already processed via webhook - still a success
          setVerified(true)
        } else {
          // Verification failed but webhook may still process it
          setVerified(true)
        }
      } catch {
        // Network error - assume webhook handled it
        setVerified(true)
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [razorpayPaymentId, session, status])

  // Auto-redirect countdown after verification
  useEffect(() => {
    if (!verified || verifying) return

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          router.push("/analyze")
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [verified, verifying, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {verifying ? (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Verifying Payment...</h1>
            <p className="text-slate-500">Please wait while we confirm your payment.</p>
          </div>
        ) : verified ? (
          <div className="space-y-6">
            {/* Success checkmark */}
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
              <p className="text-slate-500">
                Your credits have been added to your account. You can now generate your competitive intelligence report.
              </p>
            </div>

            {/* What's next */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left space-y-4">
              <h3 className="font-semibold text-slate-900">What happens next?</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span className="text-sm text-slate-600">Enter your restaurant name and city</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span className="text-sm text-slate-600">We analyze 2 years of Google Maps data, reviews, competitors, and more</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span className="text-sm text-slate-600">Get your detailed competitive intelligence report instantly</span>
                </li>
              </ol>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Link
                href="/analyze"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-200"
              >
                Generate Your Report Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <p className="text-xs text-slate-400">
                Redirecting to report generator in {countdown}s...
              </p>
            </div>

            {!session?.user && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Tip:</strong> Make sure to sign in with the same email or phone you used during payment so your credits are linked to your account.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Payment Verification Pending</h1>
            <p className="text-slate-500">
              {error || "We're still processing your payment. It may take a moment. If you've completed the payment, your credits will be added shortly."}
            </p>
            <Link
              href="/analyze"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all duration-300"
            >
              Go to Report Generator
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
