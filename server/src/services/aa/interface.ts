export interface ConsentRequestParams {
  userId: string
  phoneNumber: string
  vpa?: string
}

export interface ConsentResponse {
  consentId: string
  status: "PENDING" | "APPROVED" | "REVOKED" | "EXPIRED" | "REJECTED"
  url?: string
  createdAt: string
  expiresAt: string
}

export interface AAAccount {
  bank: string
  accountType: string
  maskedAccount: string
  balance: number
}

export interface AATransaction {
  date: string
  description: string
  amount: number
  type: "CREDIT" | "DEBIT"
  category: string
  platform?: string | null
}

export interface AADataFetchResult {
  accounts: AAAccount[]
  transactions: AATransaction[]
}

export interface AccountAggregatorService {
  name: string
  createConsent(params: ConsentRequestParams): Promise<ConsentResponse>
  getConsentStatus(consentId: string): Promise<ConsentResponse>
  revokeConsent(consentId: string): Promise<boolean>
  fetchFinancialData(consentId: string): Promise<AADataFetchResult>
}
