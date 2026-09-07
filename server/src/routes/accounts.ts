import { Router, Response } from "express"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { supabaseAdmin } from "../services/supabase.js"

export const accountsRouter = Router()

// GET /accounts - list bank accounts
accountsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { data: accounts, error } = await supabaseAdmin
      .from("accounts")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!accounts || accounts.length === 0) {
      // Return default connected demo account if user has not synced yet
      return res.json([
        {
          id: "demo-account-1",
          bank_name: "State Bank of India (Demo)",
          account_type: "Savings",
          masked_account: "•••• 2841",
          balance: 42680.50,
          updated_at: new Date().toISOString()
        }
      ])
    }

    return res.json(accounts)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
