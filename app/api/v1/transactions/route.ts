import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { ApiTransaction } from "@/lib/api"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    let { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user) {
      const authHeader = request.headers.get("authorization")
      const token = authHeader?.replace(/^Bearer\s+/i, "")
      if (token && token !== "demo-token") {
        const { data: userData } = await supabase.auth.getUser(token)
        if (userData?.user) {
          user = userData.user
          authError = null
        }
      }
    }

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    let query = supabase
      .from("transactions")
      .select("id, txn_date, description, amount, type, category, platform")
      .eq("user_id", user.id)
      .order("txn_date", { ascending: false })

    if (platform) {
      query = query.ilike("platform", platform)
    }
    if (from) {
      query = query.gte("txn_date", from)
    }
    if (to) {
      query = query.lte("txn_date", to)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const transactions: ApiTransaction[] = (data || []).map((txn) => ({
      id: txn.id,
      txn_date: txn.txn_date,
      description: txn.description,
      amount: Number(txn.amount || 0),
      type: (txn.type?.toUpperCase() === "CREDIT" ? "CREDIT" : "DEBIT") as "CREDIT" | "DEBIT",
      category: txn.category || "General",
      platform: txn.platform || null,
    }))

    return NextResponse.json(transactions)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch transactions" }, { status: 500 })
  }
}
