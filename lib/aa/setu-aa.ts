import { AAProvider, CreateConsentParams, ConsentResponse, FIDataSessionResponse, AATransaction } from "./interface"

export class SetuConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SetuConfigurationError"
  }
}

export class SetuAAProvider implements AAProvider {
  name = "Setu AA Sandbox (Real API)"
  isSandbox = true

  private baseUrl = (process.env.SETU_AA_BASE_URL || process.env.SETU_BASE_URL || "https://fiu-sandbox.setu.co").replace(/\/$/, "")
  private authUrl = process.env.SETU_AUTH_URL || "https://accountservice.setu.co/v1/users/login"
  private fiuId = process.env.SETU_FIU_ID || ""
  private clientId = process.env.SETU_CLIENT_ID || ""
  private clientSecret = process.env.SETU_CLIENT_SECRET || ""
  private productInstanceId = process.env.SETU_PRODUCT_INSTANCE_ID || ""
  private cachedToken: string | null = null
  private tokenExpiresAt: number = 0

  public validateConfiguration(): void {
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

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.cachedToken
    }

    this.validateConfiguration()

    const res = await fetch(this.authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientID: this.clientId,
        secret: this.clientSecret,
        grant_type: "client_credentials"
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Failed to authenticate with Setu Account Service (${res.status}): ${errText}`)
    }

    const data = await res.json()
    this.cachedToken = data.access_token
    const validFor = (data.expiresIn || 1800) * 1000
    this.tokenExpiresAt = Date.now() + validFor

    return data.access_token
  }

  private async safeParse(res: Response): Promise<{ ok: boolean; status: number; data: any }> {
    const text = await res.text()
    try {
      return { ok: res.ok, status: res.status, data: JSON.parse(text) }
    } catch {
      return { ok: res.ok, status: res.status, data: { message: text } }
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    this.validateConfiguration()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "FINNA-App/1.0",
      "x-client-id": this.clientId,
      "x-client-secret": this.clientSecret,
      "x-product-instance-id": this.productInstanceId,
    }

    if (this.fiuId) {
      headers["x-fiu-id"] = this.fiuId
    }

    return headers
  }

  async createConsent(params: CreateConsentParams): Promise<ConsentResponse> {
    this.validateConfiguration()
    const headers = await this.getHeaders()

    const vpa = params.vpa || (params.phone ? `${params.phone.replace(/^\+91/, '')}@setu` : "9876543210@setu")
    const now = new Date()
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const payload = {
      vua: vpa,
      consentDuration: { unit: "MONTH", value: "12" },
      dataRange: {
        from: params.dateRangeFrom || ninetyDaysAgo.toISOString(),
        to: params.dateRangeTo || now.toISOString(),
      },
    }

    const requestedFiTypes = params.fiTypes?.length ? params.fiTypes : ["DEPOSIT", "TERM_DEPOSIT", "RECURRING_DEPOSIT"]

    let res = await fetch(`${this.baseUrl}/v2/consents`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payload, fiTypes: requestedFiTypes }),
    })

    let parsed = await this.safeParse(res)
    if (!parsed.ok && (parsed.data.errorMsg?.includes("Invalid FIType") || parsed.data.message?.includes("Invalid FIType"))) {
      // Automatic fallback if deposit FI type is not enabled on this product instance
      res = await fetch(`${this.baseUrl}/v2/consents`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...payload, fiTypes: ["INSURANCE_POLICIES"] }),
      })
      parsed = await this.safeParse(res)
    }

    const data = parsed.data
    if (!parsed.ok) {
      const msg = data.errorMsg || data.message || JSON.stringify(data)
      throw new Error(`Setu Create Consent API Error (${parsed.status}): ${msg}`)
    }

    const consentId = data.id || data.consentId || data.consentCollectionId
    const redirectUrl = data.url || data.redirectUrl || `${this.baseUrl}/consents/${consentId}`

    return {
      id: consentId,
      consentHandle: data.handle || data.txnid || consentId,
      status: data.status || "PENDING",
      redirectUrl,
      expiresAt: data.consentExpiry || oneYearFromNow.toISOString(),
      raw: data,
    } as any
  }

  async getConsentStatus(consentId: string): Promise<ConsentResponse> {
    this.validateConfiguration()
    const headers = await this.getHeaders()

    const res = await fetch(`${this.baseUrl}/v2/consents/${consentId}`, {
      method: "GET",
      headers,
    })

    const parsed = await this.safeParse(res)
    const data = parsed.data
    if (!parsed.ok) {
      throw new Error(`Setu Get Consent Status Error (${parsed.status}): ${data.message || data.errorMsg || JSON.stringify(data)}`)
    }

    return {
      id: data.id || consentId,
      consentHandle: data.handle || data.txnid || consentId,
      status: data.status || "PENDING",
      redirectUrl: data.url || data.redirectUrl,
      expiresAt: data.consentExpiry || data.expireTime || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      raw: data,
    } as any
  }

  async revokeConsent(consentId: string): Promise<{ success: boolean; status: string }> {
    this.validateConfiguration()
    const headers = await this.getHeaders()

    const res = await fetch(`${this.baseUrl}/v2/consents/${consentId}/revoke`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    })

    return { success: res.ok, status: "REVOKED" }
  }

  async createDataSession(consentId: string, options?: { from?: string; to?: string }): Promise<FIDataSessionResponse> {
    this.validateConfiguration()
    const headers = await this.getHeaders()

    const now = new Date()
    const fromDate = options?.from || new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const toDate = options?.to || now.toISOString()

    const res = await fetch(`${this.baseUrl}/v2/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        consentId,
        format: "json",
        dataRange: { from: fromDate, to: toDate },
      }),
    })

    const parsed = await this.safeParse(res)
    const data = parsed.data
    if (!parsed.ok) {
      throw new Error(`Setu Create Session Error (${parsed.status}): ${data.message || data.errorMsg || JSON.stringify(data)}`)
    }

    return {
      sessionId: data.id || data.sessionId,
      status: data.status || "PENDING",
      raw: data,
    } as any
  }

  async fetchSessionData(sessionId: string): Promise<{ accounts: any[]; transactions: AATransaction[]; raw?: any }> {
    this.validateConfiguration()
    const headers = await this.getHeaders()

    const res = await fetch(`${this.baseUrl}/v2/sessions/${sessionId}`, {
      method: "GET",
      headers,
    })

    const parsed = await this.safeParse(res)
    const payload = parsed.data
    if (!parsed.ok) {
      throw new Error(`Setu Fetch Session Data Error (${parsed.status}): ${payload.message || payload.errorMsg || JSON.stringify(payload)}`)
    }

    const accounts: any[] = []
    const transactions: AATransaction[] = []

    const fipList = payload.Payload || payload.payload || (Array.isArray(payload) ? payload : [payload])

    for (const fipData of fipList) {
      const fipId = fipData.fipId || "FIP-BANK"
      const accList = fipData.data?.account || fipData.accounts || fipData.account || []
      const normAccs = Array.isArray(accList) ? accList : [accList]

      for (const acc of normAccs) {
        if (!acc) continue

        const holderName = acc.profile?.holders?.holder?.[0]?.name || fipId
        const accountType = acc.summary?.type || "Savings"
        const maskedAccount = acc.maskedAccNumber || acc.maskedAccountNumber || "XXXXXX0000"
        const balance = parseFloat(acc.summary?.currentBalance || "0") || 0

        accounts.push({
          bank: holderName,
          type: accountType,
          accountNumber: maskedAccount,
          balance,
          fipId,
        })

        const txnList = acc.transactions?.transaction || acc.transactions || []
        const normTxns = Array.isArray(txnList) ? txnList : [txnList]

        for (const txn of normTxns) {
          if (!txn) continue
          const narration = txn.narration || txn.description || "Bank Transaction"
          const amount = parseFloat(txn.amount || "0") || 0
          const rawType = (txn.type || "DEBIT").toUpperCase()
          const type: "CREDIT" | "DEBIT" = rawType.includes("CREDIT") || rawType === "CR" ? "CREDIT" : "DEBIT"

          let mappedPlatform: string | undefined
          let categoryGuess = type === "CREDIT" ? "Gig Income" : "General Expense"
          const lower = narration.toLowerCase()

          if (lower.includes("swiggy") || lower.includes("bundl")) {
            mappedPlatform = "swiggy"
            categoryGuess = "Gig Income"
          } else if (lower.includes("zomato")) {
            mappedPlatform = "zomato"
            categoryGuess = "Gig Income"
          } else if (lower.includes("uber")) {
            mappedPlatform = "uber"
            categoryGuess = "Gig Income"
          } else if (lower.includes("rapido")) {
            mappedPlatform = "rapido"
            categoryGuess = "Gig Income"
          } else if (lower.includes("zepto")) {
            mappedPlatform = "zepto"
            categoryGuess = "Gig Income"
          } else if (lower.includes("blinkit")) {
            mappedPlatform = "blinkit"
            categoryGuess = "Gig Income"
          } else if (lower.includes("petrol") || lower.includes("fuel") || lower.includes("iocl") || lower.includes("bpcl")) {
            categoryGuess = "Fuel"
          }

          transactions.push({
            txnId: txn.txnId || txn.referenceNumber || `txn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            date: txn.transactionTimestamp?.slice(0, 10) || txn.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
            amount,
            type,
            narration,
            balanceAfter: parseFloat(txn.currentBalance || txn.balanceAfter || "0") || 0,
            categoryGuess,
            mappedPlatform,
          })
        }
      }
    }

    return { accounts, transactions, raw: payload }
  }

  // Backwards compatibility helper
  async requestFIData(consentId: string): Promise<FIDataSessionResponse> {
    return this.createDataSession(consentId)
  }

  async fetchFIData(sessionId: string): Promise<{ accounts: any[]; transactions: AATransaction[] }> {
    return this.fetchSessionData(sessionId)
  }

  async handleWebhook(payload: any): Promise<{ handled: boolean; event: string }> {
    return { handled: true, event: payload?.type || "CONSENT_STATUS_UPDATE" }
  }
}

export const setuAA = new SetuAAProvider()
