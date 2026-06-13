import { NextResponse } from "next/server"

function isAuthorized(req: Request): boolean {
  const key = req.headers.get("x-admin-key") || new URL(req.url).searchParams.get("key")
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) return false
  return key === adminKey
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET (" + process.env.NEXTAUTH_SECRET.length + " chars)" : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET (" + process.env.GOOGLE_CLIENT_ID.substring(0, 10) + "...)" : "MISSING",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET (" + process.env.GOOGLE_CLIENT_SECRET.length + " chars)" : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.startsWith("mongodb")
        ? "SET & VALID FORMAT (" + process.env.DATABASE_URL.substring(0, 20) + "...)"
        : "SET BUT WRONG FORMAT — starts with: " + process.env.DATABASE_URL.substring(0, 15) + "... (must start with mongodb:// or mongodb+srv://)"
      : "MISSING — add your MongoDB connection string in Vercel env vars",
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "SET" : "MISSING",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "SET" : "MISSING",
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "MISSING (default: RestoRank <noreply@restorank.in>)",
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "SET" : "MISSING",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? "SET" : "MISSING",
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET ? "SET" : "MISSING",
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "SET" : "MISSING",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? "SET" : "MISSING",
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "MISSING",
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ? "SET" : "MISSING",
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "SET" : "MISSING",
    ADMIN_API_KEY: process.env.ADMIN_API_KEY ? "SET" : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  })
}
