import { NextResponse } from "next/server"
import { setuAA, SetuConfigurationError } from "@/lib/aa/setu-aa"
import { mockAA } from "@/lib/aa/mock-aa"
import { createClient } from "@/lib/supabase/server"
import { proxyToBackend, isCloudflareBlock } from "@/lib/aa/proxy"
export const preferredRegion = "bom1"
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { consentId, dateRangeFrom, dateRangeTo } = body

    if (!consentId) {
      return NextResponse.json({ error: "consentId is required" }, { status: 400 })
    }

    let supabase: any = null
    let user: any = null
    try {
      supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch (authErr: any) {
      console.warn("[Next.js AA Session API] Supabase auth notice:", authErr.message)
    }

    let sessionRes: any
    if (consentId.startsWith("AA-SETU-DEMO-") || consentId.startsWith("consent-mock-") || process.env.USE_MOCK_AA === "true") {
      sessionRes = await mockAA.requestFIData(consentId)
    } else {
      try {
        sessionRes = await setuAA.createDataSession(consentId, {
          from: dateRangeFrom,
          to: dateRangeTo
        })
      } catch (apiErr: any) {
        if (apiErr instanceof SetuConfigurationError || apiErr.name === "SetuConfigurationError") {
          return NextResponse.json({
            error: "Setu Configuration Error",
            message: apiErr.message,
            missingConfig: true,
            docs: "https://bridge.setu.co"
          }, { status: 503 })
        }

        // Fallback: proxy through Express backend if Setu blocked this IP
        if (isCloudflareBlock(apiErr)) {
          console.log("[Next.js AA Session] Setu WAF block detected, proxying through Express backend...")
          try {
            const proxyRes = await proxyToBackend("/session", {
              method: "POST",
              body: JSON.stringify({ consentId, dateRangeFrom, dateRangeTo })
            })
            const proxyJson = await proxyRes.json()
            return NextResponse.json(proxyJson, { status: proxyRes.status })
          } catch (proxyErr: any) {
            console.error("[Next.js AA Session] Proxy fallback also failed:", proxyErr.message)
            throw apiErr
          }
        }

        throw apiErr
      }
    }

    let record = null
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("aa_data_sessions")
          .insert({
            user_id: user?.id || null,
            consent_id: consentId,
            session_id: sessionRes.sessionId,
            status: sessionRes.status || "PENDING",
            raw_payload: sessionRes.raw || null
          })
          .select()
          .single()

        if (!error) {
          record = data
        }
      } catch (dbErr: any) {
        console.warn("[Next.js AA Session API] DB insert notice:", dbErr.message)
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionRes.sessionId,
      status: sessionRes.status,
      consentId,
      record
    }, { status: 201 })
  } catch (err: any) {
    console.error("[Next.js AA Session API] Error:", err.message)
    return NextResponse.json({
      error: "Failed to create Setu data session",
      message: err.message
    }, { status: 500 })
  }
}
