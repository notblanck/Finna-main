import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email || "rider.demo@finna.ai"
    const token = body.token || body.otp || "123456"

    const isDemo = email.includes("demo") || token === "123456"
    const user = {
      id: isDemo ? "demo-rider-001" : `user-${Date.now()}`,
      email,
      full_name: isDemo ? "Aakash Verma (Gig Partner)" : email.split("@")[0],
      preferred_language: "en"
    }

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      session: {
        access_token: `finna-${isDemo ? "demo" : "jwt"}-${Date.now()}`,
        token_type: "bearer",
        expires_in: 86400
      },
      user
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Authentication failed", message: err.message }, { status: 400 })
  }
}
