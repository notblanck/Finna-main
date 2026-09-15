import { Router, Request, Response } from "express"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { aaService } from "../services/aa/index.js"
import { supabaseAdmin } from "../services/supabase.js"

export const consentRouter = Router()

// GET /consent/mode - return current AA mode configuration (mock vs live Setu)
consentRouter.get("/mode", (req: Request, res: Response) => {
  const useMock = process.env.USE_MOCK_AA !== "false"
  return res.json({
    useMock,
    aaMode: aaService.name,
    timestamp: new Date().toISOString()
  })
})

// POST /consent - create consent request
consentRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.body.userId || "demo-user-12345"
    const phone = req.body.phone || req.user?.phone || "+919876543210"

    const consentRes = await aaService.createConsent({
      userId,
      phoneNumber: phone,
      vpa: req.body.vpa
    })

    // Store in Supabase consents table if available
    let record: any = null
    try {
      const { data, error } = await supabaseAdmin.from("consents").insert({
        user_id: userId,
        consent_ref: consentRes.consentId,
        status: consentRes.status,
        expires_at: consentRes.expiresAt
      }).select().single()

      if (!error) record = data
    } catch (dbErr) {
      console.warn("[Consent Route] Supabase record insertion warning:", dbErr)
    }

    return res.status(201).json({
      consentId: consentRes.consentId,
      status: consentRes.status,
      url: consentRes.url,
      record
    })
  } catch (err: any) {
    console.error("[Consent Route] Error creating consent:", err.message)
    return res.status(500).json({ error: err.message })
  }
})

// GET /consent/:id - get consent status
consentRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consentId = req.params.id
    const statusRes = await aaService.getConsentStatus(consentId)

    // Update in Supabase if available
    try {
      await supabaseAdmin
        .from("consents")
        .update({ status: statusRes.status })
        .eq("consent_ref", consentId)
    } catch (dbErr) {
      // Non-blocking warning for offline DB
      console.warn("[Consent Route] Supabase update warning:", dbErr)
    }

    // If status is APPROVED, populate accounts & transactions
    if (statusRes.status === "APPROVED" || (statusRes.status as string) === "ACTIVE") {
      try {
        const data = await aaService.fetchFinancialData(consentId)
        const userId = req.user?.id || "demo-user-12345"

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
      } catch (dataErr: any) {
        console.warn("[Consent Route] Non-blocking warning during data session fetch:", dataErr.message)
      }
    }

    return res.json(statusRes)
  } catch (err: any) {
    console.error("[Consent Route] Error getting consent status:", err.message)
    return res.status(500).json({ error: err.message })
  }
})

// POST /consent/:id/fetch-data - explicitly trigger financial data session fetch
consentRouter.post("/:id/fetch-data", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consentId = req.params.id
    const data = await aaService.fetchFinancialData(consentId)
    const userId = req.user?.id || "demo-user-12345"

    try {
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
    } catch (syncErr) {
      console.warn("[Consent Route] Data sync to Supabase warning:", syncErr)
    }

    return res.json({
      success: true,
      consentId,
      accountsCount: data.accounts.length,
      transactionsCount: data.transactions.length,
      data
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// POST /consent/:id/revoke - revoke consent
consentRouter.post("/:id/revoke", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consentId = req.params.id
    await aaService.revokeConsent(consentId)

    try {
      await supabaseAdmin
        .from("consents")
        .update({ status: "REVOKED" })
        .eq("consent_ref", consentId)
    } catch (dbErr) {
      console.warn("[Consent Route] Supabase revoke update warning:", dbErr)
    }

    return res.json({ message: "Consent successfully revoked", consentId, status: "REVOKED" })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
