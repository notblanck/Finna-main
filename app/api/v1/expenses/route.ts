import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) throw error

    const total = (data || []).reduce((sum, item) => sum + Number(item.amount), 0)

    return NextResponse.json({
      total_expenses_this_month: total,
      expenses: data || [],
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
