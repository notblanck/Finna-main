import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email || body.phone || "rider.demo@finna.ai"

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${email}. (Demo OTP: 123456)`,
      email,
      mockOtp: "123456"
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process OTP request", message: err.message }, { status: 400 })
  }
}
