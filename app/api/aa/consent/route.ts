import { NextResponse } from "next/server"
import { setuAA, SetuConfigurationError } from "@/lib/aa/setu-aa"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const phone = body.phone || body.phoneNumber || user?.phone || "+919876543210"
    const vpa = body.vpa || (phone ? `${phone.replace(/^\+91/, "")}@setu` : "9876543210@setu")
    const purpose = body.purpose || "Personal Finance Management"

    let consentRes: any
    try {
      consentRes = await setuAA.createConsent({
        phone,
        vpa,
        fiTypes: body.fiTypes || ["DEPOSIT", "TERM_DEPOSIT", "RECURRING_DEPOSIT"],
        dateRangeFrom: body.dateRangeFrom,
        dateRangeTo: body.dateRangeTo
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
