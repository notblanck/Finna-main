import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Bootstrap user profile if not present
      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_complete")
        .eq("id", data.user.id)
        .single()

      if (!profile) {
        await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Gig Partner",
          preferred_language: "en",
          onboarding_complete: false,
        })
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      if (!profile.onboarding_complete) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page or login with error instruction
  return NextResponse.redirect(`${origin}/login?error=Could%20not%20authenticate`)
}
