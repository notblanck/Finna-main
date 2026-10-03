import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? searchParams.get("redirectTo") ?? "/dashboard"
  const oauthError = searchParams.get("error_description") || searchParams.get("error")

  if (oauthError) {
    console.error("[Auth Callback] OAuth error from provider:", oauthError)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(oauthError)}`)
  }

  const cookieStore = await cookies()
  const supabase = await createClient()

  let user = null

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.user) {
      user = data.user
    } else if (error) {
      console.warn("[Auth Callback] Code exchange notice:", error.message)
    }
  }

  // If code exchange did not return a user (e.g. state already consumed on page refresh), check existing session
  if (!user) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) {
      user = currentUser
    }
  }

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=Could%20not%20authenticate`)
  }

  // Ensure user profile is present in public.users
  const { data: profile } = await supabase
    .from("users")
    .select("id, onboarding_complete, aa_complete")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    try {
      await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Gig Partner",
        preferred_language: "en",
        language: "en",
        currency: "INR",
        onboarding_complete: false,
        aa_complete: false,
      })
    } catch (dbErr) {
      console.warn("[Auth Callback] User profile bootstrap notice:", dbErr)
    }
  }

  let finalDestination = next

  // If user came specifically to review consent, forward directly to /aa
  if (next && (next.startsWith("/aa") || next.includes("/aa"))) {
    finalDestination = next
  } else if (profile && !profile.onboarding_complete) {
    finalDestination = "/onboarding"
  } else if (profile && !profile.aa_complete) {
    finalDestination = "/aa?new=true"
  }

  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"
  
  let targetOrigin = origin
  if (!isLocalEnv) {
    if (forwardedHost === "finnastudio.me" || forwardedHost === "www.finnastudio.me") {
      targetOrigin = "https://www.finnastudio.me"
    } else if (forwardedHost) {
      targetOrigin = `https://${forwardedHost}`
    } else if (origin.includes("finnastudio.me")) {
      targetOrigin = "https://www.finnastudio.me"
    }
  }

  const targetUrl = `${targetOrigin}${finalDestination}`
  const redirectResponse = NextResponse.redirect(targetUrl)

  // Explicitly copy all cookies with correct path, SameSite, and Secure attributes
  cookieStore.getAll().forEach((c) => {
    redirectResponse.cookies.set(c.name, c.value, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  })

  // If user has completed Account Aggregator, ensure finna_aa_complete cookie is set
  if (profile?.aa_complete) {
    redirectResponse.cookies.set("finna_aa_complete", "true", {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    })
  }

  return redirectResponse
}
