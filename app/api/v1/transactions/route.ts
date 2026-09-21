import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json([
    { id: "1", txn_date: "2026-09-18", description: "Swiggy Settlement", amount: 412, type: "DEBIT", category: "Food & dining", platform: "Swiggy" },
    { id: "2", txn_date: "2026-09-17", description: "UPI Rider Payout", amount: 18500, type: "CREDIT", category: "Income", platform: "Zomato" },
    { id: "3", txn_date: "2026-09-16", description: "Airtel Prepaid Recharge", amount: 299, type: "DEBIT", category: "Utilities", platform: null },
    { id: "4", txn_date: "2026-09-14", description: "Amazon India Purchase", amount: 1299, type: "DEBIT", category: "Shopping", platform: null },
    { id: "5", txn_date: "2026-09-12", description: "Uber Weekly Payout", amount: 14200, type: "CREDIT", category: "Income", platform: "Uber" }
  ])
}
