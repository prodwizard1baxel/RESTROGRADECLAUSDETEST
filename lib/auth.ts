import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

const providers: any[] = []

// Only register Google if credentials are set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

// Email/Password credentials provider
providers.push(
  CredentialsProvider({
    id: "email-password",
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      })

      if (!user || !user.password) return null

      const isValid = await bcrypt.compare(credentials.password, user.password)
      if (!isValid) return null

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        onboarded: user.onboarded,
        restaurantName: user.restaurantName,
        city: user.city,
      }
    },
  })
)

// Phone OTP credentials provider
providers.push(
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
    })
)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      // For credentials (OTP) provider, skip adapter session creation
      if (account?.provider === "phone-otp") {
        return true
      }
      return true
    },
    async jwt({ token, user, account, trigger, session: updateSession }) {
      if (user) {
        token.id = user.id
        token.phone = (user as any).phone
        token.onboarded = (user as any).onboarded || false
        token.restaurantName = (user as any).restaurantName
        token.city = (user as any).city
      }
      if (account) {
        token.provider = account.provider
      }
      // Allow session update (e.g. after onboarding)
      if (trigger === "update" && updateSession) {
        if (updateSession.onboarded !== undefined) token.onboarded = updateSession.onboarded
        if (updateSession.name !== undefined) token.name = updateSession.name
        if (updateSession.restaurantName !== undefined) token.restaurantName = updateSession.restaurantName
        if (updateSession.city !== undefined) token.city = updateSession.city
      }
      // For Google/OAuth users, check onboarded status from DB
      if (account?.provider === "google" && user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id as string } })
        if (dbUser) {
          token.onboarded = dbUser.onboarded
          token.restaurantName = dbUser.restaurantName
          token.city = dbUser.city
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as any
        u.id = token.id
        u.onboarded = token.onboarded || false
        u.restaurantName = token.restaurantName
        u.city = token.city
        if (token.phone) {
          u.phone = token.phone
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
