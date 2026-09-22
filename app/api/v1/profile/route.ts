import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/v1/profile - get user profile and linked platforms
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Fallback default demo profile if unauthenticated
      return NextResponse.json({
        user: {
          id: "demo-user",
          full_name: "Arun Kumar",
          phone: "+91 98765 43210",
          city: "Chennai",
          state: "Tamil Nadu",
          preferred_language: "en",
          onboarding_complete: true,
        },
        linked_platforms: [
          { platform: "uber", is_primary: true, avg_monthly_earning: 18000 },
          { platform: "swiggy", is_primary: false, avg_monthly_earning: 14000 }
        ],
        active_consent: {
          consent_ref: "CONSENT-DEMO2026",
          status: "APPROVED",
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      })
    }

    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    const { data: platforms } = await supabase
      .from("user_platforms")
      .select("*")
      .eq("user_id", user.id)

    const { data: consent } = await supabase
      .from("consents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      user: userProfile || {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "Gig Partner",
        preferred_language: "en",
        onboarding_complete: false,
      },
      linked_platforms: platforms || [],
      active_consent: consent || null,
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
