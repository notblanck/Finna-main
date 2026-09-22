import { Router, Response } from "express"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { aaService } from "../services/aa/index.js"
import { supabaseAdmin } from "../services/supabase.js"
import { SetuConfigurationError } from "../services/aa/setu-aa.js"

export const aaRouter = Router()

/**
 * POST /api/aa/consent
 * Creates a consent request via Setu's Create Consent API
 * Stores consentCollectionId + txnid in Supabase `aa_consents` table
 * Returns the hosted consent webview URL to the frontend
 */
aaRouter.post("/consent", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.body.userId || null
    const phone = req.body.phone || req.body.phoneNumber || req.user?.phone || "+919876543210"
    const vpa = req.body.vpa || (phone ? `${phone.replace(/^\+91/, "")}@setu` : "9876543210@setu")
    const purpose = req.body.purpose || "Personal Finance Management"

    const consentRes = await aaService.createConsent({
      userId: userId || undefined,
      phoneNumber: phone,
      vpa,
      purpose
    })

    // Store in Supabase `aa_consents`
    let dbRecord = null
    try {
      const { data, error } = await supabaseAdmin
        .from("aa_consents")
        .insert({
          user_id: userId,
          consent_id: consentRes.consentId,
          status: consentRes.status || "PENDING",
          purpose,
          url: consentRes.url,
          txnid: consentRes.txnid,
          vpa,
          raw_response: consentRes.raw || null
        })
        .select()
        .single()

      if (error) {
        console.warn("[AA Router] Note on aa_consents insert:", error.message)
      } else {
        dbRecord = data
      }
    } catch (dbErr: any) {
      console.warn("[AA Router] DB error inserting aa_consents:", dbErr.message)
    }

    return res.status(201).json({
      success: true,
      consentId: consentRes.consentId,
      status: consentRes.status,
      url: consentRes.url,
      txnid: consentRes.txnid,
      record: dbRecord
    })
  } catch (err: any) {
    console.error("[AA Router] POST /api/aa/consent error:", err.message)
    if (err instanceof SetuConfigurationError) {
      return res.status(503).json({
        error: "Setu Configuration Error",
        message: err.message,
        docs: "https://bridge.setu.co"
      })
    }
    return res.status(500).json({ error: "Failed to create consent", message: err.message })
  }
})

/**
 * GET /api/aa/consent/:id/status
 * Checks consent status via Setu's status API, updates row in `aa_consents`
 */
aaRouter.get("/consent/:id/status", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consentId = req.params.id
    const statusRes = await aaService.getConsentStatus(consentId)

    // Update in Supabase `aa_consents`
    try {
      await supabaseAdmin
        .from("aa_consents")
        .update({
          status: statusRes.status,
          updated_at: new Date().toISOString()
        })
        .eq("consent_id", consentId)
    } catch (dbErr: any) {
      console.warn("[AA Router] DB error updating aa_consents:", dbErr.message)
    }

    return res.json({
      success: true,
      consentId,
      status: statusRes.status,
      url: statusRes.url,
      expiresAt: statusRes.expiresAt,
      raw: statusRes.raw
    })
  } catch (err: any) {
    console.error("[AA Router] GET /api/aa/consent/:id/status error:", err.message)
    if (err instanceof SetuConfigurationError) {
      return res.status(503).json({
        error: "Setu Configuration Error",
        message: err.message,
        docs: "https://bridge.setu.co"
      })
    }
    return res.status(500).json({ error: "Failed to get consent status", message: err.message })
  }
})

/**
 * POST /api/aa/webhook
 * Receives Setu's async notifications (consent approved/rejected/data ready),
 * verifies payload, and updates `aa_consents` and `aa_data_sessions`
 */
aaRouter.post("/webhook", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body
    console.log("[AA Webhook] Received notification:", JSON.stringify(payload))

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Invalid webhook payload" })
    }

    // Extract consent status notification
    const consentNotification = payload.ConsentStatusNotification || payload.consentStatusNotification
    const dataNotification = payload.DataSessionNotification || payload.dataSessionNotification

    const consentId = consentNotification?.consentId || payload.consentId || payload.id
    const consentStatus = consentNotification?.consentStatus || payload.consentStatus || payload.status

    if (consentId && consentStatus) {
      await supabaseAdmin
        .from("aa_consents")
        .update({
          status: consentStatus,
          updated_at: new Date().toISOString()
        })
        .eq("consent_id", consentId)

      console.log(`[AA Webhook] Updated consent ${consentId} status to ${consentStatus}`)
    }

    // Extract data session notification if present
    const sessionId = dataNotification?.sessionId || payload.sessionId
    const sessionStatus = dataNotification?.sessionStatus || payload.sessionStatus

    if (sessionId && sessionStatus) {
      await supabaseAdmin
        .from("aa_data_sessions")
        .update({
          status: sessionStatus,
          updated_at: new Date().toISOString()
        })
        .eq("session_id", sessionId)

      console.log(`[AA Webhook] Updated session ${sessionId} status to ${sessionStatus}`)
    }

    return res.status(200).json({
      success: true,
      status: "SUCCESS",
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    console.error("[AA Webhook] Processing error:", err.message)
    return res.status(500).json({ error: "Webhook processing error", message: err.message })
  }
})

/**
 * POST /api/aa/session
 * Once consent is approved, creates a data session (FI data request) via Setu's session API
 * Stores session_id in Supabase `aa_data_sessions` table
 */
