import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// Plan mapping based on Razorpay payment amount (in paise)
const PLAN_MAP: Record<number, { plan: string; totalReports: number }> = {
  49900: { plan: "starter", totalReports: 1 },   // ₹499
  129900: { plan: "growth", totalReports: 6 },    // ₹1,299
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    const body = await req.text()
    const signature = req.headers.get("x-razorpay-signature") || ""

    if (!verifySignature(body, signature, secret)) {
      console.error("Razorpay webhook signature verification failed")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    if (event.event === "payment_link.paid") {
      const payment = event.payload?.payment_link?.entity
      if (!payment) {
        return NextResponse.json({ error: "No payment data" }, { status: 400 })
      }

      const amountPaise = payment.amount
      const paymentId = payment.id
      const customerEmail = payment.customer?.email || null
      const customerPhone = payment.customer?.contact || null
      const customerName = payment.customer?.name || null

      // Determine plan from amount
      const planInfo = PLAN_MAP[amountPaise]
      if (!planInfo) {
        console.warn(`Unknown payment amount: ${amountPaise} paise, paymentId: ${paymentId}`)
        // Still acknowledge the webhook
        return NextResponse.json({ status: "unknown_amount", paymentId })
      }

      // Check for duplicate payment
      const existingSub = await prisma.subscription.findFirst({
        where: { paymentId },
      })
      if (existingSub) {
        return NextResponse.json({ status: "already_processed", paymentId })
      }

      // Find user by email or phone
      let user = null
      if (customerEmail) {
        user = await prisma.user.findUnique({ where: { email: customerEmail } })
      }
      if (!user && customerPhone) {
        // Normalize phone: Razorpay may send with or without +91
        const normalizedPhone = customerPhone.startsWith("+") ? customerPhone : `+91${customerPhone.replace(/^91/, "")}`
        user = await prisma.user.findUnique({ where: { phone: normalizedPhone } })
      }

      // Create user if not found
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: customerEmail,
            phone: customerPhone ? (customerPhone.startsWith("+") ? customerPhone : `+91${customerPhone.replace(/^91/, "")}`) : undefined,
            name: customerName,
          },
        })
      }

      // Create subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: planInfo.plan,
          totalReports: planInfo.totalReports,
          reportsUsed: 0,
          amountPaid: amountPaise / 100, // Convert paise to INR
          paymentId,
          status: "active",
        },
      })

      console.log(`Payment verified: ${paymentId}, plan: ${planInfo.plan}, user: ${user.id}`)
      return NextResponse.json({ status: "success", paymentId, plan: planInfo.plan })
    }

    // Acknowledge other events
    return NextResponse.json({ status: "ignored", event: event.event })
  } catch (error: any) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 })
  }
}
