import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.SUPABASE_URL || "https://hszljstojfizjehqkhzk.supabase.co"
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzemxqc3RvamZpemplaHFraHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzEyMjAsImV4cCI6MjEwMzk0NzIyMH0.XUcYD0M5zLV0LeGNBtP8YbREipS6sY0AEQg0a10sPDA"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email || body.phone
    const token = body.token || body.otp

    if (!email || !token) {
      return NextResponse.json({
        error: "Both email address and 6-digit OTP code are required"
      }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const trimmedToken = String(token).trim()

    // Dedicated demo account
    if (normalizedEmail === "rider.demo@finna.ai" && trimmedToken === "123456") {
      const demoUser = {
        id: "demo-rider-001",
        email: normalizedEmail,
        full_name: "Aakash Verma (Gig Partner)",
        preferred_language: "en"
      }
      return NextResponse.json({
        success: true,
        message: "Authentication successful",
        session: {
          access_token: "finna-demo-token-12345",
          token_type: "bearer",
          expires_in: 86400
        },
        user: demoUser
      })
    }

    // Call Supabase Auth OTP verification
    const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "email",
        email: normalizedEmail,
        token: trimmedToken
      })
    })

    const data = await res.json()

    if (!res.ok) {
      console.error("[Supabase Verify Error]", data)
      const errorMsg = data.msg || data.error_description || "Invalid or expired verification code."
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const authUser = data.user || {}
    const user = {
      id: authUser.id || `user-${Date.now()}`,
      email: normalizedEmail,
      full_name: authUser.user_metadata?.full_name || normalizedEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      preferred_language: authUser.user_metadata?.preferred_language || "en"
    }

    return NextResponse.json({
      success: true,
      message: "Authentication successful! 2FA verification complete.",
      session: data.session || {
        access_token: data.access_token || `finna-jwt-${Date.now()}`,
        token_type: "bearer",
        expires_in: 86400
      },
      user
    })
  } catch (err: any) {
    console.error("[Auth Verify Error]", err)
    return NextResponse.json({ error: "Authentication failed", message: err.message }, { status: 400 })
  }
}
