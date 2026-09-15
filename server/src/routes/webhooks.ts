import { Router, Request, Response } from "express"
import { supabaseAdmin } from "../services/supabase.js"
import { aaService } from "../services/aa/index.js"

export const webhooksRouter = Router()

// POST /webhooks/setu-aa - Webhook notification receiver from Setu AA
webhooksRouter.post("/setu-aa", async (req: Request, res: Response) => {
  try {
    const payload = req.body
    console.log("[Setu Webhook] Received notification:", JSON.stringify(payload))

    // Setu notification contains consent status changes and session notifications
    const consentId =
      payload?.ConsentStatusNotification?.consentId ||
      payload?.DataSessionNotification?.consentId ||
      payload?.consentId ||
      payload?.id

    const rawStatus =
      payload?.ConsentStatusNotification?.consentStatus ||
      payload?.DataSessionNotification?.sessionStatus ||
      payload?.status

    const status = rawStatus ? (rawStatus === "ACTIVE" ? "APPROVED" : rawStatus) : null

    if (consentId && status) {
      try {
        await supabaseAdmin
          .from("consents")
          .update({ status })
          .eq("consent_ref", consentId)
      } catch (dbErr) {
        console.warn("[Setu Webhook] Supabase consent update warning:", dbErr)
      }

      // If approved or session ready, pull and sync data
      if (status === "APPROVED" || status === "COMPLETED" || payload?.DataSessionNotification) {
        try {
          const data = await aaService.fetchFinancialData(consentId)
          console.log(`[Setu Webhook] Successfully fetched AA data for consent ${consentId}: ${data.transactions.length} txns`)
        } catch (fetchErr: any) {
          console.error("[Setu Webhook] Error auto-fetching financial data on webhook:", fetchErr.message)
        }
      }
    }

    return res.status(200).json({ status: "SUCCESS", timestamp: new Date().toISOString() })
  } catch (err: any) {
    console.error("[Setu Webhook] Webhook processing error:", err)
    return res.status(500).json({ error: err.message })
  }
})

