import { Router, Response } from "express"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { supabaseAdmin } from "../services/supabase.js"

export const savingsRouter = Router()

// GET /savings/buckets - list savings buckets (emergency fund & goals)
savingsRouter.get("/buckets", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    let { data: buckets, error } = await supabaseAdmin
      .from("savings_buckets")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!buckets || buckets.length === 0) {
      // Initialize default Emergency & Goal buckets
      const defaults = [
        {
          user_id: userId,
          bucket_type: "emergency",
          goal_label: "3-Month Emergency Safety Net",
          target_amount: 30000,
          current_amount: 8500
        },
        {
          user_id: userId,
          bucket_type: "goal",
          goal_label: "New EV Two-Wheeler Down Payment",
          target_amount: 25000,
          current_amount: 4200
        }
      ]
      const { data: created } = await supabaseAdmin.from("savings_buckets").insert(defaults).select()
      buckets = created
    }

    return res.json(buckets)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// POST /savings/rules - create/update savings rule
savingsRouter.post("/rules", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { rule_type, value, bucket_id } = req.body

    if (!rule_type || value === undefined || !bucket_id) {
      return res.status(400).json({ error: "rule_type, value, and bucket_id are required" })
    }

    const { data, error } = await supabaseAdmin.from("savings_rules").insert({
      user_id: userId,
      rule_type,
      value,
      bucket_id
    }).select().single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// POST /savings/simulate-payout - dev/demo endpoint simulating incoming gig payout and split
savingsRouter.post("/simulate-payout", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { amount = 1850, platform = "uber" } = req.body

    const payout = Number(amount)
    // 10% Emergency Fund, 5% Goal Fund, 85% Available Cash
    const emergencySplit = Math.round(payout * 0.10)
    const goalSplit = Math.round(payout * 0.05)
    const availableAmount = payout - emergencySplit - goalSplit

    // Retrieve or initialize buckets
    const { data: buckets } = await supabaseAdmin
      .from("savings_buckets")
      .select("*")
      .eq("user_id", userId)

    let emergencyBucket = buckets?.find(b => b.bucket_type === "emergency")
    let goalBucket = buckets?.find(b => b.bucket_type === "goal")

    if (emergencyBucket) {
      await supabaseAdmin.from("savings_buckets")
        .update({
          current_amount: Number(emergencyBucket.current_amount) + emergencySplit,
          updated_at: new Date().toISOString()
        })
        .eq("id", emergencyBucket.id)
    }

    if (goalBucket) {
      await supabaseAdmin.from("savings_buckets")
        .update({
          current_amount: Number(goalBucket.current_amount) + goalSplit,
          updated_at: new Date().toISOString()
        })
        .eq("id", goalBucket.id)
    }

    return res.json({
      message: `Simulated payout from ${platform.toUpperCase()}: ₹${payout}`,
      payout_amount: payout,
      platform,
      split: {
        emergency_set_aside: emergencySplit,
        goal_set_aside: goalSplit,
        available_to_spend: availableAmount
      },
      emergency_target_progress: "2.3 months covered",
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
