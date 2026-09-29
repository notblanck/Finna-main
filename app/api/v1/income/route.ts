import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calculateFinnaFinancialState } from "@/lib/finance/engine"
import { getFutureGigData } from "@/lib/data/gig-data-layer"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from("income_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (data && data.length > 0) {
        const total = data.reduce((sum, item) => sum + Number(item.gross_amount), 0)
        return NextResponse.json({
          total_income_this_month: total,
          entries: data,
        })
      }
    }

    // Default to authoritative calculation from Gig Layer & Arun Master
    const calc = calculateFinnaFinancialState()
    const gig = getFutureGigData()

    const mockEntries = gig.platforms.flatMap((p) =>
      p.settlementHistory.map((s) => ({
        id: s.settlementId,
        platform: p.platform.toLowerCase(),
        date: s.payoutDate,
        gross_amount: s.grossAmount,
        net_amount: s.netPaid,
        incentive_amount: Math.round(p.incentivesEarned / 4),
        trips_count: Math.round(p.completedTripsOrOrders / 4),
        hours_worked: Math.round(p.activeHoursPerDay * 6),
        source: "gig_settlement",
        notes: `${p.platform} settlement for ${s.period}`,
      }))
    )

    return NextResponse.json({
      total_income_this_month: calc.income.totalMonthlyNet,
      gross_income_this_month: calc.income.totalMonthlyGross,
      daily_average: calc.income.dailyAverageIncome,
      trend: calc.income.incomeTrend,
      volatility: calc.income.incomeVolatility,
      entries: mockEntries,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("income_entries")
      .insert({
        user_id: user.id,
        platform: body.platform,
        date: body.date || new Date().toISOString().split("T")[0],
        gross_amount: Number(body.gross_amount),
        incentive_amount: Number(body.incentive_amount || 0),
        tips_amount: Number(body.tips_amount || 0),
        fuel_cost: Number(body.fuel_cost || 0),
        trips_count: Number(body.trips_count || 0),
        hours_worked: Number(body.hours_worked || 0),
        source: body.source || "manual",
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
