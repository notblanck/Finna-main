import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calculateFinnaFinancialState } from "@/lib/finance/engine"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (data && data.length > 0) {
        const total = data.reduce((sum, item) => sum + Number(item.amount), 0)
        return NextResponse.json({
          total_expenses_this_month: total,
          expenses: data,
        })
      }
    }

    // Default to authoritative calculation from Financial Engine
    const calc = calculateFinnaFinancialState()
    const exp = calc.expenses

    const mockExpenses = [
      { id: "exp-rent", category: "Rent", amount: exp.monthlyRent, is_recurring: true, is_business_expense: false, date: "2026-09-05", notes: "House Rent" },
      { id: "exp-fuel", category: "Fuel", amount: exp.monthlyFuel, is_recurring: false, is_business_expense: true, date: "2026-09-27", notes: "Petrol for 2W Deliveries" },
      { id: "exp-emi", category: "Vehicle EMI", amount: exp.monthlyEmi, is_recurring: true, is_business_expense: true, date: "2026-09-10", notes: "Two-Wheeler Loan EMI" },
      { id: "exp-living", category: "Living & Groceries", amount: exp.essentialLiving, is_recurring: true, is_business_expense: false, date: "2026-09-24", notes: "Household food & utilities" },
      { id: "exp-misc", category: "Discretionary", amount: exp.discretionaryExpenses, is_recurring: false, is_business_expense: false, date: "2026-09-25", notes: "Food outside & misc" },
    ]

    return NextResponse.json({
      total_expenses_this_month: exp.totalMonthlyExpenses,
      essential_expenses: exp.totalEssentialExpenses,
      discretionary_expenses: exp.discretionaryExpenses,
      expenses: mockExpenses,
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
      .from("expenses")
      .insert({
        user_id: user.id,
        date: body.date || new Date().toISOString().split("T")[0],
        amount: Number(body.amount),
        category: body.category || "General",
        is_recurring: Boolean(body.is_recurring),
        is_business_expense: Boolean(body.is_business_expense),
        source: body.source || "manual",
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, expense: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
