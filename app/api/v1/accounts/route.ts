import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { ApiAccount } from "@/lib/api"

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

    const { data, error } = await supabase
      .from("accounts")
      .select("id, bank_name, account_type, masked_account, balance, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const accounts: ApiAccount[] = (data || []).map((acc) => ({
      id: acc.id,
      bank_name: acc.bank_name,
      account_type: acc.account_type || "Savings",
      masked_account: acc.masked_account,
      balance: Number(acc.balance || 0),
      updated_at: acc.updated_at || new Date().toISOString(),
    }))

    return NextResponse.json(accounts)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch accounts" }, { status: 500 })
  }
}
