import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import DashboardClient from "./DashboardClient"

const prisma = new PrismaClient()

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!id) {
    return <div className="p-10 text-xl">Missing Report ID</div>
  }

  const report = await prisma.report.findUnique({
    where: { id },
    include: { restaurant: true },
  })

  if (!report) {
    return <div className="p-10 text-xl">Invalid Report ID</div>
  }

  /* Inject restaurant name/city into data if not already present (backwards compat) */
  const data: any = report.data || {}
  if (!data.restaurantName && report.restaurant) {
    data.restaurantName = report.restaurant.name
    data.restaurantCity = report.restaurant.city
  }

  // Check if user is signed in and has an active subscription
  let hasFullAccess = false
  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscriptions: { where: { status: "active" }, orderBy: { createdAt: "desc" } } },
    })
    if (user && user.subscriptions.length > 0) {
      const activeSub = user.subscriptions.find(s => s.reportsUsed < s.totalReports)
      if (activeSub) {
        hasFullAccess = true
      }
    }
  }

  return <DashboardClient data={data} hasFullAccess={hasFullAccess} />
}
