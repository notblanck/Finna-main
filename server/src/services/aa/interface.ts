export interface ConsentRequestParams {
  userId?: string
  phoneNumber?: string
  vpa?: string
  dateRangeFrom?: string
  dateRangeTo?: string
  purpose?: string
}

export interface ConsentResponse {
  consentId: string
  status: string
  url?: string
  txnid?: string
  createdAt?: string
  expiresAt?: string
  raw?: any
}

export interface AAAccount {
  bank: string
  accountType: string
  maskedAccount: string
  balance: number
  fipId?: string
}

export interface AATransaction {
  txnId?: string
  date: string
  description: string
  amount: number
  type: "CREDIT" | "DEBIT"
  category: string
  platform?: string | null
  balanceAfter?: number
}

export interface AADataSessionResponse {
  sessionId: string
  status: string
  consentId: string
  raw?: any
}

export interface AADataFetchResult {
  accounts: AAAccount[]
  transactions: AATransaction[]
  sessionId?: string
  status?: string
  raw?: any
}

export interface AccountAggregatorService {
  name: string
  createConsent(params: ConsentRequestParams): Promise<ConsentResponse>
  getConsentStatus(consentId: string): Promise<ConsentResponse>
  revokeConsent(consentId: string): Promise<boolean>
  createDataSession(consentId: string, options?: { from?: string; to?: string }): Promise<AADataSessionResponse>
  fetchSessionData(sessionId: string): Promise<AADataFetchResult>
  fetchFinancialData(consentId: string): Promise<AADataFetchResult>
}
