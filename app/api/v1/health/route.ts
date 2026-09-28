import { NextResponse } from "next/server"
import { GET as getHealthScore } from "../health-score/route"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get("type") === "score") {
    return getHealthScore()
  }

  return NextResponse.json({
    status: "healthy",
    service: "finna-next-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
}
