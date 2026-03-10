import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { name, restaurantName, city } = await req.json()

    if (!name?.trim() || !restaurantName?.trim() || !city?.trim()) {
      return NextResponse.json({ error: "Name, restaurant name, and city are required" }, { status: 400 })
    }

    const userId = (session.user as any).id
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        restaurantName: restaurantName.trim(),
        city: city.trim(),
        onboarded: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }
}
