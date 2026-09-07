import { Router, Response } from "express"
import axios from "axios"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { supabaseAdmin } from "../services/supabase.js"
import { aaService } from "../services/aa/index.js"

export const predictionsRouter = Router()

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000"

// GET /predictions/income?horizon=1d|7d|30d
predictionsRouter.get("/income", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const horizon = (req.query.horizon as string) || "7d"

    // Check cached prediction generated within last 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    const { data: cached } = await supabaseAdmin
      .from("income_predictions")
      .select("*")
      .eq("user_id", userId)
      .eq("horizon", horizon)
      .gte("generated_at", twelveHoursAgo)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single()

    if (cached) {
      return res.json({
        horizon: cached.horizon,
        low_estimate: Number(cached.low_estimate),
        expected_estimate: Number(cached.expected_estimate),
        high_estimate: Number(cached.high_estimate),
        confidence: cached.confidence,
        cached: true,
        generated_at: cached.generated_at
      })
    }

    // Retrieve user transactions for inference
    let { data: txns } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("user_id", userId)

    if (!txns || txns.length === 0) {
      const mock = await aaService.fetchFinancialData("demo")
      txns = mock.transactions as any
    }

    let prediction: any = null

    // Call Python FastAPI ML Service
    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict/income`, {
        transactions: txns,
        horizon,
        demand_index: 1.10 // Current Chennai demand signal
      }, { timeout: 3000 })
      prediction = mlResponse.data
    } catch (mlErr: any) {
      // Robust server-side fallback if ML service is offline
      const incomeTxns = txns!.filter((t: any) => t.type === "CREDIT" || t.category === "Gig Income")
      const total = incomeTxns.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
      const daysFactor = horizon === "1d" ? 1 : (horizon === "7d" ? 7 : 30)
      const avgDaily = incomeTxns.length > 0 ? (total / Math.max(incomeTxns.length, 14)) : 950
      const expected = Math.round(avgDaily * daysFactor * 1.10)
      prediction = {
        horizon,
        low_estimate: Math.round(expected * 0.78),
        expected_estimate: expected,
        high_estimate: Math.round(expected * 1.25),
        confidence: incomeTxns.length > 20 ? "high" : "medium",
        sample_days: incomeTxns.length
      }
    }

    // Cache prediction in database
    await supabaseAdmin.from("income_predictions").insert({
      user_id: userId,
      horizon: prediction.horizon,
      low_estimate: prediction.low_estimate,
      expected_estimate: prediction.expected_estimate,
      high_estimate: prediction.high_estimate,
      confidence: prediction.confidence
    })

    return res.json({
      ...prediction,
      cached: false
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
