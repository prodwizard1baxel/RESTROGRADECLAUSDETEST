import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// Plan mapping based on Razorpay payment amount (in paise)
const PLAN_MAP: Record<number, { plan: string; totalReports: number; label: string }> = {
  49900: { plan: "starter", totalReports: 1, label: "Starter (1 Report)" },
  129900: { plan: "growth", totalReports: 6, label: "Growth Pack (6 Reports)" },
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

async function sendInvoiceEmail(email: string, data: {
  name: string | null
  plan: string
  amount: number
  paymentId: string
  totalReports: number
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured, skipping invoice email")
    return
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "RestoRank <noreply@restorank.in>"
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  })

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `RestoRank Payment Confirmation — ${data.plan === "starter" ? "Starter" : "Growth Pack"}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #059669; color: white; font-weight: bold; font-size: 18px; padding: 10px 16px; border-radius: 12px;">RR</div>
            <h1 style="color: #0f172a; font-size: 24px; margin: 16px 0 4px;">Payment Confirmed</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Thank you for choosing RestoRank!</p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Plan</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">${PLAN_MAP[data.amount * 100]?.label || data.plan}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Report Credits</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right; font-weight: 600;">${data.totalReports}</td>
              </tr>
              <tr style="border-top: 1px solid #e2e8f0;">
                <td style="padding: 12px 0 8px; color: #0f172a; font-size: 16px; font-weight: 700;">Total Paid</td>
                <td style="padding: 12px 0 8px; color: #059669; font-size: 16px; text-align: right; font-weight: 700;">&#8377;${data.amount}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #166534; font-size: 14px; margin: 0;">
              <strong>Payment ID:</strong> ${data.paymentId}
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://www.restorank.in/analyze" style="display: inline-block; background: #059669; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 14px;">
              Generate Your Report Now
            </a>
          </div>

          <div style="text-align: center; color: #94a3b8; font-size: 12px;">
            <p>If you have any questions, reply to this email or contact us at support@restorank.in</p>
            <p>&copy; ${new Date().getFullYear()} RestoRank. All rights reserved.</p>
          </div>
        </div>
      `,
    })
    console.log(`Invoice email sent to ${email}`)
  } catch (err) {
    console.error("Failed to send invoice email:", err)
  }
}

function generateWhatsAppInvoiceLink(phone: string, data: {
  name: string | null
  plan: string
  amount: number
  paymentId: string
  totalReports: number
}) {
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  })
  const planLabel = PLAN_MAP[data.amount * 100]?.label || data.plan
  const message = [
    `*RestoRank — Payment Confirmation*`,
    ``,
    `Hi${data.name ? ` ${data.name}` : ""}! Your payment has been confirmed.`,
    ``,
    `*Invoice Details:*`,
    `Date: ${date}`,
    `Plan: ${planLabel}`,
    `Report Credits: ${data.totalReports}`,
    `Amount Paid: ₹${data.amount}`,
    `Payment ID: ${data.paymentId}`,
    ``,
    `Generate your report here:`,
    `https://www.restorank.in/analyze`,
    ``,
    `Thank you for choosing RestoRank!`,
  ].join("\n")

  return `https://wa.me/${phone.replace(/\+/g, "")}?text=${encodeURIComponent(message)}`
}

async function sendWhatsAppInvoice(phone: string, data: {
  name: string | null
  plan: string
  amount: number
  paymentId: string
  totalReports: number
}) {
  // If WhatsApp Business API is configured, send directly
  const waApiKey = process.env.WHATSAPP_API_KEY
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!waApiKey || !waPhoneId) {
    // Log the WhatsApp link for manual sending
    const link = generateWhatsAppInvoiceLink(phone, data)
    console.log(`WhatsApp invoice link (manual): ${link}`)
    return
  }

  // Send via WhatsApp Business API (Meta Cloud API)
  try {
    const date = new Date().toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    })
    const planLabel = PLAN_MAP[data.amount * 100]?.label || data.plan
    const normalizedPhone = phone.replace(/\+/g, "")

    const body = `*RestoRank — Payment Confirmation*\n\nHi${data.name ? ` ${data.name}` : ""}! Your payment has been confirmed.\n\n*Invoice Details:*\nDate: ${date}\nPlan: ${planLabel}\nReport Credits: ${data.totalReports}\nAmount Paid: ₹${data.amount}\nPayment ID: ${data.paymentId}\n\nGenerate your report here:\nhttps://www.restorank.in/analyze\n\nThank you for choosing RestoRank!`

    await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${waApiKey}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizedPhone,
        type: "text",
        text: { body },
      }),
    })
    console.log(`WhatsApp invoice sent to ${phone}`)
  } catch (err) {
    console.error("Failed to send WhatsApp invoice:", err)
  }
}

