import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    safe_to_spend_today: 1420,
    breakdown: {
      current_balance: 42680,
      expected_income_today_conservative: 1100,
      daily_fixed_obligation_reserve: 850,
      active_savings_reserve: 400,
      emergency_buffer_floor: 5000
    },
    formula: "SafeToSpend = (Balance + ConservativeTodayIncome) - (FixedObligations + SavingsReserve + EmergencyBuffer)",
    computed_at: new Date().toISOString()
  })
}
