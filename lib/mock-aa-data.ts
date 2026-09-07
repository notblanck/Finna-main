export type ConsentStatus = "pending" | "approved" | "cancelled"

export type Consent = {
  id: string
  status: ConsentStatus
  purpose: string
  dataTypes: string[]
  duration: string
  requestedBy: string
}

export type Account = {
  name: string
  bank: string
  accountNumber: string
  balance: string
  lastSynced: string
}

export type Transaction = {
  id: string
  date: string
  merchant: string
  category: string
  amount: number
  type: "credit" | "debit"
}

export const defaultConsent: Consent = {
  id: "CONSENT-DEMO2026",
  status: "pending",
  purpose: "Build a safer, more accurate financial profile for your credit application.",
  dataTypes: ["Bank account details", "Transaction history", "Income and cash flow"],
  duration: "90 days",
  requestedBy: "FINNA Financial Intelligence",
}

const account: Account = {
  name: "Arun Kumar",
  bank: "State Bank of India",
  accountNumber: "•••• 2841",
  balance: "₹42,680.50",
  lastSynced: "Just now",
}

const transactions: Transaction[] = [
  { id: "1", date: "18 Sep 2026", merchant: "Swiggy", category: "Food & dining", amount: 412, type: "debit" },
  { id: "2", date: "17 Sep 2026", merchant: "UPI transfer", category: "Income", amount: 18500, type: "credit" },
  { id: "3", date: "16 Sep 2026", merchant: "Airtel recharge", category: "Utilities", amount: 299, type: "debit" },
  { id: "4", date: "14 Sep 2026", merchant: "Amazon India", category: "Shopping", amount: 1299, type: "debit" },
]

export async function getConsentStatus(id: string): Promise<Consent> {
  return { ...defaultConsent, id }
}

export async function getAccount(): Promise<Account> {
  return account
}

export async function getTransactions(): Promise<Transaction[]> {
  return transactions
}

export function createConsentId() {
  return `CONSENT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
}

export function formatSignedCurrency(amount: number, type: Transaction["type"]) {
  return `${type === "credit" ? "+" : "−"}${formatCurrency(amount)}`
} 
