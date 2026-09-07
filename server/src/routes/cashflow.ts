import { Router, Response } from "express"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { supabaseAdmin } from "../services/supabase.js"
import { aaService } from "../services/aa/index.js"

export const cashflowRouter = Router()

// GET /cashflow/calendar?month=YYYY-MM
cashflowRouter.get("/calendar", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const monthQuery = (req.query.month as string) || new Date().toISOString().slice(0, 7) // '2026-09'

    const [yearStr, monthStr] = monthQuery.split("-")
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10) // 1-12

    const daysInMonth = new Date(year, month, 0).getDate()
    const todayStr = new Date().toISOString().slice(0, 10)

    // Fetch transactions for the user
    let { data: txns } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("user_id", userId)

    if (!txns || txns.length === 0) {
      const mock = await aaService.fetchFinancialData("demo")
      txns = mock.transactions as any
    }

    const calendarDays = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${yearStr}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const isPast = dateStr <= todayStr

      if (isPast) {
        // Actual data from recorded transactions
        const dayTxns = txns!.filter(t => (t.txn_date || t.date) === dateStr)
        const earned = dayTxns
          .filter(t => t.type === "CREDIT" || t.category === "Gig Income")
          .reduce((sum, t) => sum + Number(t.amount), 0)
        const spent = dayTxns
          .filter(t => t.type === "DEBIT")
          .reduce((sum, t) => sum + Number(t.amount), 0)
        const saved = Math.round(earned * 0.15) // savings simulated set-aside

        calendarDays.push({
          date: dateStr,
          status: "actual",
          is_future: false,
          earned: Math.round(earned),
          spent: Math.round(spent),
          saved: Math.round(saved),
          transactions_count: dayTxns.length,
          transactions: dayTxns
        })
      } else {
        // Future dates: predicted values
        const dayOfWeek = new Date(year, month - 1, day).getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6
        const predictedEarned = isWeekend ? 1650 : 1100
        const predictedSpent = 420
        const predictedSaved = Math.round(predictedEarned * 0.15)

        calendarDays.push({
          date: dateStr,
          status: "predicted",
          is_future: true,
          earned: predictedEarned,
          spent: predictedSpent,
          saved: predictedSaved,
          transactions_count: 0,
          transactions: []
        })
      }
    }

    return res.json({
      month: monthQuery,
      days: calendarDays,
      summary: {
        total_actual_earned: calendarDays.filter(d => !d.is_future).reduce((s, d) => s + d.earned, 0),
        total_predicted_earned: calendarDays.filter(d => d.is_future).reduce((s, d) => s + d.earned, 0)
      }
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
