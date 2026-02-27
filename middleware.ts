import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const CUSTOM_DOMAIN = "restorank.in"

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || ""

  // Redirect .vercel.app traffic to custom domain
  if (host.endsWith(".vercel.app")) {
    const url = request.nextUrl.clone()
    url.host = CUSTOM_DOMAIN
    url.port = ""
    url.protocol = "https"
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  // Skip API routes, static files, and Next.js internals
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
