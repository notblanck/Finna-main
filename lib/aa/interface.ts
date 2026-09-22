// ==============================================================================
// Account Aggregator (AA) Interface
// Compatible with RBI ReBIT AA Specifications & Setu AA FIU v2 API
// ==============================================================================

export interface CreateConsentParams {
  userId: string
  phone?: string
  vpa?: string
  fiTypes: string[]
  dateRangeFrom: string
  dateRangeTo: string
}

export interface ConsentResponse {
  id: string
  consentHandle: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED"
  redirectUrl?: string
  expiresAt: string
}

export interface FIDataSessionResponse {
  sessionId: string
  status: "PENDING" | "COMPLETED" | "FAILED"
}

export interface AATransaction {
  txnId: string
  date: string
  amount: number
  type: "CREDIT" | "DEBIT"
  narration: string
  balanceAfter?: number
  categoryGuess: string
  mappedPlatform?: string
}

export interface AAProvider {
  name: string
  isSandbox: boolean
  createConsent(params: CreateConsentParams): Promise<ConsentResponse>
  getConsentStatus(consentId: string): Promise<ConsentResponse>
  revokeConsent(consentId: string): Promise<{ success: boolean; status: string }>
  requestFIData(consentId: string): Promise<FIDataSessionResponse>
  fetchFIData(sessionId: string): Promise<{ accounts: any[]; transactions: AATransaction[] }>
  handleWebhook(payload: any): Promise<{ handled: boolean; event: string }>
}
