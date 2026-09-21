import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const horizon = searchParams.get("horizon") || "7d"

  const values: Record<string, { low: number; exp: number; high: number }> = {
    "1d": { low: 1100, exp: 1450, high: 1800 },
    "7d": { low: 9800, exp: 12400, high: 15200 },
    "30d": { low: 42000, exp: 51200, high: 59800 }
  }

  const selected = values[horizon] || values["7d"]

  return NextResponse.json({
    horizon,
    low_estimate: selected.low,
    expected_estimate: selected.exp,
    high_estimate: selected.high,
    confidence: "high",
    cached: true
  })
}
