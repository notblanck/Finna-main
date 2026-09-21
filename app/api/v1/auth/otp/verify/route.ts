import { NextResponse } from "next/server"
import { otpStore } from "@/lib/otpStore"

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

    // Strictly verify OTP from the store
    const verification = otpStore.verifyOtp(normalizedEmail, trimmedToken)

    if (!verification.success) {
      return NextResponse.json({
        error: verification.error || "Invalid or expired verification code."
      }, { status: 400 })
    }

    const isDemo = normalizedEmail === "rider.demo@finna.ai"
    const user = {
      id: isDemo ? "demo-rider-001" : `user-${Date.now()}`,
      email: normalizedEmail,
      full_name: isDemo ? "Aakash Verma (Gig Partner)" : normalizedEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      preferred_language: "en"
    }

    return NextResponse.json({
      success: true,
      message: "Authentication successful! 2FA verification complete.",
      session: {
        access_token: `finna-jwt-${isDemo ? "demo" : Date.now()}`,
        token_type: "bearer",
        expires_in: 86400
      },
      user
    })
  } catch (err: any) {
    console.error("[Auth Verify] Error processing verification:", err)
    return NextResponse.json({ error: "Authentication failed", message: err.message }, { status: 400 })
  }
}
