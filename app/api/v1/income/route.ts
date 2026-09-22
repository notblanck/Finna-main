import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Default demo entries for unauthenticated demo
      return NextResponse.json({
        total_income_this_month: 32450,
        entries: [
          { id: "inc-1", platform: "Swiggy", date: new Date().toISOString().split("T")[0], gross_amount: 1450, tips_amount: 120, fuel_cost: 250, trips_count: 14 },
          { id: "inc-2", platform: "Uber", date: new Date().toISOString().split("T")[0], gross_amount: 1980, tips_amount: 150, fuel_cost: 380, trips_count: 11 },
        ]
      })
    }

    const { data, error } = await supabase
      .from("income_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) throw error

    const total = (data || []).reduce((sum, item) => sum + Number(item.gross_amount), 0)

    return NextResponse.json({
      total_income_this_month: total,
      entries: data || [],
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

    return NextResponse.json({ success: true, entry: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
