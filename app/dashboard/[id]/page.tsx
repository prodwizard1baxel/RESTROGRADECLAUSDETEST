import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import DashboardClient from "./DashboardClient"

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

  // Full access for any logged-in user; guests see blurred preview
  const session = await getServerSession(authOptions)
  const hasFullAccess = !!(session?.user)

  return <DashboardClient data={data} hasFullAccess={hasFullAccess} />
}
