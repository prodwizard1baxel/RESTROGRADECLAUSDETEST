import { NextResponse } from "next/server"

const PLANS: Record<string, { amount: number; description: string }> = {
  starter: { amount: 100, description: "RestoRank Starter — 1 Report" },
  growth: { amount: 129900, description: "RestoRank Growth Pack — 6 Reports" },
}

export async function POST(req: Request) {
  try {
    const { plan } = await req.json()

    const planInfo = PLANS[plan]
    if (!planInfo) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment configuration missing" }, { status: 500 })
    }

    // Create Razorpay order via API
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: planInfo.amount,
        currency: "INR",
        notes: { plan },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Razorpay order creation failed:", err)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    const order = await res.json()

    return NextResponse.json({
      orderId: order.id,
      amount: planInfo.amount,
      currency: "INR",
      keyId,
      description: planInfo.description,
    })
  } catch (error: any) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 })
  }
}
