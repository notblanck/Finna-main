import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        budgets: [
          { category: "Fuel", allocated_amount: 6000, spent: 4120, safe_to_spend_daily: 120 },
          { category: "Food & Snacks", allocated_amount: 4500, spent: 2890, safe_to_spend_daily: 95 },
          { category: "Vehicle EMI & Service", allocated_amount: 5200, spent: 5200, safe_to_spend_daily: 0 },
        ]
      })
    }

    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ budgets: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
