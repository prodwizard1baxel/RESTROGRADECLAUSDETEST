import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Simple admin key check — set ADMIN_API_KEY in env
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

  try {
    const url = new URL(req.url)
    const filter = url.searchParams.get("filter") || "month" // "day", "week", "month"
    const city = url.searchParams.get("city") || null

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (filter) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
        break
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    // Build city filter for users
    const cityFilter = city ? { city: { equals: city, mode: "insensitive" as const } } : {}

    // Total registrations in period
    const totalRegistrations = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        ...cityFilter,
      },
    })

    // Total payments in period
    const totalPayments = await prisma.subscription.count({
      where: {
        createdAt: { gte: startDate },
        amountPaid: { gt: 0 },
      },
    })

    // Payment revenue in period
    const paymentsInPeriod = await prisma.subscription.findMany({
      where: {
        createdAt: { gte: startDate },
        amountPaid: { gt: 0 },
      },
      select: { amountPaid: true, plan: true },
    })
    const totalRevenue = paymentsInPeriod.reduce((sum, s) => sum + s.amountPaid, 0)
    const starterPayments = paymentsInPeriod.filter(s => s.plan === "starter").length
    const growthPayments = paymentsInPeriod.filter(s => s.plan === "growth").length

    // Reports generated in period
    const totalReportsGenerated = await prisma.report.count({
      where: {
        createdAt: { gte: startDate },
      },
    })

    // New users (first-time users in period)
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        ...cityFilter,
      },
    })

    // Repeat users: users who existed before this period but generated a report in this period
    const reportsInPeriod = await prisma.report.findMany({
      where: {
        createdAt: { gte: startDate },
        userId: { not: null },
      },
      select: { userId: true },
    })
    const uniqueReportUserIds = [...new Set(reportsInPeriod.map(r => r.userId).filter(Boolean))]

    let repeatUsers = 0
    if (uniqueReportUserIds.length > 0) {
      repeatUsers = await prisma.user.count({
        where: {
          id: { in: uniqueReportUserIds as string[] },
          createdAt: { lt: startDate },
          ...cityFilter,
        },
      })
    }

    // City breakdown
    const allUsersInPeriod = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
        city: { not: null },
      },
      select: { city: true },
    })

    const cityBreakdown: Record<string, number> = {}
    allUsersInPeriod.forEach(u => {
      const c = u.city || "Unknown"
      cityBreakdown[c] = (cityBreakdown[c] || 0) + 1
    })

    // Sort cities by count desc
    const citySorted = Object.entries(cityBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([city, count]) => ({ city, count }))

    // All-time stats
    const allTimeUsers = await prisma.user.count()
    const allTimeReports = await prisma.report.count()
    const allTimePayments = await prisma.subscription.count({ where: { amountPaid: { gt: 0 } } })
    const allTimeSubs = await prisma.subscription.findMany({
      where: { amountPaid: { gt: 0 } },
      select: { amountPaid: true },
    })
    const allTimeRevenue = allTimeSubs.reduce((sum, s) => sum + s.amountPaid, 0)

    return NextResponse.json({
      filter,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      cityFilter: city,
      period: {
        registrations: totalRegistrations,
        payments: totalPayments,
        starterPayments,
        growthPayments,
        revenue: totalRevenue,
        reportsGenerated: totalReportsGenerated,
        newUsers,
        repeatUsers,
      },
      allTime: {
        totalUsers: allTimeUsers,
        totalReports: allTimeReports,
        totalPayments: allTimePayments,
        totalRevenue: allTimeRevenue,
      },
      cityBreakdown: citySorted,
    })
  } catch (error: any) {
    console.error("Admin analytics error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch analytics" }, { status: 500 })
  }
}
