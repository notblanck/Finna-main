import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calculateFinnaFinancialState } from "@/lib/finance/engine"
import type { SafeToSpendResult } from "@/lib/api"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Calculate from deterministic financial engine (Single source of truth)
    const calc = calculateFinnaFinancialState()
    const sts = calc.safeToSpend

    const result: SafeToSpendResult = {
      safe_to_spend_today: sts.safeToSpendToday,
      breakdown: {
        current_balance: sts.breakdown.currentBalance,
        expected_income_today_conservative: sts.breakdown.conservativeTodayIncome,
        daily_fixed_obligation_reserve: sts.breakdown.dailyFixedObligationReserve,
        active_savings_reserve: sts.breakdown.dailySavingsTarget,
        emergency_buffer_floor: sts.breakdown.emergencyBufferFloor,
      },
      formula: sts.formulaExplanation,
      computed_at: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to calculate safe to spend" }, { status: 500 })
  }
}
