import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getArunMasterData } from "@/lib/data/arun-master"
import type { ApiTransaction } from "@/lib/api"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    let { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const authHeader = request.headers.get("authorization")
      const token = authHeader?.replace(/^Bearer\s+/i, "")
      if (token && token !== "demo-token") {
        const { data: userData } = await supabase.auth.getUser(token)
        if (userData?.user) {
          user = userData.user
        }
      }
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (user) {
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

      const { data } = await query

      if (data && data.length > 0) {
        const transactions: ApiTransaction[] = data.map((txn) => ({
          id: txn.id,
          txn_date: txn.txn_date,
          description: txn.description,
          amount: Number(txn.amount || 0),
          type: (txn.type?.toUpperCase() === "CREDIT" ? "CREDIT" : "DEBIT") as "CREDIT" | "DEBIT",
          category: txn.category || "General",
          platform: txn.platform || null,
        }))
        return NextResponse.json(transactions)
      }
    }

    // Default to authoritative Arun Master Transactions
    const master = getArunMasterData()
    let txns = master.transactions

    if (platform) {
      txns = txns.filter((t) => t.platform?.toLowerCase() === platform.toLowerCase())
    }
    if (from) {
      txns = txns.filter((t) => t.date >= from)
    }
    if (to) {
      txns = txns.filter((t) => t.date <= to)
    }

    const formatted: ApiTransaction[] = txns.map((t) => ({
      id: t.id,
      txn_date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      platform: t.platform || null,
    }))

    return NextResponse.json(formatted)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch transactions" }, { status: 500 })
  }
}
