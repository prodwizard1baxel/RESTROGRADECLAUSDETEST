"use client"

import { signIn, SessionProvider } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Suspense, useState, useRef, useEffect } from "react"

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/analyze"
  const error = searchParams.get("error")

  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"main" | "otp">("main")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [otpSending, setOtpSending] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleGmailSignIn = async () => {
    setLoading(true)
    try {
      await signIn("google", { callbackUrl })
    } catch {
      setLoading(false)
    }
  }

  const isValidIndianPhone = (num: string) => /^[6-9]\d{9}$/.test(num)

  const handleSendOtp = async () => {
    if (!isValidIndianPhone(phone)) {
      setOtpError("Enter a valid 10-digit Indian mobile number")
      return
    }
    setOtpError("")
    setOtpSending(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}` }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setOtpSent(true)
        setCountdown(30)
        setTimeout(() => otpRefs.current[0]?.focus(), 100)
      } else {
        setOtpError(data.error || "Failed to send OTP")
      }
    } catch {
      setOtpError("Network error. Please try again.")
    } finally {
      setOtpSending(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
    // Auto-verify when all digits entered
    const fullOtp = newOtp.join("")
    if (fullOtp.length === 6) {
      verifyOtp(fullOtp)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      const digits = pasted.split("")
      setOtp(digits)
      otpRefs.current[5]?.focus()
      verifyOtp(pasted)
    }
  }

  const verifyOtp = async (code: string) => {
    setOtpVerifying(true)
    setOtpError("")
    try {
      const result = await signIn("phone-otp", {
        phone: `+91${phone}`,
        otp: code,
        redirect: false,
      })
      if (result?.ok) {
        window.location.href = callbackUrl
      } else {
        setOtpError("Invalid or expired OTP. Please try again.")
        setOtp(["", "", "", "", "", ""])
        otpRefs.current[0]?.focus()
      }
    } catch {
      setOtpError("Verification failed. Please try again.")
    } finally {
      setOtpVerifying(false)
    }
  }

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked: "This email is already associated with another sign-in method.",
    OAuthCallbackError: "Google sign-in was cancelled or failed. Please try again.",
    OAuthSignin: "Could not start Google sign-in. Please check that Google OAuth is configured.",
    OAuthCallback: "Error during Google sign-in callback. Please try again.",
    Configuration: "Server configuration error. Please ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXTAUTH_SECRET environment variables are set.",
    AccessDenied: "Access denied. You do not have permission to sign in.",
    Verification: "The verification link has expired or has already been used.",
    Default: "Unable to sign in. Please try again.",
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-6 h-16 flex items-center">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow duration-300">
            R
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-800">
            Retro<span className="text-emerald-600">Grade</span>
          </span>
        </a>
      </nav>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to RetroGrade</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Sign in to generate competitive intelligence reports for your restaurant
              </p>
            </div>

            {/* Error Message */}
            {(error || otpError) && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700 font-medium mb-1">Sign-in failed</p>
                <p className="text-xs text-red-600">
                  {otpError || (error && (errorMessages[error] || errorMessages.Default))}
                </p>
              </div>
            )}

            {mode === "main" ? (
              <>
                {/* Gmail Sign In Button */}
                <button
                  onClick={handleGmailSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 rounded-xl px-6 py-3.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  <span>{loading ? "Signing in..." : "Continue with Google"}</span>
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-4 text-slate-400 uppercase tracking-wider">or</span>
                  </div>
                </div>

                {/* Phone OTP Button */}
                <button
                  onClick={() => { setMode("otp"); setOtpError("") }}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white rounded-xl px-6 py-3.5 text-sm font-semibold hover:bg-slate-800 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                  <span>Continue with Mobile OTP</span>
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-4 text-slate-400 uppercase tracking-wider">or</span>
                  </div>
                </div>

                {/* Continue without sign-in */}
                <a
                  href="/analyze"
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                >
                  Continue without signing in
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </>
            ) : (
              <>
                {/* OTP Flow */}
                {!otpSent ? (
                  <>
                    {/* Phone Input */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 shrink-0">
                          <span className="text-base">&#127470;&#127475;</span>
                          +91
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10)
                            setPhone(val)
                            setOtpError("")
                          }}
                          placeholder="Enter 10-digit number"
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                          autoFocus
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400">We&apos;ll send a 6-digit OTP to verify your number</p>
                    </div>

                    <button
                      onClick={handleSendOtp}
                      disabled={otpSending || phone.length !== 10}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl px-6 py-3.5 text-sm font-semibold hover:bg-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpSending ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    {/* OTP Input */}
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Enter verification code</p>
                          <p className="text-xs text-slate-400">Sent to +91 {phone}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-center mb-4" onPaste={handleOtpPaste}>
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => { otpRefs.current[i] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className="w-12 h-14 text-center text-xl font-bold text-slate-800 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                          />
                        ))}
                      </div>

                      {otpVerifying && (
                        <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Verifying...
                        </div>
                      )}
                    </div>

                    {/* Resend OTP */}
                    <div className="text-center">
                      {countdown > 0 ? (
                        <p className="text-xs text-slate-400">Resend OTP in <span className="font-semibold text-slate-600">{countdown}s</span></p>
                      ) : (
                        <button
                          onClick={handleSendOtp}
                          disabled={otpSending}
                          className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Back button */}
                <button
                  onClick={() => { setMode("main"); setOtpSent(false); setOtpError(""); setOtp(["", "", "", "", "", ""]); setCountdown(0) }}
                  className="mt-6 w-full flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Back to all sign-in options
                </button>
              </>
            )}

            {/* Terms */}
            <p className="mt-8 text-center text-[11px] text-slate-400 leading-relaxed">
              By signing in, you agree to our{" "}
              <a href="/terms" className="underline hover:text-slate-600 transition-colors">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Secure authentication powered by NextAuth.js
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </SessionProvider>
  )
}
