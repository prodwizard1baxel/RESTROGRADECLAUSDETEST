import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// Valid promo codes — 'restorank' gives 100% discount (full access)
const PROMO_CODES: Record<string, { discount: number; reports: number }> = {
  restorank: { discount: 100, reports: 999 },
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sign in required to apply promo code" }, { status: 401 })
    }

    const { code } = await req.json()
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Promo code required" }, { status: 400 })
    }

    const promo = PROMO_CODES[code.toLowerCase().trim()]
    if (!promo) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscriptions: { where: { status: "active", paymentId: { startsWith: "PROMO_" } } } },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user already used a promo code
    if (user.subscriptions.length > 0) {
      return NextResponse.json({ error: "You have already applied a promo code" }, { status: 400 })
    }

    // Create subscription with promo
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "promo",
        totalReports: promo.reports,
        reportsUsed: 0,
        amountPaid: 0,
        paymentId: `PROMO_${code.toUpperCase()}`,
        status: "active",
      },
    })

    return NextResponse.json({
      success: true,
      discount: promo.discount,
      message: promo.discount === 100 ? "Full access unlocked!" : `${promo.discount}% discount applied`,
    })
  } catch (error: any) {
    console.error("Promo code error:", error)
    return NextResponse.json({ error: error.message || "Failed to apply promo code" }, { status: 500 })
  }
}
