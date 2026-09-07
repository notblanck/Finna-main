import axios from "axios"
import { AccountAggregatorService, ConsentRequestParams, ConsentResponse, AADataFetchResult, AAAccount, AATransaction } from "./interface.js"

export class SetuAAService implements AccountAggregatorService {
  name = "Setu Account Aggregator (Sandbox / Production)"

  private baseUrl: string
  private clientId: string
  private clientSecret: string
  private productInstanceId: string

  constructor() {
    this.baseUrl = process.env.SETU_BASE_URL || "https://fiu-sandbox.setu.co"
    this.clientId = process.env.SETU_CLIENT_ID || ""
    this.clientSecret = process.env.SETU_CLIENT_SECRET || ""
    this.productInstanceId = process.env.SETU_PRODUCT_INSTANCE_ID || ""
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      "x-client-id": this.clientId,
      "x-client-secret": this.clientSecret,
      "x-product-instance-id": this.productInstanceId
    }
  }

  async createConsent(params: ConsentRequestParams): Promise<ConsentResponse> {
    const payload = {
      consentDuration: { unit: "MONTH", value: 12 },
      vpa: params.vpa || `${params.phoneNumber}@setu`,
      dataRange: {
        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      },
      dataLife: { unit: "MONTH", value: 12 },
      frequency: { unit: "DAILY", value: 1 },
      dataFilter: [{ type: "TRANSACTION", operator: "GREATER_THAN", value: "0" }],
      fetchType: "PERIODIC"
    }

    const response = await axios.post(`${this.baseUrl}/consents`, payload, {
      headers: this.getHeaders()
    })

    const data = response.data
    return {
      consentId: data.id,
      status: data.status || "PENDING",
      url: data.url,
      createdAt: data.createdAt || new Date().toISOString(),
      expiresAt: data.consentExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  async getConsentStatus(consentId: string): Promise<ConsentResponse> {
    const response = await axios.get(`${this.baseUrl}/consents/${consentId}`, {
      headers: this.getHeaders()
    })
    const data = response.data
    return {
      consentId: data.id,
      status: data.status,
      createdAt: data.createdAt,
      expiresAt: data.consentExpiry
    }
  }

  async revokeConsent(consentId: string): Promise<boolean> {
    const response = await axios.post(
      `${this.baseUrl}/consents/${consentId}/revoke`,
      {},
      { headers: this.getHeaders() }
    )
    return response.status === 200
  }

  async fetchFinancialData(consentId: string): Promise<AADataFetchResult> {
    // 1. Create data session
    const sessionRes = await axios.post(
      `${this.baseUrl}/sessions`,
      {
        consentId,
        format: "json",
        dataRange: {
          from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        }
      },
      { headers: this.getHeaders() }
    )

    const sessionId = sessionRes.data.id

    // 2. Fetch data from session
    const dataRes = await axios.get(`${this.baseUrl}/sessions/${sessionId}`, {
      headers: this.getHeaders()
    })

    const payload = dataRes.data

    // Parse FIU payload structure into FINNA AA standard model
    const accounts: AAAccount[] = []
    const transactions: AATransaction[] = []

    if (payload?.Payload) {
      for (const fipData of payload.Payload) {
        for (const acc of fipData.data?.account || []) {
          accounts.push({
            bank: acc.profile?.holders?.holder?.[0]?.name || fipData.fipId || "Bank Account",
            accountType: acc.summary?.type || "Savings",
            maskedAccount: acc.maskedAccNumber || "XXXXXX0000",
            balance: parseFloat(acc.summary?.currentBalance || "0")
          })

          for (const txn of acc.transactions?.transaction || []) {
            transactions.push({
              date: txn.transactionTimestamp?.slice(0, 10) || new Date().toISOString().slice(0, 10),
              description: txn.narration || "Transaction",
              amount: parseFloat(txn.amount || "0"),
              type: txn.type === "DEBIT" ? "DEBIT" : "CREDIT",
              category: txn.type === "CREDIT" ? "Gig Income" : "Personal",
              platform: null
            })
          }
        }
      }
    }

    return { accounts, transactions }
  }
}
