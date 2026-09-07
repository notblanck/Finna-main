import { Router, Response } from "express"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { aaService } from "../services/aa/index.js"
import { supabaseAdmin } from "../services/supabase.js"

export const consentRouter = Router()

// POST /consent - create consent request
consentRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const phone = req.user!.phone || req.body.phone || "+919876543210"

    const consentRes = await aaService.createConsent({
      userId,
      phoneNumber: phone,
      vpa: req.body.vpa
    })

    // Store in Supabase consents table
    const { data, error } = await supabaseAdmin.from("consents").insert({
      user_id: userId,
      consent_ref: consentRes.consentId,
      status: consentRes.status,
      expires_at: consentRes.expiresAt
    }).select().single()

    if (error) {
      console.error("Error storing consent in DB:", error)
    }

    return res.status(201).json({
      consentId: consentRes.consentId,
      status: consentRes.status,
      url: consentRes.url,
      record: data
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// GET /consent/:id - get consent status
consentRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consentId = req.params.id
    const statusRes = await aaService.getConsentStatus(consentId)

    // Update in Supabase
    await supabaseAdmin
      .from("consents")
      .update({ status: statusRes.status })
      .eq("consent_ref", consentId)

    // If status is APPROVED, populate accounts & transactions
    if (statusRes.status === "APPROVED") {
      const data = await aaService.fetchFinancialData(consentId)
      const userId = req.user!.id

      // Sync accounts
      for (const acc of data.accounts) {
        const { data: accData } = await supabaseAdmin.from("accounts").upsert({
          user_id: userId,
          bank_name: acc.bank,
          account_type: acc.accountType,
          masked_account: acc.maskedAccount,
          balance: acc.balance,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id, masked_account" as any }).select().single()

        const accountId = accData?.id

        // Sync transactions
        if (accountId && data.transactions.length > 0) {
          const rows = data.transactions.map((t) => ({
            user_id: userId,
            account_id: accountId,
            txn_date: t.date,
            description: t.description,
            amount: t.amount,
            type: t.type,
            category: t.category,
            platform: t.platform || null
          }))

          await supabaseAdmin.from("transactions").upsert(rows as any)
        }
      }
    }

    return res.json(statusRes)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// POST /consent/:id/revoke - revoke consent
consentRouter.post("/:id/revoke", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consentId = req.params.id
    await aaService.revokeConsent(consentId)

    await supabaseAdmin
      .from("consents")
      .update({ status: "REVOKED" })
      .eq("consent_ref", consentId)

    return res.json({ message: "Consent successfully revoked", consentId, status: "REVOKED" })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
