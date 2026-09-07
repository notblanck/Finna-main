import { Router, Response } from "express"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { supabaseAdmin } from "../services/supabase.js"
import { aaService } from "../services/aa/index.js"

export const transactionsRouter = Router()

// GET /transactions?platform=&from=&to=
transactionsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { platform, from, to } = req.query

    let query = supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("txn_date", { ascending: false })

    if (platform && typeof platform === "string") {
      query = query.eq("platform", platform.toLowerCase())
    }
    if (from && typeof from === "string") {
      query = query.gte("txn_date", from)
    }
    if (to && typeof to === "string") {
      query = query.lte("txn_date", to)
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // If empty, return mock fallback
    if (!data || data.length === 0) {
      const mock = await aaService.fetchFinancialData("demo")
      let filtered = mock.transactions.map((t, idx) => ({
        id: `demo-${idx + 1}`,
        user_id: userId,
        txn_date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        platform: t.platform
      }))

      if (platform && typeof platform === "string") {
        filtered = filtered.filter(t => t.platform === platform.toLowerCase())
      }
      return res.json(filtered)
    }

    return res.json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// GET /transactions/summary?period=week|month
transactionsRouter.get("/summary", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { period = "month" } = req.query

    const days = period === "week" ? 7 : 30
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    let { data: txns } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("txn_date", cutoffDate)

    if (!txns || txns.length === 0) {
      const mock = await aaService.fetchFinancialData("demo")
      txns = mock.transactions.map((t, idx) => ({
        id: `demo-${idx + 1}`,
        user_id: userId,
        txn_date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        platform: t.platform
      })) as any
    }

    let totalIncome = 0
    let totalExpense = 0
    const platformBreakdown: Record<string, number> = {}
    const categoryBreakdown: Record<string, number> = {}
    const dayOfWeekIncome: Record<string, number> = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
    }

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    for (const t of txns!) {
      const amt = Number(t.amount)
      if (t.type === "CREDIT" || t.category === "Gig Income") {
        totalIncome += amt
        const p = t.platform || "Other"
        platformBreakdown[p] = (platformBreakdown[p] || 0) + amt

        const dayIdx = new Date(t.txn_date).getDay()
        const dayStr = dayNames[dayIdx]
        dayOfWeekIncome[dayStr] = (dayOfWeekIncome[dayStr] || 0) + amt
      } else {
        totalExpense += amt
        const c = t.category || "General"
        categoryBreakdown[c] = (categoryBreakdown[c] || 0) + amt
      }
    }

    return res.json({
      period,
      totalIncome: Math.round(totalIncome),
      totalExpense: Math.round(totalExpense),
      netSavings: Math.round(totalIncome - totalExpense),
      platformBreakdown,
      categoryBreakdown,
      dayOfWeekIncome
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
