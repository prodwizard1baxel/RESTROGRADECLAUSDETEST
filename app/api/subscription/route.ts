import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ hasCredits: false, reportsRemaining: 0, message: "Not signed in" })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscriptions: { where: { status: "active" }, orderBy: { createdAt: "desc" } } },
    })

    if (!user || user.subscriptions.length === 0) {
      return NextResponse.json({ hasCredits: false, reportsRemaining: 0, message: "No active subscription" })
    }

    const activeSub = user.subscriptions.find(s => s.reportsUsed < s.totalReports)
    if (!activeSub) {
      return NextResponse.json({ hasCredits: false, reportsRemaining: 0, message: "All report credits used" })
    }

    return NextResponse.json({
      hasCredits: true,
      reportsRemaining: activeSub.totalReports - activeSub.reportsUsed,
      plan: activeSub.plan,
      totalReports: activeSub.totalReports,
      reportsUsed: activeSub.reportsUsed,
    })
  } catch (error: any) {
    return NextResponse.json({ hasCredits: false, reportsRemaining: 0, message: error.message }, { status: 500 })
  }
}
