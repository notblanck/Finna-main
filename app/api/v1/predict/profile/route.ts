import { NextResponse } from "next/server"
import { computeLocalFallbackProfile, EstimatedFinancialProfile } from "@/lib/data/city-baselines"

const ML_SERVICE_URL = process.env.FINNA_ML_SERVICE_URL || "http://127.0.0.1:8000"
const REQUEST_TIMEOUT_MS = 3500

export async function POST(request: Request) {
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const state = String(body.state || "Tamil Nadu").trim()
  const city = String(body.city || "Chennai").trim()
  const platform = String(body.platform || "delivery").trim().toLowerCase()
  const hours = Number(body.hours) || 45

  // 1. Try calling the Python XGBoost microservice
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state, city, platform, hours }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data: EstimatedFinancialProfile = await response.json()
      return NextResponse.json(data)
    }

    console.warn(`[ML Service] Non-200 response (${response.status}). Falling back to local city baseline.`)
  } catch (err: any) {
    const isAbort = err.name === "AbortError"
    console.warn(`[ML Service] ${isAbort ? "Request timed out" : "Unreachable"}. Falling back instantly to local city averages.`, err?.message || err)
  }

  // 2. Instant resilient fallback: compute deterministic city/state average baseline
  const fallback = computeLocalFallbackProfile(state, city, platform, hours)
  return NextResponse.json(fallback)
}
