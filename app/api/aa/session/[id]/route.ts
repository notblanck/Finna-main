import { NextResponse } from "next/server"
import { setuAA, SetuConfigurationError } from "@/lib/aa/setu-aa"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let fiData: any
    try {
      fiData = await setuAA.fetchSessionData(sessionId)
    } catch (apiErr: any) {
      if (apiErr instanceof SetuConfigurationError || apiErr.name === "SetuConfigurationError") {
        return NextResponse.json({
          error: "Setu Configuration Error",
          message: apiErr.message,
          missingConfig: true,
          docs: "https://bridge.setu.co"
        }, { status: 503 })
      }
      throw apiErr
    }

    // Update `aa_data_sessions`
    try {
      await supabase
        .from("aa_data_sessions")
        .update({
          status: "COMPLETED",
          fetched_at: new Date().toISOString(),
          raw_payload: fiData.raw || null
        })
        .eq("session_id", sessionId)
    } catch (dbErr: any) {
      console.warn("[Next.js AA Session GET API] DB update notice:", dbErr.message)
    }

    const upsertedAccounts: any[] = []
    const upsertedTransactions: any[] = []
    const syncedIncomeEntries: any[] = []
    const syncedExpenses: any[] = []

    if (user) {
      // 1. Upsert Accounts into `public.accounts`
      for (const acc of fiData.accounts) {
        try {
          const { data: accData } = await supabase
            .from("accounts")
            .upsert({
              user_id: user.id,
              bank_name: acc.bank,
              account_type: acc.type || "Savings",
              masked_account: acc.accountNumber,
              balance: acc.balance,
              fip_id: acc.fipId || null,
              updated_at: new Date().toISOString()
            }, { onConflict: "user_id, masked_account" as any })
            .select()
            .single()

          if (accData) {
            upsertedAccounts.push(accData)
            const accountId = accData.id

            // 2. Upsert Transactions into `public.transactions`
            for (const txn of fiData.transactions) {
              const { data: txnData } = await supabase
                .from("transactions")
                .insert({
                  user_id: user.id,
                  account_id: accountId,
                  txn_date: txn.date,
                  amount: txn.amount,
                  type: txn.type,
                  description: txn.narration || txn.description,
                  category: txn.categoryGuess || "General",
                  platform: txn.mappedPlatform || null,
                  balance_after: txn.balanceAfter || null
                })
                .select()
                .single()

              if (txnData) {
                upsertedTransactions.push(txnData)

                // 3. Map Gig Payouts to `public.income_entries`
                if (txn.type === "CREDIT" && txn.mappedPlatform) {
                  const { data: incData } = await supabase
                    .from("income_entries")
                    .insert({
                      user_id: user.id,
                      platform: txn.mappedPlatform,
                      date: txn.date,
                      gross_amount: txn.amount,
                      source: "aa",
                      notes: `Reconciled via Setu AA from ${acc.bank} (${acc.accountNumber})`
                    })
                    .select()
                    .single()

                  if (incData) syncedIncomeEntries.push(incData)
                }

                // 4. Map Fuel / EMI to `public.expenses`
                if (txn.type === "DEBIT" && (txn.categoryGuess === "Fuel" || txn.categoryGuess === "Vehicle EMI")) {
                  const { data: expData } = await supabase
                    .from("expenses")
                    .insert({
                      user_id: user.id,
                      date: txn.date,
                      amount: txn.amount,
                      category: txn.categoryGuess,
                      source: "aa",
                      is_business_expense: true,
                      notes: `Imported via Setu AA (${txn.narration})`
                    })
                    .select()
                    .single()

                  if (expData) syncedExpenses.push(expData)
                }
              }
            }
          }
        } catch (syncErr: any) {
          console.warn("[Next.js AA Session GET API] Sync iteration error:", syncErr.message)
        }
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      accounts: fiData.accounts,
      transactions: fiData.transactions,
      dbSync: {
        userId: user?.id || null,
        accountsCount: upsertedAccounts.length,
        transactionsCount: upsertedTransactions.length,
        incomeEntriesCount: syncedIncomeEntries.length,
        expensesCount: syncedExpenses.length
      }
    })
  } catch (err: any) {
    console.error("[Next.js AA Session GET API] Error:", err.message)
    return NextResponse.json({
      error: "Failed to fetch session data",
      message: err.message
    }, { status: 500 })
  }
}
