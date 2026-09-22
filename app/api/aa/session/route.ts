import { NextResponse } from "next/server"
import { setuAA, SetuConfigurationError } from "@/lib/aa/setu-aa"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { consentId, dateRangeFrom, dateRangeTo } = body

    if (!consentId) {
      return NextResponse.json({ error: "consentId is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let sessionRes: any
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
      throw apiErr
    }

    let record = null
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
