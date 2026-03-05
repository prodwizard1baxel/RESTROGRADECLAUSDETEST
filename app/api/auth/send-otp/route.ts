import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import twilio from "twilio"

export async function POST(req: Request) {
  try {
    const { phone, channel } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 })
    }

    // Validate Indian phone number format
    if (!/^\+91[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid Indian mobile number" }, { status: 400 })
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP with 5-minute expiry
    await prisma.otp.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    // Send via Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !twilioPhone) {
      // Dev mode: return OTP in response for testing
      console.log(`[DEV] OTP for ${phone}: ${code}`)
      return NextResponse.json({ success: true, dev: true, otp: code })
    }

    const client = twilio(accountSid, authToken)

    if (channel === "whatsapp") {
      await client.messages.create({
        body: `Your RetroGrade verification code is: ${code}. Valid for 5 minutes.`,
        from: `whatsapp:${twilioPhone}`,
        to: `whatsapp:${phone}`,
      })
    } else {
      await client.messages.create({
        body: `Your RetroGrade verification code is: ${code}. Valid for 5 minutes.`,
        from: twilioPhone,
        to: phone,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 })
  }
}
