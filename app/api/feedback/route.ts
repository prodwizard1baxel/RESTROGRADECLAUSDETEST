import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { rating, message, name, email, page } = await req.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: "Message too long (max 2000 characters)" }, { status: 400 })
    }

    // Try to get session for logged-in users
    const session = await getServerSession(authOptions)
    let userId: string | undefined

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (user) userId = user.id
    }

    await prisma.feedback.create({
      data: {
        userId,
        email: email || session?.user?.email || undefined,
        name: name || session?.user?.name || undefined,
        rating: Math.round(rating),
        message: message.trim(),
        page: page || undefined,
      },
    })

    return NextResponse.json({ success: true, message: "Thank you for your feedback!" })
  } catch (error: any) {
    console.error("Feedback error:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}