async function processPayment(paymentData: {
  amountPaise: number
  paymentId: string
  email: string | null
  phone: string | null
  name: string | null
}) {
  const { amountPaise, paymentId, email, phone, name } = paymentData

  // Determine plan from amount
  const planInfo = PLAN_MAP[amountPaise]
  if (!planInfo) {
    console.warn(`Unknown payment amount: ${amountPaise} paise, paymentId: ${paymentId}`)
    return { status: "unknown_amount", paymentId }
  }

  // Check for duplicate payment
  const existingSub = await prisma.subscription.findFirst({
    where: { paymentId },
  })
  if (existingSub) {
    return { status: "already_processed", paymentId }
  }

  // Find user by email or phone
  let user = null
  if (email) {
    user = await prisma.user.findUnique({ where: { email } })
  }
  if (!user && phone) {
    const normalizedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/^91/, "")}`
    user = await prisma.user.findUnique({ where: { phone: normalizedPhone } })
  }

  // Create user if not found
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email || undefined,
        phone: phone ? (phone.startsWith("+") ? phone : `+91${phone.replace(/^91/, "")}`) : undefined,
        name: name || undefined,
      },
    })
  }

  // Create subscription
  const amountINR = amountPaise / 100
  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: planInfo.plan,
      totalReports: planInfo.totalReports,
      reportsUsed: 0,
      amountPaid: amountINR,
      paymentId,
      status: "active",
    },
  })

  console.log(`Payment verified: ${paymentId}, plan: ${planInfo.plan}, user: ${user.id}`)

  // Send invoice notifications (non-blocking)
  const invoiceData = {
    name: user.name || name,
    plan: planInfo.plan,
    amount: amountINR,
    paymentId,
    totalReports: planInfo.totalReports,
  }

  if (user.email || email) {
    sendInvoiceEmail((user.email || email)!, invoiceData).catch(console.error)
  }
  if (user.phone || phone) {
    sendWhatsAppInvoice((user.phone || phone)!, invoiceData).catch(console.error)
  }

  return { status: "success", paymentId, plan: planInfo.plan }
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

    // Handle Razorpay Checkout (order-based) payments
    if (event.event === "payment.captured" || event.event === "payment.authorized") {
      const payment = event.payload?.payment?.entity
      if (!payment) {
        return NextResponse.json({ error: "No payment data" }, { status: 400 })
      }

      const result = await processPayment({
        amountPaise: payment.amount,
        paymentId: payment.id,
        email: payment.email || payment.notes?.email || null,
        phone: payment.contact || payment.notes?.phone || null,
        name: payment.notes?.name || null,
      })

      return NextResponse.json(result)
    }

    // Handle Payment Link payments (legacy support)
    if (event.event === "payment_link.paid") {
      const paymentLink = event.payload?.payment_link?.entity
      const payment = event.payload?.payment?.entity
      if (!paymentLink && !payment) {
        return NextResponse.json({ error: "No payment data" }, { status: 400 })
      }

      const entity = payment || paymentLink
      const result = await processPayment({
        amountPaise: entity.amount,
        paymentId: payment?.id || paymentLink?.id,
        email: paymentLink?.customer?.email || payment?.email || null,
        phone: paymentLink?.customer?.contact || payment?.contact || null,
        name: paymentLink?.customer?.name || null,
      })

      return NextResponse.json(result)
    }

    // Acknowledge other events
    return NextResponse.json({ status: "ignored", event: event.event })
  } catch (error: any) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 })
  }
}
