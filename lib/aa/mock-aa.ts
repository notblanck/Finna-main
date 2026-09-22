import { AAProvider, CreateConsentParams, ConsentResponse, FIDataSessionResponse, AATransaction } from "./interface"

export class MockAAProvider implements AAProvider {
  name = "Mock AA Provider (Sandbox)"
  isSandbox = true

  async createConsent(params: CreateConsentParams): Promise<ConsentResponse> {
    const consentId = `consent-mock-${Date.now()}`
    return {
      id: consentId,
      consentHandle: `handle-${Date.now()}`,
      status: "APPROVED",
      redirectUrl: `/aa?consentId=${consentId}&mockApproved=true`,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  async getConsentStatus(consentId: string): Promise<ConsentResponse> {
    return {
      id: consentId,
      consentHandle: `handle-${consentId}`,
      status: "APPROVED",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  async revokeConsent(consentId: string): Promise<{ success: boolean; status: string }> {
    return { success: true, status: "REVOKED" }
  }

  async requestFIData(consentId: string): Promise<FIDataSessionResponse> {
    return {
      sessionId: `session-mock-${Date.now()}`,
      status: "COMPLETED",
    }
  }

  async fetchFIData(sessionId: string): Promise<{ accounts: any[]; transactions: AATransaction[] }> {
    const accounts = [
      {
        accountNumber: "•••• 2841",
        bank: "State Bank of India",
        type: "SAVINGS",
        balance: 42680.50,
      }
    ]

    const transactions: AATransaction[] = [
      {
        txnId: "tx-aa-01",
        date: "2026-09-20",
        amount: 1820.00,
        type: "CREDIT",
        narration: "UPI/UBER INDIA SYSTEMS PVT/WEEKLY-PAYOUT",
        balanceAfter: 42680.50,
        categoryGuess: "Gig Income",
        mappedPlatform: "uber",
      },
      {
        txnId: "tx-aa-02",
        date: "2026-09-19",
        amount: 450.00,
        type: "DEBIT",
        narration: "POS/IOCL PETROL PUMP ANNA NAGAR/CHENNAI",
        balanceAfter: 40860.50,
        categoryGuess: "Fuel",
        mappedPlatform: undefined,
      },
      {
        txnId: "tx-aa-03",
        date: "2026-09-18",
        amount: 1450.00,
        type: "CREDIT",
        narration: "UPI/BUNDL TECH SWIGGY/RIDER-INCENTIVE",
        balanceAfter: 41310.50,
        categoryGuess: "Gig Income",
        mappedPlatform: "swiggy",
      },
      {
        txnId: "tx-aa-04",
        date: "2026-09-17",
        amount: 680.00,
        type: "CREDIT",
        narration: "UPI/ROPPEN TRANSPO RAPIDO/DAILY-SETTLE",
        balanceAfter: 39860.50,
        categoryGuess: "Gig Income",
        mappedPlatform: "rapido",
      },
      {
        txnId: "tx-aa-05",
        date: "2026-09-16",
        amount: 1200.00,
        type: "DEBIT",
        narration: "UPI/HONDA SERVICE CENTER/BRAKE-OIL-PAD",
        balanceAfter: 39180.50,
        categoryGuess: "Vehicle Maintenance",
        mappedPlatform: undefined,
      },
    ]

    return { accounts, transactions }
  }

  async handleWebhook(payload: any): Promise<{ handled: boolean; event: string }> {
    return { handled: true, event: payload?.type || "CONSENT_STATUS_UPDATE" }
  }
}

export const mockAA = new MockAAProvider()
