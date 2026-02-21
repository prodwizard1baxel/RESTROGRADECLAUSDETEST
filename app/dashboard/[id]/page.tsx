import { PrismaClient } from "@prisma/client"
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

  return <DashboardClient data={data} />
}
