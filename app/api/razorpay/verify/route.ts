import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import Razorpay from "razorpay"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 })
    }

    const { paymentId } = await req.json()
    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 })
    }

    // Check if this payment was already processed
    const existingSub = await prisma.subscription.findFirst({
      where: { paymentId },
    })
    if (existingSub) {
      return NextResponse.json({ error: "Payment already processed", alreadyApplied: true }, { status: 400 })
    }

    // Verify with Razorpay API
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 })
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    let payment: any

    try {
      payment = await razorpay.payments.fetch(paymentId)
    } catch {
      return NextResponse.json({ error: "Invalid payment ID or payment not found" }, { status: 400 })
    }

    if (payment.status !== "captured") {
      return NextResponse.json({ error: `Payment not completed. Status: ${payment.status}` }, { status: 400 })
    }

    // Determine plan from amount (in paise)
    const amountPaise = payment.amount
    let plan: string
    let totalReports: number

    if (amountPaise === 49900) {
      plan = "starter"
      totalReports = 1
    } else if (amountPaise === 129900) {
      plan = "growth"
      totalReports = 6
    } else {
      return NextResponse.json({ error: `Unrecognized payment amount: ₹${amountPaise / 100}` }, { status: 400 })
    }

    // Find user
    const email = session.user.email
    const phone = (session.user as any).phone
    let user = null

    if (email) {
      user = await prisma.user.findUnique({ where: { email } })
    }
    if (!user && phone) {
      user = await prisma.user.findUnique({ where: { phone } })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create subscription
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan,
        totalReports,
        reportsUsed: 0,
        amountPaid: amountPaise / 100,
        paymentId,
        status: "active",
      },
    })

    return NextResponse.json({
      success: true,
      plan,
      totalReports,
      message: `${plan === "starter" ? "Starter" : "Growth"} plan activated with ${totalReports} report${totalReports > 1 ? "s" : ""}!`,
    })
  } catch (error: any) {
    console.error("Payment verify error:", error)
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 })
  }
}
