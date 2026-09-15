import axios from "axios"
import { AccountAggregatorService, ConsentRequestParams, ConsentResponse, AADataFetchResult, AAAccount, AATransaction } from "./interface.js"

export class SetuAAService implements AccountAggregatorService {
  name = "Setu Account Aggregator (Sandbox / Production)"

  private baseUrl: string
  private authUrl: string
  private clientId: string
  private clientSecret: string
  private productInstanceId: string
  private redirectUrl: string
  private cachedToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor() {
    this.baseUrl = process.env.SETU_BASE_URL || "https://fiu-sandbox.setu.co"
    this.authUrl = process.env.SETU_AUTH_URL || "https://accountservice.setu.co/v1/users/login"
    this.clientId = process.env.SETU_CLIENT_ID || ""
    this.clientSecret = process.env.SETU_CLIENT_SECRET || ""
    this.productInstanceId = process.env.SETU_PRODUCT_INSTANCE_ID || ""
    this.redirectUrl = process.env.SETU_REDIRECT_URL || process.env.AA_REDIRECT_URL || "http://localhost:3000/mock-aa/callback"
  }

  /**
   * Retrieves or refreshes OAuth access token from Setu account service
   */
  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.cachedToken
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error("SETU_CLIENT_ID and SETU_CLIENT_SECRET must be configured in environment variables for live Setu AA mode.")
    }

    try {
      const response = await axios.post(this.authUrl, {
        clientID: this.clientId,
        secret: this.clientSecret,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "client_credentials"
      })

      const token = response.data.access_token || response.data.accessToken || response.data.token
      if (!token) {
        throw new Error("No access token returned in Setu Auth response")
      }

      const expiresIn = response.data.expiresIn || response.data.expires_in || 1800
      this.cachedToken = token
      this.tokenExpiresAt = Date.now() + expiresIn * 1000

      return token
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errorMsg || err.message || "Unknown error"
      throw new Error(`Failed to authenticate with Setu Account Service: ${msg}`)
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }

    if (this.productInstanceId) {
      headers["x-product-instance-id"] = this.productInstanceId
    }

    return headers
  }

  async createConsent(params: ConsentRequestParams): Promise<ConsentResponse> {
    if (!this.productInstanceId) {
      console.warn("[SetuAAService] SETU_PRODUCT_INSTANCE_ID is not configured. Setu AA requests may require this header from your Setu Bridge dashboard.")
    }

    const headers = await this.getHeaders()

    // Normalize phone number to standard 10 digits
    let cleanPhone = (params.phoneNumber || "").replace(/\D/g, "")
    if (cleanPhone.length > 10 && cleanPhone.startsWith("91")) {
      cleanPhone = cleanPhone.slice(cleanPhone.length - 10)
    }

    // Determine VUA (Virtual User Address)
    const vua = params.vpa || (cleanPhone ? (cleanPhone.includes("@") ? cleanPhone : `${cleanPhone}@setu`) : "9876543210@setu")

    const payload: Record<string, any> = {
      consentDuration: { unit: "MONTH", value: 12 },
      vua,
      consentTypes: ["TRANSACTIONS", "PROFILE", "SUMMARY"],
      fiTypes: ["DEPOSIT", "TERM_DEPOSIT", "RECURRING_DEPOSIT"],
      dataRange: {
        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      },
      dataLife: { unit: "MONTH", value: 12 },
      frequency: { unit: "DAY", value: 1 },
      dataFilter: [{ type: "TRANSACTIONAMOUNT", operator: ">=", value: "0" }],
      consentMode: "STORE",
      fetchType: "PERIODIC",
      purpose: {
        code: "101",
        text: "Personal Finance Management",
        refUri: "https://api.rebit.org.in/aa/purpose/101.xml",
        category: { type: "string" }
      },
      redirectUrl: this.redirectUrl,
      context: [
        { key: "redirect_url", value: this.redirectUrl },
        { key: "user_id", value: params.userId }
      ]
    }

    try {
      const response = await axios.post(`${this.baseUrl}/v2/consents`, payload, { headers })
      const data = response.data

      const rawStatus = (data.status || "PENDING").toUpperCase()
      const normalizedStatus = rawStatus === "ACTIVE" ? "APPROVED" : (rawStatus as ConsentResponse["status"])

      return {
        consentId: data.id || data.consentId || data.consent_id,
        status: normalizedStatus,
        url: data.url || data.redirectUrl || data.consentUrl || data.url_web || data.consent_url,
        createdAt: data.createdAt || new Date().toISOString(),
        expiresAt: data.consentExpiry || data.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    } catch (err: any) {
      const detail = err.response?.data?.errorMsg || err.response?.data?.message || JSON.stringify(err.response?.data) || err.message
      throw new Error(`Setu Consent Creation Failed (${err.response?.status || 'network'}): ${detail}`)
    }
  }

  async getConsentStatus(consentId: string): Promise<ConsentResponse> {
    const headers = await this.getHeaders()
    try {
      const response = await axios.get(`${this.baseUrl}/v2/consents/${consentId}`, { headers })
      const data = response.data
      const rawStatus = (data.status || "PENDING").toUpperCase()
      const normalizedStatus = rawStatus === "ACTIVE" ? "APPROVED" : (rawStatus as ConsentResponse["status"])

      return {
        consentId: data.id || consentId,
        status: normalizedStatus,
        url: data.url || data.redirectUrl,
        createdAt: data.createdAt || new Date().toISOString(),
        expiresAt: data.consentExpiry || data.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    } catch (err: any) {
      const detail = err.response?.data?.errorMsg || err.response?.data?.message || err.message
      throw new Error(`Setu Get Consent Status Failed: ${detail}`)
    }
  }

  async revokeConsent(consentId: string): Promise<boolean> {
    const headers = await this.getHeaders()
    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/consents/${consentId}/revoke`,
        {},
        { headers }
      )
      return response.status === 200
    } catch (err: any) {
      const detail = err.response?.data?.errorMsg || err.response?.data?.message || err.message
      throw new Error(`Setu Revoke Consent Failed: ${detail}`)
    }
  }

  async fetchFinancialData(consentId: string): Promise<AADataFetchResult> {
    const headers = await this.getHeaders()

    // 1. Create data session
    const sessionRes = await axios.post(
      `${this.baseUrl}/v2/sessions`,
      {
        consentId,
        format: "json",
        dataRange: {
          from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        }
      },
      { headers }
    )

    const sessionId = sessionRes.data.id || sessionRes.data.sessionId

    // 2. Fetch data from session
    const dataRes = await axios.get(`${this.baseUrl}/v2/sessions/${sessionId}`, { headers })
    const payload = dataRes.data

    // Parse FIU payload structure into standard model
    const accounts: AAAccount[] = []
    const transactions: AATransaction[] = []

    const payloadList = Array.isArray(payload?.Payload) ? payload.Payload : payload?.data ? [payload.data] : []

    for (const fipData of payloadList) {
      const accList = fipData.data?.account || fipData.account || []
      for (const acc of Array.isArray(accList) ? accList : [accList]) {
        if (!acc) continue
        accounts.push({
          bank: acc.profile?.holders?.holder?.[0]?.name || fipData.fipId || "Bank Account",
          accountType: acc.summary?.type || "Savings",
          maskedAccount: acc.maskedAccNumber || acc.maskedAccountNumber || "XXXXXX0000",
          balance: parseFloat(acc.summary?.currentBalance || acc.summary?.balance || "0")
        })

        const txnList = acc.transactions?.transaction || acc.transactions || []
        for (const txn of Array.isArray(txnList) ? txnList : [txnList]) {
          if (!txn) continue
          transactions.push({
            date: txn.transactionTimestamp?.slice(0, 10) || txn.txnDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
            description: txn.narration || txn.description || "Transaction",
            amount: parseFloat(txn.amount || "0"),
            type: txn.type === "DEBIT" ? "DEBIT" : "CREDIT",
            category: txn.type === "CREDIT" ? "Gig Income" : (txn.category || "Personal"),
            platform: txn.platform || null
          })
        }
      }
    }

    return { accounts, transactions }
  }
}
