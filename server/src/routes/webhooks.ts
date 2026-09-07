import { Router, Request, Response } from "express"
import { supabaseAdmin } from "../services/supabase.js"
import { aaService } from "../services/aa/index.js"

export const webhooksRouter = Router()

// POST /webhooks/setu-aa - Webhook notification receiver from Setu AA
webhooksRouter.post("/setu-aa", async (req: Request, res: Response) => {
  try {
    const payload = req.body
    console.log("Received Setu AA webhook notification:", JSON.stringify(payload))

    // Setu notification contains consent status changes and session notifications
    const consentId = payload?.ConsentStatusNotification?.consentId || payload?.consentId
    const status = payload?.ConsentStatusNotification?.consentStatus || payload?.status

    if (consentId && status) {
      await supabaseAdmin
        .from("consents")
        .update({ status })
        .eq("consent_ref", consentId)

      // If approved or ready, pull data
      if (status === "ACTIVE" || status === "APPROVED" || payload?.DataSessionNotification) {
        try {
          const data = await aaService.fetchFinancialData(consentId)
          console.log(`Successfully fetched AA data for consent ${consentId}: ${data.transactions.length} txns`)
        } catch (fetchErr) {
          console.error("Error auto-fetching financial data on webhook:", fetchErr)
        }
      }
    }

    return res.status(200).json({ status: "SUCCESS", timestamp: new Date().toISOString() })
  } catch (err: any) {
    console.error("Webhook processing error:", err)
    return res.status(500).json({ error: err.message })
  }
})
