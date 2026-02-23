import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null

        const otpRecord = await prisma.otp.findFirst({
          where: {
            phone: credentials.phone,
            code: credentials.otp,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        })

        if (!otpRecord) return null

        // Delete used OTP
        await prisma.otp.delete({ where: { id: otpRecord.id } })

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        })

        if (!user) {
          user = await prisma.user.create({
            data: { phone: credentials.phone },
          })
        }

        return { id: user.id, phone: user.phone, name: user.name, email: user.email }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
      }
      return session
    },
  },
}
