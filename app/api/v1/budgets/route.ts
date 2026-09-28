import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: budgets, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)

    if (error) throw error

    // Fetch this month's expenses to calculate actual spent per category
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]

    const { data: expenses } = await supabase
      .from("expenses")
      .select("category, amount")
      .eq("user_id", user.id)
      .gte("date", startOfMonth)

    const spentByCategory: Record<string, number> = {}
    ;(expenses || []).forEach((exp) => {
      const cat = exp.category || "General"
      spentByCategory[cat] = (spentByCategory[cat] || 0) + Number(exp.amount || 0)
    })

    const enrichedBudgets = (budgets || []).map((b) => ({
      id: b.id,
      category: b.category,
      allocated_amount: Number(b.allocated_amount || 0),
      spent: spentByCategory[b.category] || 0,
      safe_to_spend_daily: Number(b.safe_to_spend_daily || 0),
      month: b.month,
    }))

    return NextResponse.json({ budgets: enrichedBudgets })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
