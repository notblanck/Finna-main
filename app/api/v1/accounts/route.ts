import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json([
    {
      id: "acc-sbi-01",
      bank_name: "State Bank of India",
      account_type: "SAVINGS",
      masked_account: "•••• 2841",
      balance: 42680.50,
      updated_at: new Date().toISOString()
    },
    {
      id: "acc-hdfc-02",
      bank_name: "HDFC Bank",
      account_type: "SAVINGS",
      masked_account: "•••• 9104",
      balance: 14250.00,
      updated_at: new Date().toISOString()
    }
  ])
}
