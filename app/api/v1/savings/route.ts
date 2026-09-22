import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        buckets: [
          { id: "b1", name: "Emergency Buffer", target_amount: 25000, current_amount: 14200 },
          { id: "b2", name: "Vehicle Maintenance & Tires", target_amount: 8000, current_amount: 5400 },
          { id: "b3", name: "Festival & Family Reserve", target_amount: 15000, current_amount: 6200 },
        ],
        rules: [
          { id: "r1", rule_type: "Daily Micro-Savings", percentage: 10, trigger_event: "payout", is_active: true },
          { id: "r2", rule_type: "Weekend Surge Auto-Stash", percentage: 15, trigger_event: "weekend_surge", is_active: true }
        ]
      })
    }

    const { data: buckets } = await supabase
      .from("savings_buckets")
      .select("*")
      .eq("user_id", user.id)

    const { data: rules } = await supabase
      .from("savings_rules")
      .select("*")
      .eq("user_id", user.id)

    return NextResponse.json({
      buckets: buckets || [],
      rules: rules || [],
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

    if (body.type === "rule") {
      const { data, error } = await supabase
        .from("savings_rules")
        .insert({
          user_id: user.id,
          rule_type: body.rule_type,
          percentage: Number(body.percentage),
          trigger_event: body.trigger_event || "payout",
          is_active: body.is_active ?? true,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, rule: data })
    } else {
      const { data, error } = await supabase
        .from("savings_buckets")
        .insert({
          user_id: user.id,
          name: body.name,
          target_amount: Number(body.target_amount),
          current_amount: Number(body.current_amount || 0),
          target_date: body.target_date || null,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, bucket: data })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
