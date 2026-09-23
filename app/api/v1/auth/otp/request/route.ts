import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email || body.phone

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    
    // Validate email format
    if (!normalizedEmail.includes("@") || !normalizedEmail.includes(".")) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    // Demo account special bypass if explicitly testing rider.demo@finna.ai
    if (normalizedEmail === "rider.demo@finna.ai") {
      return NextResponse.json({
        success: true,
        message: "Demo account OTP ready (Demo OTP: 123456)",
        email: normalizedEmail,
        isDemo: true
      })
    }

    // Call Supabase Auth OTP service to actually dispatch the email
    const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: normalizedEmail,
        create_user: true
      })
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      console.error("[Supabase OTP Error]", data)
      const errorMsg = data.msg || data.error_description || data.message || "Failed to send verification email"
      return NextResponse.json({ error: errorMsg }, { status: res.status })
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}. Please check your inbox and spam folder.`,
      email: normalizedEmail
    })
  } catch (err: any) {
    console.error("[Auth Request Error]", err)
    return NextResponse.json({ error: "Failed to process OTP request", message: err.message }, { status: 500 })
  }
}
