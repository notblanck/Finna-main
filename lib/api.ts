/**
 * FINNA Typed API Client
 * Interfaces with the FINNA Express Node.js API Gateway (/api/v1)
 * Built to TRD §3 specifications.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export interface ApiUser {
  id: string
  phone?: string
  email?: string
  full_name?: string
  preferred_language?: string
}

export interface ApiAccount {
  id: string
  bank_name: string
  account_type: string
  masked_account: string
  balance: number
  updated_at: string
}

export interface ApiTransaction {
  id: string
  txn_date: string
  description: string
  amount: number
  type: "CREDIT" | "DEBIT"
  category: string
  platform?: string | null
}

export interface IncomePrediction {
  horizon: "1d" | "7d" | "30d"
  low_estimate: number
  expected_estimate: number
  high_estimate: number
  confidence: "low" | "medium" | "high"
  cached?: boolean
}

export interface SafeToSpendResult {
  safe_to_spend_today: number
  breakdown: {
    current_balance: number
    expected_income_today_conservative: number
    daily_fixed_obligation_reserve: number
    active_savings_reserve: number
    emergency_buffer_floor: number
  }
  formula: string
  computed_at: string
}

export interface HealthScoreResult {
  score: number
  verification_tier: "basic" | "verified" | "fully_verified"
  factors: {
    income_stability: number
    savings_rate: number
    expense_ratio: number
    verification: number
    gig_activity_regularity: number
  }
}

export interface SideHustle {
  id: string
  platform: string
  job_type: string
  estimated_earning_low: number
  estimated_earning_high: number
  reason: string
  city: string
}

export interface MarketplaceProduct {
  id: string
  product_type: "insurance" | "loan"
  name: string
  provider: string
  relevant_platforms: string[]
  min_health_score: number
  description: string
  is_eligible?: boolean
  eligibility_hint?: string
}

export interface Privilege {
  id: string
  scope: "common" | "platform_specific"
  platform?: string | null
  title: string
  description: string
  eligibility_criteria: string
  apply_link: string
}

export interface CashflowDay {
  date: string
  status: "actual" | "predicted"
  is_future: boolean
  earned: number
  spent: number
  saved: number
  transactions_count: number
}

class FinnaApiClient {
  private token: string = "demo-token"

  setAuthToken(token: string) {
    this.token = token
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${path}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {})
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const res = await fetch(url, { ...options, headers })
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`API error ${res.status}: ${errorText}`)
    }
    return res.json() as Promise<T>
  }

  // Auth
  async requestOtp(phone: string) {
    return this.request<{ message: string; phone: string }>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ phone })
    })
  }

  async verifyOtp(phone: string, token: string) {
    return this.request<{ session: any; user: ApiUser }>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, token })
    })
  }

  // Consent & AA
  async createConsent(phone?: string, vpa?: string) {
    return this.request<{ consentId: string; status: string; url?: string }>("/consent", {
      method: "POST",
      body: JSON.stringify({ phone, vpa })
    })
  }

  async getConsentStatus(consentId: string) {
    return this.request<{ consentId: string; status: string }> (`/consent/${consentId}`)
  }

  async revokeConsent(consentId: string) {
    return this.request<{ status: string }>(`/consent/${consentId}/revoke`, {
      method: "POST"
    })
  }

  // Accounts & Transactions
  async getAccounts(): Promise<ApiAccount[]> {
    return this.request<ApiAccount[]>("/accounts")
  }

  async getTransactions(params: { platform?: string; from?: string; to?: string } = {}): Promise<ApiTransaction[]> {
    const query = new URLSearchParams()
    if (params.platform) query.set("platform", params.platform)
    if (params.from) query.set("from", params.from)
    if (params.to) query.set("to", params.to)
    return this.request<ApiTransaction[]>(`/transactions?${query.toString()}`)
  }

  async getTransactionSummary(period: "week" | "month" = "month") {
    return this.request<{
      period: string
      totalIncome: number
      totalExpense: number
      netSavings: number
      platformBreakdown: Record<string, number>
      categoryBreakdown: Record<string, number>
      dayOfWeekIncome: Record<string, number>
    }>(`/transactions/summary?period=${period}`)
  }

  // Income Prediction (ML)
  async getIncomePrediction(horizon: "1d" | "7d" | "30d" = "7d"): Promise<IncomePrediction> {
    return this.request<IncomePrediction>(`/predictions/income?horizon=${horizon}`)
  }

  // Safe-to-Spend
  async getSafeToSpend(): Promise<SafeToSpendResult> {
    return this.request<SafeToSpendResult>("/safe-to-spend")
  }

  // Savings
  async getSavingsBuckets() {
    return this.request<any[]>("/savings/buckets")
  }

  async createSavingsRule(rule_type: "percentage" | "roundup", value: number, bucket_id: string) {
    return this.request("/savings/rules", {
      method: "POST",
      body: JSON.stringify({ rule_type, value, bucket_id })
    })
  }

  async simulatePayout(amount: number, platform: string = "uber") {
    return this.request<{
      message: string
      payout_amount: number
      split: { emergency_set_aside: number; goal_set_aside: number; available_to_spend: number }
    }>("/savings/simulate-payout", {
      method: "POST",
      body: JSON.stringify({ amount, platform })
    })
  }

  // Recommendations & Marketplace
  async getSideHustles(city: string = "Chennai"): Promise<SideHustle[]> {
    return this.request<SideHustle[]>(`/recommendations/side-hustles?city=${city}`)
  }

  async getHealthScore(): Promise<HealthScoreResult> {
    return this.request<HealthScoreResult>("/health-score")
  }

  async getMarketplaceProducts(type?: "insurance" | "loan"): Promise<MarketplaceProduct[]> {
    const q = type ? `?type=${type}` : ""
    return this.request<MarketplaceProduct[]>(`/marketplace/products${q}`)
  }

  async getPrivileges(platform?: string): Promise<{ common: Privilege[]; platform_specific: Privilege[] }> {
    const q = platform ? `?platform=${platform}` : ""
    return this.request(`/privileges${q}`)
  }

  // Cashflow Calendar
  async getCashflowCalendar(month?: string): Promise<{ month: string; days: CashflowDay[] }> {
    const q = month ? `?month=${month}` : ""
    return this.request(`/cashflow/calendar${q}`)
  }

  // Profile
  async getProfile() {
    return this.request("/profile")
  }

  async updateProfile(data: { full_name?: string; phone?: string; preferred_language?: string }) {
    return this.request("/profile", {
      method: "PATCH",
      body: JSON.stringify(data)
    })
  }

  async updateLanguage(language: "en" | "hi" | "ta") {
    return this.request("/profile/language", {
      method: "PATCH",
      body: JSON.stringify({ language })
    })
  }
}

export const finnaApi = new FinnaApiClient()
