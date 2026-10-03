import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Forward OAuth code parameter to /auth/callback if redirected to root or any other page
  const code = request.nextUrl.searchParams.get("code")
  if (code && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/callback"
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hszljstojfizjehqkhzk.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzemxqc3RvamZpemplaHFraHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzEyMjAsImV4cCI6MjEwMzk0NzIyMH0.XUcYD0M5zLV0LeGNBtP8YbREipS6sY0AEQg0a10sPDA",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Helper to copy all supabase cookies to any redirect response
  function redirectWithCookies(targetUrl: URL | string, status = 307) {
    const res = NextResponse.redirect(targetUrl, status)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      res.cookies.set(cookie.name, cookie.value, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        ...cookie,
      })
    })
    return res
  }

  // Canonical host handling: ensure www.finnastudio.me consistency
  const host = request.headers.get("host") || ""
  if (host === "finnastudio.me") {
    const canonicalUrl = new URL(request.url)
    canonicalUrl.host = "www.finnastudio.me"
    canonicalUrl.protocol = "https:"
    return redirectWithCookies(canonicalUrl, 301)
  }

  const { data: { user } } = await supabase.auth.getUser()

  const isEstimateMode = request.cookies.get("finna_estimate_mode")?.value === "true"

  // Other pages that require completing the Account Aggregator first
  const isAAGatedPath = [
    "/dashboard",
    "/insights",
    "/schemes",
    "/health-score",
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`))

  // Protected paths that require authentication
  const isProtectedPath = isAAGatedPath || [
    "/onboarding",
    "/aa",
    "/retrieving",
    "/mock-aa",
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (isProtectedPath && !user) {
    // If user has completed estimation onboarding, allow viewing dashboard / insights / schemes / health-score
    if (isEstimateMode && isAAGatedPath) {
      return supabaseResponse
    }
    // If not authenticated, redirect to /login
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    const fullTarget = request.nextUrl.search ? `${pathname}${request.nextUrl.search}` : pathname
    url.searchParams.set("redirectTo", fullTarget)
    return redirectWithCookies(url)
  }

  // If user is authenticated and trying to access other pages, ensure AA is finished
  if (isAAGatedPath && user) {
    if (isEstimateMode) {
      return supabaseResponse
    }
    const hasAACookie = request.cookies.get("finna_aa_complete")?.value === "true"

    if (!hasAACookie) {
      const { data: profile } = await supabase
        .from("users")
        .select("aa_complete")
        .eq("id", user.id)
        .maybeSingle()

      if (profile?.aa_complete) {
        supabaseResponse.cookies.set("finna_aa_complete", "true", {
          path: "/",
          maxAge: 31536000,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production"
        })
      } else {
        const { data: consent } = await supabase
          .from("aa_consents")
          .select("id")
          .eq("user_id", user.id)
          .in("status", ["APPROVED", "ACTIVE"])
          .limit(1)
          .maybeSingle()

        if (consent) {
          supabaseResponse.cookies.set("finna_aa_complete", "true", {
            path: "/",
            maxAge: 31536000,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
          })
        } else {
          // Account Aggregator not yet completed: gate and route to /aa
          const url = request.nextUrl.clone()
          url.pathname = "/aa"
          url.search = "?new=true"
          return redirectWithCookies(url)
        }
      }
    }
  }

  if (user && pathname === "/login") {
    const target = request.nextUrl.searchParams.get("redirectTo") || request.nextUrl.searchParams.get("next") || "/dashboard"
    const url = request.nextUrl.clone()
    url.pathname = target.split("?")[0]
    const targetSearch = target.includes("?") ? target.split("?")[1] : ""
    url.search = targetSearch
    return redirectWithCookies(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
