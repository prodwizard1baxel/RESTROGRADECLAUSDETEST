import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Add it in Vercel → Settings → Environment Variables with your MongoDB connection string " +
      "(must start with mongodb:// or mongodb+srv://). Then redeploy."
    )
  }
  if (!url.startsWith("mongodb://") && !url.startsWith("mongodb+srv://")) {
    throw new Error(
      `DATABASE_URL has invalid format — it starts with "${url.substring(0, Math.min(15, url.indexOf("://") + 3 || 15))}..." ` +
      "but must start with mongodb:// or mongodb+srv://. " +
      "Check your Vercel environment variable for typos or extra spaces."
    )
  }

  const client = new PrismaClient()
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client
  return client
}

// Lazy proxy: only connects to DB when a Prisma method is actually called
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    if (typeof value === "function") return value.bind(client)
    return value
  },
})
