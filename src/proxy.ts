import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

const PUBLIC_PATHS = new Set(["/", "/login", "/signup"])
const STUDENT_PREFIXES = ["/dashboard", "/projects"]
const TEACHER_PREFIXES = ["/teacher"]

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/exam/") ||
    pathname.startsWith("/auth/")
  )
}

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  if (isPublic(pathname)) return supabaseResponse

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  const role = user.user_metadata?.role as string | undefined

  if (!role && pathname !== "/onboarding") {
    const url = request.nextUrl.clone()
    url.pathname = "/onboarding"
    return NextResponse.redirect(url)
  }

  if (role && pathname === "/onboarding") {
    const url = request.nextUrl.clone()
    url.pathname = role === "TEACHER" ? "/teacher/dashboard" : "/dashboard"
    return NextResponse.redirect(url)
  }

  if (
    role === "STUDENT" &&
    TEACHER_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  if (
    role === "TEACHER" &&
    STUDENT_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/teacher/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
