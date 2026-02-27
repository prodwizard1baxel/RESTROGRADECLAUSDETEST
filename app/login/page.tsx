"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/analyze"
  const error = searchParams.get("error")
  const [loading, setLoading] = useState(false)

  const handleGmailSignIn = async () => {
    setLoading(true)
    try {
      await signIn("google", { callbackUrl })
    } catch {
      setLoading(false)
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
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700 font-medium mb-1">Sign-in failed</p>
                <p className="text-xs text-red-600">
                  {errorMessages[error] || errorMessages.Default}
                </p>
              </div>
            )}

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
            <div className="relative my-8">
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
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
