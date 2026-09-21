import { NextResponse } from "next/server"
import { otpStore } from "@/lib/otpStore"
import { sendOtpEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email || body.phone

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    
    // Basic email validation
    if (!normalizedEmail.includes("@") || !normalizedEmail.includes(".")) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    // Generate 6-digit OTP
    const code = otpStore.createOtp(normalizedEmail)

    // Handle dedicated demo account
    if (normalizedEmail === "rider.demo@finna.ai") {
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully to demo account. (Demo OTP: 123456)",
        email: normalizedEmail,
        isDemo: true
      })
    }

    // Send actual OTP email
    let emailResult
    try {
      emailResult = await sendOtpEmail({
        email: normalizedEmail,
        otp: code
      })
    } catch (mailErr: any) {
      console.error("[Auth Request] Failed to dispatch email:", mailErr)
      return NextResponse.json({
        error: "Failed to send verification email. Please verify your email address or SMTP configuration.",
        details: mailErr.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}. Please check your inbox and spam folder.`,
      email: normalizedEmail,
      previewUrl: emailResult.previewUrl
    })
  } catch (err: any) {
    console.error("[Auth Request] Error processing request:", err)
    return NextResponse.json({ error: "Failed to process OTP request", message: err.message }, { status: 400 })
  }
}
