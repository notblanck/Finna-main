import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import {
  AccountAggregatorService,
  ConsentRequestParams,
  ConsentResponse,
  AADataFetchResult,
  AADataSessionResponse,
  AAAccount,
  AATransaction
} from "./interface.js"

export class SetuConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SetuConfigurationError"
  }
}

export class SetuAAService implements AccountAggregatorService {
  name = "Setu Account Aggregator (Real Sandbox / Production)"

  private baseUrl: string
  private authUrl: string
  private fiuId: string
  private clientId: string
  private clientSecret: string
  private productInstanceId: string
  private cachedToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor() {
    this.baseUrl = (process.env.SETU_AA_BASE_URL || process.env.SETU_BASE_URL || "https://fiu-sandbox.setu.co").replace(/\/$/, "")
    this.authUrl = process.env.SETU_AUTH_URL || "https://accountservice.setu.co/v1/users/login"
    this.fiuId = process.env.SETU_FIU_ID || ""
    this.clientId = process.env.SETU_CLIENT_ID || ""
    this.clientSecret = process.env.SETU_CLIENT_SECRET || ""
    this.productInstanceId = process.env.SETU_PRODUCT_INSTANCE_ID || ""
  }

  /**
   * Validates required environment variables and fails clearly with helpful message
   */
  private validateConfiguration(): void {
    const missing: string[] = []
    if (!this.clientId) missing.push("SETU_CLIENT_ID")
    if (!this.clientSecret) missing.push("SETU_CLIENT_SECRET")
    if (!this.productInstanceId) missing.push("SETU_PRODUCT_INSTANCE_ID")

    if (missing.length > 0) {
      throw new SetuConfigurationError(
        `Setu AA Sandbox credentials missing: [${missing.join(", ")}]. ` +
        `Please register at https://bridge.setu.co, create a sandbox product instance under Account Aggregator, ` +
        `and configure these variables in your .env file.`
      )
    }
  }

  /**
   * Helper to execute API requests with exponential backoff for 429 and 5xx responses
   */
  private async executeWithRetry<T>(fn: () => Promise<AxiosResponse<T>>, retries = 3, delay = 500): Promise<AxiosResponse<T>> {
    let attempt = 0
    while (attempt <= retries) {
      try {
        return await fn()
      } catch (err: any) {
        attempt++
        const status = err.response?.status
        const isRetryable = status === 429 || (status >= 500 && status < 600) || !status // network error

        if (attempt > retries || !isRetryable) {
          throw err
        }

        const backoff = delay * Math.pow(2, attempt - 1) + Math.random() * 200
        console.warn(`[Setu AA] Request failed with status ${status || 'network'}. Retrying in ${Math.round(backoff)}ms (attempt ${attempt}/${retries})...`)
        await new Promise((resolve) => setTimeout(resolve, backoff))
      }
    }
    throw new Error("[Setu AA] Max retries exceeded")
  }