aaRouter.post("/session", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { consentId, dateRangeFrom, dateRangeTo } = req.body
    if (!consentId) {
      return res.status(400).json({ error: "consentId is required" })
    }

    const userId = req.user?.id || req.body.userId || null

    const sessionRes = await aaService.createDataSession(consentId, {
      from: dateRangeFrom,
      to: dateRangeTo
    })

    // Store in Supabase `aa_data_sessions`
    let dbRecord = null
    try {
      const { data, error } = await supabaseAdmin
        .from("aa_data_sessions")
        .insert({
          user_id: userId,
          consent_id: consentId,
          session_id: sessionRes.sessionId,
          status: sessionRes.status || "PENDING",
          raw_payload: sessionRes.raw || null
        })
        .select()
        .single()

      if (error) {
        console.warn("[AA Router] Note on aa_data_sessions insert:", error.message)
      } else {
        dbRecord = data
      }
    } catch (dbErr: any) {
      console.warn("[AA Router] DB error inserting aa_data_sessions:", dbErr.message)
    }

    return res.status(201).json({
      success: true,
      sessionId: sessionRes.sessionId,
      status: sessionRes.status,
      consentId,
      record: dbRecord
    })
  } catch (err: any) {
    console.error("[AA Router] POST /api/aa/session error:", err.message)
    if (err instanceof SetuConfigurationError) {
      return res.status(503).json({
        error: "Setu Configuration Error",
        message: err.message,
        docs: "https://bridge.setu.co"
      })
    }
    return res.status(500).json({ error: "Failed to create data session", message: err.message })
  }
})

/**
 * GET /api/aa/session/:id
 * Fetches the session data from Setu, parses returned FI data (accounts + transactions),
 * and upserts normalized records into existing income/transaction tables:
 * - public.accounts
 * - public.transactions
 * - public.income_entries (for gig platform payouts)
 * - public.expenses (for fuel / vehicle EMI debits)
 */
aaRouter.get("/session/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.params.id
    const userId = req.user?.id || req.query.userId?.toString() || null

    // Fetch and decrypt data from Setu
    const fiData = await aaService.fetchSessionData(sessionId)

    // Update `aa_data_sessions` table
    try {
      await supabaseAdmin
        .from("aa_data_sessions")
        .update({
          status: "COMPLETED",
          fetched_at: new Date().toISOString(),
          raw_payload: fiData.raw || null
        })
        .eq("session_id", sessionId)
    } catch (dbErr: any) {
      console.warn("[AA Router] DB error updating aa_data_sessions:", dbErr.message)
    }

    const upsertedAccounts: any[] = []
    const upsertedTransactions: any[] = []
    const syncedIncomeEntries: any[] = []
    const syncedExpenses: any[] = []

    if (userId) {
      // 1. Upsert Accounts into `public.accounts`
      for (const acc of fiData.accounts) {
        try {
          const { data: accData, error: accErr } = await supabaseAdmin
            .from("accounts")
            .upsert({
              user_id: userId,
              bank_name: acc.bank,
              account_type: acc.accountType,
              masked_account: acc.maskedAccount,
              balance: acc.balance,
              fip_id: acc.fipId || null,
              updated_at: new Date().toISOString()
            }, { onConflict: "user_id, masked_account" as any })
            .select()
            .single()

          if (accData) {
            upsertedAccounts.push(accData)
            const accountId = accData.id

            // 2. Upsert Transactions into `public.transactions`
            for (const txn of fiData.transactions) {
              const { data: txnData, error: txnErr } = await supabaseAdmin
                .from("transactions")
                .insert({
                  user_id: userId,
                  account_id: accountId,
                  txn_date: txn.date,
                  amount: txn.amount,
                  type: txn.type,
                  description: txn.description,
                  category: txn.category,
                  platform: txn.platform || null,
                  balance_after: txn.balanceAfter || null
                })
                .select()
                .single()

              if (txnData) {
                upsertedTransactions.push(txnData)

                // 3. Map Gig Payouts to `public.income_entries`
                if (txn.type === "CREDIT" && txn.platform) {
                  const { data: incData } = await supabaseAdmin
                    .from("income_entries")
                    .insert({
                      user_id: userId,
                      platform: txn.platform,
                      date: txn.date,
                      gross_amount: txn.amount,
                      source: "aa",
                      notes: `Reconciled via Setu AA from ${acc.bank} (${acc.maskedAccount})`
                    })
                    .select()
                    .single()

                  if (incData) syncedIncomeEntries.push(incData)
                }

                // 4. Map Fuel / EMI to `public.expenses`
                if (txn.type === "DEBIT" && (txn.category === "Fuel" || txn.category === "Vehicle EMI")) {
                  const { data: expData } = await supabaseAdmin
                    .from("expenses")
                    .insert({
                      user_id: userId,
                      date: txn.date,
                      amount: txn.amount,
                      category: txn.category,
                      source: "aa",
                      is_business_expense: true,
                      notes: `Imported via Setu AA (${txn.description})`
                    })
                    .select()
                    .single()

                  if (expData) syncedExpenses.push(expData)
                }
              }
            }
          }
        } catch (syncErr: any) {
          console.warn("[AA Router] Sync iteration error:", syncErr.message)
        }
      }
    }

    return res.json({
      success: true,
      sessionId,
      accounts: fiData.accounts,
      transactions: fiData.transactions,
      dbSync: {
        userId,
        accountsCount: upsertedAccounts.length,
        transactionsCount: upsertedTransactions.length,
        incomeEntriesCount: syncedIncomeEntries.length,
        expensesCount: syncedExpenses.length
      }
    })
  } catch (err: any) {
    console.error("[AA Router] GET /api/aa/session/:id error:", err.message)
    if (err instanceof SetuConfigurationError) {
      return res.status(503).json({
        error: "Setu Configuration Error",
        message: err.message,
        docs: "https://bridge.setu.co"
      })
    }
    return res.status(500).json({ error: "Failed to fetch session data", message: err.message })
  }
})
