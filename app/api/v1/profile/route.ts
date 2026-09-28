import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/v1/profile - get user profile and linked platforms
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    const { data: platforms } = await supabase
      .from("user_platforms")
      .select("*")
      .eq("user_id", user.id)

    // Check aa_consents first (Setu real flow), fallback to consents table
    let activeConsent: any = null
    const { data: aaConsent } = await supabase
      .from("aa_consents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (aaConsent) {
      activeConsent = {
        consent_ref: aaConsent.consent_id,
        status: aaConsent.status,
        expires_at: aaConsent.updated_at,
        provider: "setu",
        url: aaConsent.url
      }
    } else {
      const { data: consent } = await supabase
        .from("consents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (consent) {
        activeConsent = consent
      }
    }

    return NextResponse.json({
      user: userProfile || {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "Gig Partner",
        preferred_language: "en",
        onboarding_complete: false,
      },
      linked_platforms: platforms || [],
      active_consent: activeConsent,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/v1/profile - update user profile details
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (body.full_name) updates.full_name = body.full_name
    if (body.phone) updates.phone = body.phone
    if (body.preferred_language) updates.preferred_language = body.preferred_language
    if (body.city) updates.city = body.city
    if (body.state) updates.state = body.state
    if (body.vehicle_type) updates.vehicle_type = body.vehicle_type

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
