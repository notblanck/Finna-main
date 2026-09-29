import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calculateFinnaFinancialState } from "@/lib/finance/engine"
import type { HealthScoreResult } from "@/lib/api"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Compute dynamic deterministic health score from single source of truth
    const calc = calculateFinnaFinancialState()
    const hs = calc.healthScore

    const factors = {
      income_stability: Math.round((hs.components.incomeStability.score / hs.components.incomeStability.maxScore) * 100),
      savings_rate: Math.round((hs.components.savingsBuffer.score / hs.components.savingsBuffer.maxScore) * 100),
      expense_ratio: Math.round((hs.components.expenseControl.score / hs.components.expenseControl.maxScore) * 100),
      verification: user ? 90 : 70,
      gig_activity_regularity: Math.round((calc.income.activeWorkingDays / 30) * 100),
    }

    // 2. Persist to Supabase if authenticated
    if (user) {
      try {
        await supabase.from("health_scores").insert({
          user_id: user.id,
          score: hs.totalScore,
          verification_tier: "verified",
          band: hs.band,
          factors,
          component_scores: hs.components,
          recommendations: hs.primaryDrags.map((d, i) => ({
            id: `rec-${i}`,
            rank: i + 1,
            title: `Address: ${d.slice(0, 30)}...`,
            description: d,
            impact: "+5 to +8 points",
            actionLabel: "Take Action",
            actionUrl: "/health-score",
          })),
        })
      } catch (saveErr) {
        console.warn("Could not cache health score to DB:", saveErr)
      }
    }

    const result: HealthScoreResult = {
      score: hs.totalScore,
      verification_tier: "verified",
      factors,
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to calculate health score" }, { status: 500 })
  }
}
