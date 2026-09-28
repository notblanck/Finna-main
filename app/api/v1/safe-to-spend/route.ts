import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { SafeToSpendResult } from "@/lib/api"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Fetch total balance across all linked accounts
    const { data: accounts } = await supabase
      .from("accounts")
      .select("balance")
      .eq("user_id", user.id)

    const current_balance = (accounts || []).reduce(
      (sum, acc) => sum + Number(acc.balance || 0),
      0
    )

    // 2. Fetch conservative expected today income from 1d prediction or recent entries
    let expected_income_today_conservative = 0
    const { data: prediction } = await supabase
      .from("income_predictions")
      .select("low_estimate")
      .eq("user_id", user.id)
      .eq("horizon", "1d")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (prediction && prediction.low_estimate) {
      expected_income_today_conservative = Number(prediction.low_estimate)
    } else {
      // Calculate from recent 14 days income entries
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
      const { data: entries } = await supabase
        .from("income_entries")
        .select("gross_amount")
        .eq("user_id", user.id)
        .gte("date", fourteenDaysAgo)

      if (entries && entries.length > 0) {
        const total = entries.reduce((s, e) => s + Number(e.gross_amount || 0), 0)
        expected_income_today_conservative = Math.round((total / 14) * 0.8) // conservative 80% of avg
      }
    }

    // 3. Daily fixed obligations reserve (active liabilities monthly EMI / 30)
    const { data: liabilities } = await supabase
      .from("liabilities")
      .select("emi_amount")
      .eq("user_id", user.id)
      .eq("status", "active")

    const monthly_emi_total = (liabilities || []).reduce(
      (sum, l) => sum + Number(l.emi_amount || 0),
      0
    )
    const daily_fixed_obligation_reserve = Math.round(monthly_emi_total / 30)

    // 4. Active savings reserve from savings buckets or rules
    const { data: buckets } = await supabase
      .from("savings_buckets")
      .select("target_amount, current_amount")
      .eq("user_id", user.id)

    const totalSavingsDeficit = (buckets || []).reduce((sum, b) => {
      const def = Math.max(0, Number(b.target_amount || 0) - Number(b.current_amount || 0))
      return sum + def
    }, 0)
    // Daily savings allocation (stretching deficit over 90 days, or minimum buffer)
    const active_savings_reserve = Math.min(500, Math.round(totalSavingsDeficit / 90))

    // 5. Emergency buffer floor
    const emergency_buffer_floor = Math.min(5000, Math.round(current_balance * 0.2))

    // Safe-to-spend formula
    const rawSafeToSpend =
      current_balance +
      expected_income_today_conservative -
      (daily_fixed_obligation_reserve + active_savings_reserve + emergency_buffer_floor)

    const safe_to_spend_today = Math.max(0, Math.round(rawSafeToSpend))

    const result: SafeToSpendResult = {
      safe_to_spend_today,
      breakdown: {
        current_balance,
        expected_income_today_conservative,
        daily_fixed_obligation_reserve,
        active_savings_reserve,
        emergency_buffer_floor,
      },
      formula:
        "SafeToSpend = (Balance + ConservativeTodayIncome) - (FixedObligations + SavingsReserve + EmergencyBuffer)",
      computed_at: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to calculate safe to spend" }, { status: 500 })
  }
}
