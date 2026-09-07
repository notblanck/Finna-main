import { Router, Response } from "express"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { supabaseAdmin } from "../services/supabase.js"

export const safeToSpendRouter = Router()

// GET /safe-to-spend - deterministic calculation per TRD §5.3
safeToSpendRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id

    // 1. Current balance from accounts
    const { data: accounts } = await supabaseAdmin
      .from("accounts")
      .select("balance")
      .eq("user_id", userId)

    const currentBalance = accounts && accounts.length > 0
      ? accounts.reduce((sum, a) => sum + Number(a.balance), 0)
      : 13700.0 // Default demo balance

    // 2. Expected income today (conservative low estimate for 1d horizon)
    const { data: pred } = await supabaseAdmin
      .from("income_predictions")
      .select("low_estimate, expected_estimate")
      .eq("user_id", userId)
      .eq("horizon", "1d")
      .order("generated_at", { ascending: false })
      .limit(1)
      .single()

    const expectedIncomeToday = pred ? Number(pred.low_estimate) : 750.0

    // 3. Upcoming fixed obligations (recurring bills due in next 7 days: Rent, EMI, Insurance)
    const { data: recurringTxns } = await supabaseAdmin
      .from("transactions")
      .select("amount, category, description")
      .eq("user_id", userId)
      .in("category", ["Rent", "EMI", "Insurance"])

    // Pro-rate upcoming commitments over daily budget buffer
    const monthlyFixed = recurringTxns && recurringTxns.length > 0
      ? recurringTxns.reduce((sum, t) => sum + Number(t.amount), 0)
      : (9000 + 2400 + 650) // Rent (9k) + Bike EMI (2.4k) + Insurance (650) = 12,050 / mo

    // Daily reserve needed for upcoming fixed commitments
    const dailyObligationReserve = Math.round(monthlyFixed / 30)

    // 4. Active savings rule reserve (e.g. 10% of expected daily income)
    const { data: savingsRules } = await supabaseAdmin
      .from("savings_rules")
      .select("rule_type, value")
      .eq("user_id", userId)

    let savingsRate = 0.10 // default 10%
    if (savingsRules && savingsRules.length > 0) {
      const pctRule = savingsRules.find(r => r.rule_type === "percentage")
      if (pctRule) savingsRate = Number(pctRule.value) / 100
    }
    const savingsRuleReserve = Math.round(expectedIncomeToday * savingsRate)

    // 5. Emergency buffer floor (e.g. ₹1,500 minimum un-spendable liquidity)
    const emergencyBufferFloor = 1500.0

    // Compute safe_to_spend_today
    const rawSafeToSpend = (currentBalance / 15) // Spread available liquid cash over 15-day window
      + (expectedIncomeToday)
      - dailyObligationReserve
      - savingsRuleReserve

    const safeToSpendToday = Math.max(250.0, Math.round(rawSafeToSpend))

    return res.json({
      safe_to_spend_today: safeToSpendToday,
      breakdown: {
        current_balance: Math.round(currentBalance),
        expected_income_today_conservative: Math.round(expectedIncomeToday),
        daily_fixed_obligation_reserve: dailyObligationReserve,
        active_savings_reserve: savingsRuleReserve,
        emergency_buffer_floor: emergencyBufferFloor
      },
      formula: "current_balance_allocated + expected_income_today(low) - obligations_reserve - savings_reserve",
      computed_at: new Date().toISOString()
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
