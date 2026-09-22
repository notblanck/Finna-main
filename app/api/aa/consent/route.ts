import { NextResponse } from "next/server"
import { setuAA, SetuConfigurationError } from "@/lib/aa/setu-aa"
import { createClient } from "@/lib/supabase/server"
import { proxyToBackend, isCloudflareBlock } from "@/lib/aa/proxy"

export const preferredRegion = "bom1"
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const phone = body.phone || body.phoneNumber || user?.phone || "+919876543210"
    const vpa = body.vpa || (phone ? `${phone.replace(/^\+91/, "")}@setu` : "9876543210@setu")
    const purpose = body.purpose || "Personal Finance Management"
    const redirectUrl = body.redirectUrl || (process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/aa` : undefined)

    let consentRes: any
    try {
      consentRes = await setuAA.createConsent({
        phone,
        vpa,
        fiTypes: body.fiTypes || ["DEPOSIT", "TERM_DEPOSIT", "RECURRING_DEPOSIT"],
        dateRangeFrom: body.dateRangeFrom,
        dateRangeTo: body.dateRangeTo,
        redirectUrl
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

      // Fallback: proxy through Express backend if Setu blocked this IP (403 / Cloudflare WAF)
      if (isCloudflareBlock(apiErr)) {
        console.log("[Next.js AA Consent] Setu WAF block detected, proxying through Express backend...")
        try {
          const proxyRes = await proxyToBackend("/consent", {
            method: "POST",
            body: JSON.stringify({ phone, vpa, purpose, fiTypes: body.fiTypes })
          })
          const proxyJson = await proxyRes.json()
          return NextResponse.json(proxyJson, { status: proxyRes.status })
        } catch (proxyErr: any) {
          console.error("[Next.js AA Consent] Proxy fallback also failed:", proxyErr.message)
          throw apiErr // re-throw original error
        }
      }

      throw apiErr
    }

    const consentId = consentRes.id || consentRes.consentId
    const url = consentRes.redirectUrl || consentRes.url

    // Store in Supabase `aa_consents`
    let record = null
    try {
      const { data, error } = await supabase
        .from("aa_consents")
        .insert({
          user_id: user?.id || null,
          consent_id: consentId,
          status: consentRes.status || "PENDING",
          purpose,
          url,
          txnid: consentRes.consentHandle || consentRes.txnid,
          vpa,
          raw_response: consentRes.raw || null
        })
        .select()
        .single()

      if (!error) {
        record = data
      }
    } catch (dbErr: any) {
      console.warn("[Next.js AA Consent API] DB insert notice:", dbErr.message)
    }

    return NextResponse.json({
      success: true,
      consentId,
      status: consentRes.status || "PENDING",
      url,
      record
    }, { status: 201 })
  } catch (err: any) {
    console.error("[Next.js AA Consent API] Error:", err.message)
    return NextResponse.json({
      error: "Failed to create Setu consent",
      message: err.message
    }, { status: 500 })
  }
}
