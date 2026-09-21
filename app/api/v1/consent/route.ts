import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const consentId = `CONSENT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    return NextResponse.json({
      consentId,
      status: "PENDING",
      url: `/mock-aa/authorize?consentId=${consentId}`
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create consent", message: err.message }, { status: 500 })
  }
}
