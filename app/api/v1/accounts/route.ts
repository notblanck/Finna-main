import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getArunMasterData } from "@/lib/data/arun-master"
import type { ApiAccount } from "@/lib/api"

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

    const master = getArunMasterData()

    if (user) {
      const { data } = await supabase
        .from("accounts")
        .select("id, bank_name, account_type, masked_account, balance, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (data && data.length > 0) {
        const accounts: ApiAccount[] = data.map((acc) => ({
          id: acc.id,
          bank_name: acc.bank_name,
          account_type: acc.account_type || "Savings",
          masked_account: acc.masked_account,
          balance: Number(acc.balance || 0),
          updated_at: acc.updated_at || new Date().toISOString(),
        }))
        return NextResponse.json(accounts)
      }
    }

    // Default to authoritative Arun Master bank accounts
    const fallbackAccounts: ApiAccount[] = master.bankAccounts.map((acc) => ({
      id: acc.id,
      bank_name: acc.bankName,
      account_type: acc.accountType,
      masked_account: acc.maskedAccount,
      balance: acc.balance,
      updated_at: new Date().toISOString(),
    }))

    return NextResponse.json(fallbackAccounts)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch accounts" }, { status: 500 })
  }
}
