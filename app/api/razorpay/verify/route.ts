import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import Razorpay from "razorpay"

async function sendInvoiceEmail(email: string, data: {
  name: string | null
  plan: string
  amount: number
  paymentId: string
  totalReports: number
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const fromEmail = process.env.RESEND_FROM_EMAIL || "RestoRank <noreply@restorank.in>"
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  })
  const planLabel = data.plan === "starter" ? "Starter (1 Report)" : "Growth Pack (6 Reports)"

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `RestoRank Payment Confirmation — ${planLabel}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #059669; color: white; font-weight: bold; font-size: 18px; padding: 10px 16px; border-radius: 12px;">RR</div>
            <h1 style="color: #0f172a; font-size: 24px; margin: 16px 0 4px;">Payment Confirmed</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Thank you for choosing RestoRank!</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">${date}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Plan</td><td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">${planLabel}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Report Credits</td><td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">${data.totalReports}</td></tr>
              <tr style="border-top: 1px solid #e2e8f0;"><td style="padding: 12px 0 8px; color: #0f172a; font-size: 16px; font-weight: 700;">Total Paid</td><td style="padding: 12px 0 8px; color: #059669; font-size: 16px; text-align: right; font-weight: 700;">&#8377;${data.amount}</td></tr>
            </table>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #166534; font-size: 14px; margin: 0;"><strong>Payment ID:</strong> ${data.paymentId}</p>
          </div>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://www.restorank.in/analyze" style="display: inline-block; background: #059669; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 14px;">Generate Your Report Now</a>
          </div>
          <div style="text-align: center; color: #94a3b8; font-size: 12px;">
            <p>If you have questions, reply to this email or contact us at support@restorank.in</p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error("Failed to send invoice email:", err)
  }
}

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

    if (amountPaise === 100) {
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

    // Send invoice email (non-blocking)
    if (user.email || email) {
      sendInvoiceEmail((user.email || email)!, {
        name: user.name,
        plan,
        amount: amountPaise / 100,
        paymentId,
        totalReports,
      }).catch(console.error)
    }

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
