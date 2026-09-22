import { NextResponse } from "next/server"
import { setuAA, SetuConfigurationError } from "@/lib/aa/setu-aa"
import { createClient } from "@/lib/supabase/server"
import { proxyToBackend, isCloudflareBlock } from "@/lib/aa/proxy"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    let statusRes: any
    try {
      statusRes = await setuAA.getConsentStatus(id)
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
        console.log("[Next.js AA Consent Status] Setu WAF block detected, proxying through Express backend...")
        try {
          const proxyRes = await proxyToBackend(`/consent/${id}/status`)
          const proxyJson = await proxyRes.json()
          return NextResponse.json(proxyJson, { status: proxyRes.status })
        } catch (proxyErr: any) {
          console.error("[Next.js AA Consent Status] Proxy fallback also failed:", proxyErr.message)
          throw apiErr
        }
      }

      throw apiErr
    }

    // Update in Supabase
    try {
      const supabase = await createClient()
      await supabase
        .from("aa_consents")
        .update({
          status: statusRes.status,
          updated_at: new Date().toISOString()
        })
        .eq("consent_id", id)
    } catch (dbErr: any) {
      console.warn("[Next.js AA Consent Status API] DB update notice:", dbErr.message)
    }

    return NextResponse.json({
      success: true,
      consentId: id,
      status: statusRes.status,
      url: statusRes.redirectUrl || statusRes.url,
      expiresAt: statusRes.expiresAt,
      raw: statusRes.raw
    })
  } catch (err: any) {
    console.error("[Next.js AA Consent Status API] Error:", err.message)
    return NextResponse.json({
      error: "Failed to fetch consent status",
      message: err.message
    }, { status: 500 })
  }
}
