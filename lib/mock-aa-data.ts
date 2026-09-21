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

const defaultAccount: Account = {
  name: "Arun Kumar",
  bank: "State Bank of India",
  accountNumber: "•••• 2841",
  balance: "₹42,680.50",
  lastSynced: "Just now",
}

const defaultTransactions: Transaction[] = [
  { id: "1", date: "18 Sep 2026", merchant: "Swiggy", category: "Food & dining", amount: 412, type: "debit" },
  { id: "2", date: "17 Sep 2026", merchant: "UPI transfer", category: "Income", amount: 18500, type: "credit" },
  { id: "3", date: "16 Sep 2026", merchant: "Airtel recharge", category: "Utilities", amount: 299, type: "debit" },
  { id: "4", date: "14 Sep 2026", merchant: "Amazon India", category: "Shopping", amount: 1299, type: "debit" },
]

const API_BASE = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "/api/v1"

export async function getConsentStatus(id: string): Promise<Consent> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1200)
    const res = await fetch(`${API_BASE}/consent/${id}`, {
      signal: controller.signal,
      headers: { "Authorization": "Bearer demo-token" }
    })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      return {
        ...defaultConsent,
        id: data.consentId || id,
        status: (data.status?.toLowerCase() === "approved" ? "approved" : "pending") as ConsentStatus
      }
    }
  } catch (err) {
    // Fall back to default mock
  }
  return { ...defaultConsent, id }
}

export async function getAccount(): Promise<Account> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1200)
    const res = await fetch(`${API_BASE}/accounts`, {
      signal: controller.signal,
      headers: { "Authorization": "Bearer demo-token" }
    })
    clearTimeout(timeout)
    if (res.ok) {
      const accounts = await res.json()
      if (Array.isArray(accounts) && accounts.length > 0) {
        const acc = accounts[0]
        return {
          name: "Arun Kumar",
          bank: acc.bank_name || "State Bank of India",
          accountNumber: acc.masked_account || "•••• 2841",
          balance: formatCurrency(acc.balance || 42680),
          lastSynced: "Just now"
        }
      }
    }
  } catch (err) {
    // Fall back to default mock
  }
  return defaultAccount
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1200)
    const res = await fetch(`${API_BASE}/transactions`, {
      signal: controller.signal,
      headers: { "Authorization": "Bearer demo-token" }
    })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data.slice(0, 10).map((t: any, idx: number) => ({
          id: t.id || String(idx + 1),
          date: t.txn_date || "Today",
          merchant: t.description || "Gig Payout",
          category: t.category || "Gig Income",
          amount: Number(t.amount) || 0,
          type: (t.type?.toLowerCase() === "credit" ? "credit" : "debit") as "credit" | "debit"
        }))
      }
    }
  } catch (err) {
    // Fall back to default mock
  }
  return defaultTransactions
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
