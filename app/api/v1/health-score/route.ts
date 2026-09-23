import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calculateHealthScore } from "@/lib/health-score/calculator"
import type { HealthScoreResult } from "@/lib/api"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Check if user already has a computed health score in Supabase
    const { data: cached } = await supabase
      .from("health_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (cached) {
      const result: HealthScoreResult = {
        score: Number(cached.score),
        verification_tier: (cached.verification_tier as any) || "verified",
        factors: cached.factors || {
          income_stability: 85,
          savings_rate: 65,
          expense_ratio: 78,
          verification: 90,
          gig_activity_regularity: 82,
        },
      }
      return NextResponse.json(result)
    }

    // 2. Fetch live data from Supabase to compute deterministic health score
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    const { data: platforms } = await supabase
      .from("user_platforms")
      .select("id")
      .eq("user_id", user.id)

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]

    const { data: monthIncome } = await supabase
      .from("income_entries")
      .select("gross_amount")
      .eq("user_id", user.id)
      .gte("date", startOfMonth)

    const monthlyIncome = (monthIncome && monthIncome.length > 0)
      ? monthIncome.reduce((s, e) => s + Number(e.gross_amount || 0), 0)
      : profile?.annual_income_estimate
      ? Math.round(Number(profile.annual_income_estimate) / 12)
      : 32450

    const { data: monthExpenses } = await supabase
      .from("expenses")
      .select("amount")
      .eq("user_id", user.id)
      .gte("date", startOfMonth)

    const monthlyExpense = (monthExpenses && monthExpenses.length > 0)
      ? monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
      : 18600

    const { data: accounts } = await supabase
      .from("accounts")
      .select("balance")
      .eq("user_id", user.id)

    const liquidSavings = (accounts || []).reduce((s, a) => s + Number(a.balance || 0), 0)

    const { data: liabilities } = await supabase
      .from("liabilities")
      .select("emi_amount")
      .eq("user_id", user.id)
      .eq("status", "active")

    const monthlyEmi = (liabilities || []).reduce((s, l) => s + Number(l.emi_amount || 0), 0)

    // Compute score using Finna deterministic engine
    const computed = calculateHealthScore({
      monthlyIncome,
      monthlyExpense,
      liquidSavings: liquidSavings || 14200,
      monthlyEmi: monthlyEmi || 0,
      platformCount: platforms?.length || 1,
      eShramRegistered: Boolean(profile?.e_shram_id),
      panLinked: Boolean(profile?.pan_last4),
      hasInsurance: true,
    })

    const factors = {
      income_stability: Math.min(100, Math.round((computed.components.find((c) => c.key === "incomeStability")?.score || 20) * 4)),
      savings_rate: Math.min(100, Math.round((computed.components.find((c) => c.key === "savingsRate")?.score || 15) * 5)),
      expense_ratio: Math.min(100, Math.round((computed.components.find((c) => c.key === "expenseDiscipline")?.score || 12) * 6.6)),
      verification: profile?.pan_last4 ? 90 : 60,
      gig_activity_regularity: 85,
    }

    // Store in Supabase
    try {
      await supabase.from("health_scores").insert({
        user_id: user.id,
        score: computed.totalScore,
        verification_tier: "verified",
        band: computed.band,
        factors,
        component_scores: computed.components,
        recommendations: computed.recommendations,
      })
    } catch (saveErr) {
      console.warn("Could not cache health score to DB:", saveErr)
    }

    const result: HealthScoreResult = {
      score: computed.totalScore,
      verification_tier: "verified",
      factors,
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to calculate health score" }, { status: 500 })
  }
}
