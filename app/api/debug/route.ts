import { NextResponse } from "next/server"

export async function GET() {
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
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "SET" : "MISSING",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? "SET" : "MISSING",
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "MISSING",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "SET" : "MISSING",
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ? "SET" : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  })
}