  /**
   * Retrieves or refreshes OAuth Bearer token from Setu account service
   */
  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.cachedToken
    }

    this.validateConfiguration()

    try {
      const response = await this.executeWithRetry(() =>
        axios.post(
          this.authUrl,
          {
            clientID: this.clientId,
            secret: this.clientSecret,
            grant_type: "client_credentials"
          },
          { headers: { "Content-Type": "application/json" }, timeout: 10000 }
        )
      )

      const { access_token, expiresIn } = response.data
      if (!access_token) {
        throw new Error("Invalid response from Setu Account Service: missing access_token")
      }

      this.cachedToken = access_token
      const validFor = (expiresIn || 1800) * 1000
      this.tokenExpiresAt = Date.now() + validFor

      return access_token
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message
      throw new Error(`Failed to authenticate with Setu Account Service: ${msg}`)
    }
  }

  /**
   * Generates standard Setu AA API request headers
   */
  private async getHeaders(): Promise<Record<string, string>> {
    this.validateConfiguration()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-client-id": this.clientId,
      "x-client-secret": this.clientSecret,
      "x-product-instance-id": this.productInstanceId,
    }

    if (this.fiuId) {
      headers["x-fiu-id"] = this.fiuId
    }

    return headers
  }

  /**
   * POST /v2/consents — creates an authentic consent request on Setu AA Sandbox
   */
  async createConsent(params: ConsentRequestParams): Promise<ConsentResponse> {
    this.validateConfiguration()
    const headers = await this.getHeaders()

    const vpaOrPhone = params.vpa || (params.phoneNumber ? `${params.phoneNumber.replace(/^\+91/, '')}@setu` : "9876543210@setu")
    const now = new Date()
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const payload = {
      vua: vpaOrPhone,
      consentDuration: { unit: "MONTH", value: "12" },
      dataRange: {
        from: params.dateRangeFrom || ninetyDaysAgo.toISOString(),
        to: params.dateRangeTo || now.toISOString()
      },
      fiTypes: ["DEPOSIT", "TERM_DEPOSIT", "RECURRING_DEPOSIT"]
    }

    try {
      const response = await this.executeWithRetry(() =>
        axios.post(`${this.baseUrl}/v2/consents`, payload, { headers, timeout: 15000 })
      )
      const data = response.data

      const consentId = data.id || data.consentId || data.consentCollectionId || data.consent_id
      const url = data.url || data.redirectUrl || data.consentUrl || `${this.baseUrl}/consents/${consentId}`

      return {
        consentId,
        status: data.status || "PENDING",
        url,
        txnid: data.txnid || data.txnId || data.traceId,
        createdAt: data.createdAt || now.toISOString(),
        expiresAt: data.consentExpiry || oneYearFromNow.toISOString(),
        raw: data
      }
    } catch (err: any) {
      const detail = err.response?.data?.errorMsg || err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
      throw new Error(`Setu Create Consent API Error (${err.response?.status || 'network'}): ${detail}`)
    }
  }

  /**
   * GET /v2/consents/:id — checks consent status from Setu AA Sandbox
   */
  async getConsentStatus(consentId: string): Promise<ConsentResponse> {
    this.validateConfiguration()
    const headers = await this.getHeaders()

    try {
      const response = await this.executeWithRetry(() =>
        axios.get(`${this.baseUrl}/v2/consents/${consentId}`, { headers, timeout: 10000 })
      )
      const data = response.data

      return {
        consentId: data.id || consentId,
        status: data.status || "PENDING",
        url: data.url || data.redirectUrl,
        txnid: data.txnid || data.txnId,
        createdAt: data.createdAt,
        expiresAt: data.consentExpiry || data.expireTime,
        raw: data
      }
    } catch (err: any) {
      const detail = err.response?.data?.errorMsg || err.response?.data?.message || err.message
      throw new Error(`Setu Get Consent Status Error (${err.response?.status || 'network'}): ${detail}`)
    }
  }

  /**
   * POST /v2/consents/:id/revoke — revokes consent on Setu AA Sandbox
   */
  async revokeConsent(consentId: string): Promise<boolean> {
    this.validateConfiguration()
    const headers = await this.getHeaders()

    try {
      const response = await this.executeWithRetry(() =>
        axios.post(`${this.baseUrl}/v2/consents/${consentId}/revoke`, {}, { headers, timeout: 10000 })
      )
      return response.status >= 200 && response.status < 300
    } catch (err: any) {
      const detail = err.response?.data?.errorMsg || err.response?.data?.message || err.message
      throw new Error(`Setu Revoke Consent Error: ${detail}`)
    }
  }

  /**
   * POST /v2/sessions — creates an FI data session for an approved consent
   */
  async createDataSession(consentId: string, options?: { from?: string; to?: string }): Promise<AADataSessionResponse> {
    this.validateConfiguration()
    const headers = await this.getHeaders()

    const now = new Date()
    const fromDate = options?.from || new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const toDate = options?.to || now.toISOString()

    const payload = {
      consentId,
      format: "json",
      dataRange: {
        from: fromDate,
        to: toDate
      }
    }

    try {
      const response = await this.executeWithRetry(() =>
        axios.post(`${this.baseUrl}/v2/sessions`, payload, { headers, timeout: 15000 })
      )
      const data = response.data

      const sessionId = data.id || data.sessionId || data.session_id
      return {
        sessionId,
        status: data.status || "PENDING",
        consentId,
        raw: data
      }
    } catch (err: any) {
      const detail = err.response?.data?.errorMsg || err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message
      throw new Error(`Setu Create Data Session Error (${err.response?.status || 'network'}): ${detail}`)
    }
  }

  /**
   * GET /v2/sessions/:id — fetches and decrypts financial data from a session
   */
  async fetchSessionData(sessionId: string): Promise<AADataFetchResult> {
    this.validateConfiguration()
    const headers = await this.getHeaders()

    try {
      const response = await this.executeWithRetry(() =>
        axios.get(`${this.baseUrl}/v2/sessions/${sessionId}`, { headers, timeout: 20000 })
      )
      const payload = response.data
      return this.parseFIPayload(payload, sessionId)
    } catch (err: any) {
      const detail = err.response?.data?.errorMsg || err.response?.data?.message || err.message
      throw new Error(`Setu Fetch Session Data Error (${err.response?.status || 'network'}): ${detail}`)
    }
  }

  /**
   * Convenience workflow: create data session + fetch data in sequence
   */
  async fetchFinancialData(consentId: string): Promise<AADataFetchResult> {
    const session = await this.createDataSession(consentId)
    return await this.fetchSessionData(session.sessionId)
  }

  /**
   * Normalizes raw Setu FIU payload into FINNA standard account and transaction structures
   */
  private parseFIPayload(payload: any, sessionId?: string): AADataFetchResult {
    const accounts: AAAccount[] = []
    const transactions: AATransaction[] = []

    if (!payload) {
      return { accounts, transactions, sessionId, status: "EMPTY", raw: payload }
    }

    const fipList = payload.Payload || payload.payload || (Array.isArray(payload) ? payload : [payload])

    for (const fipData of fipList) {
      const fipId = fipData.fipId || fipData.fip_id || "FIP-BANK"
      const accountContainers = fipData.data?.account || fipData.accounts || fipData.account || []
      const accList = Array.isArray(accountContainers) ? accountContainers : [accountContainers]

      for (const acc of accList) {
        if (!acc) continue

        const holderName = acc.profile?.holders?.holder?.[0]?.name || acc.holders?.[0]?.name || fipId
        const accountType = acc.summary?.type || acc.type || "Savings"
        const maskedAccount = acc.maskedAccNumber || acc.maskedAccountNumber || acc.accountNumber || "XXXXXX0000"
        const balance = parseFloat(acc.summary?.currentBalance || acc.balance || "0")

        accounts.push({
          bank: holderName,
          accountType,
          maskedAccount,
          balance: isNaN(balance) ? 0 : balance,
          fipId
        })

        const txnContainers = acc.transactions?.transaction || acc.transactions || []
        const txnList = Array.isArray(txnContainers) ? txnContainers : [txnContainers]

        for (const txn of txnList) {
          if (!txn) continue

          const narration = txn.narration || txn.description || "Bank Transaction"
          const rawAmount = parseFloat(txn.amount || "0")
          const amount = isNaN(rawAmount) ? 0 : rawAmount
          const rawType = (txn.type || "DEBIT").toUpperCase()
          const type: "CREDIT" | "DEBIT" = rawType.includes("CREDIT") || rawType === "CR" ? "CREDIT" : "DEBIT"

          // Detect gig platform payouts
          const lowerNarration = narration.toLowerCase()
          let platform: string | null = null
          let category = type === "CREDIT" ? "General Income" : "General Expense"

          if (lowerNarration.includes("swiggy") || lowerNarration.includes("bundl")) {
            platform = "Swiggy"
            category = "Gig Income"
          } else if (lowerNarration.includes("zomato")) {
            platform = "Zomato"
            category = "Gig Income"
          } else if (lowerNarration.includes("uber")) {
            platform = "Uber"
            category = "Gig Income"
          } else if (lowerNarration.includes("rapido") || lowerNarration.includes("roppen")) {
            platform = "Rapido"
            category = "Gig Income"
          } else if (lowerNarration.includes("zepto") || lowerNarration.includes("kiranakart")) {
            platform = "Zepto"
            category = "Gig Income"
          } else if (lowerNarration.includes("blinkit") || lowerNarration.includes("grofers")) {
            platform = "Blinkit"
            category = "Gig Income"
          } else if (lowerNarration.includes("petrol") || lowerNarration.includes("fuel") || lowerNarration.includes("iocl") || lowerNarration.includes("bpcl") || lowerNarration.includes("hpcl")) {
            category = "Fuel"
          } else if (lowerNarration.includes("emi") || lowerNarration.includes("loan")) {
            category = "Vehicle EMI"
          }

          transactions.push({
            txnId: txn.txnId || txn.referenceNumber || `txn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            date: txn.transactionTimestamp?.slice(0, 10) || txn.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
            description: narration,
            amount,
            type,
            category,
            platform,
            balanceAfter: parseFloat(txn.currentBalance || txn.balanceAfter || "0") || undefined
          })
        }
      }
    }

    return {
      accounts,
      transactions,
      sessionId,
      status: payload.status || "COMPLETED",
      raw: payload
    }
  }
}
