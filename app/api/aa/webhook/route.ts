import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
export const preferredRegion = "bom1"
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}))
    console.log("[Next.js AA Webhook] Received notification:", JSON.stringify(payload))

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
    }

    const consentNotification = payload.ConsentStatusNotification || payload.consentStatusNotification
    const dataNotification = payload.DataSessionNotification || payload.dataSessionNotification

    const consentId = consentNotification?.consentId || payload.consentId || payload.id
    const consentStatus = consentNotification?.consentStatus || payload.consentStatus || payload.status

    let supabase: any = null
    try {
      supabase = await createClient()
    } catch (e: any) {
      console.warn("[Next.js AA Webhook] Supabase client init notice:", e.message)
    }

    if (supabase && consentId && consentStatus) {
      try {
        await supabase
          .from("aa_consents")
          .update({
            status: consentStatus,
            updated_at: new Date().toISOString()
          })
          .eq("consent_id", consentId)

        console.log(`[Next.js AA Webhook] Updated consent ${consentId} -> ${consentStatus}`)
      } catch (dbErr: any) {
        console.warn("[Next.js AA Webhook] DB consent update notice:", dbErr.message)
      }
    }

    const sessionId = dataNotification?.sessionId || payload.sessionId
    const sessionStatus = dataNotification?.sessionStatus || payload.sessionStatus

    if (supabase && sessionId && sessionStatus) {
      try {
        await supabase
          .from("aa_data_sessions")
          .update({
            status: sessionStatus,
            updated_at: new Date().toISOString()
          })
          .eq("session_id", sessionId)

        console.log(`[Next.js AA Webhook] Updated session ${sessionId} -> ${sessionStatus}`)
      } catch (dbErr: any) {
        console.warn("[Next.js AA Webhook] DB session update notice:", dbErr.message)
      }
    }

    return NextResponse.json({
      success: true,
      status: "SUCCESS",
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    console.error("[Next.js AA Webhook] Error:", err.message)
    return NextResponse.json({ error: "Webhook processing error", message: err.message }, { status: 500 })
  }
}
