import { AccountAggregatorService, ConsentRequestParams, ConsentResponse, AADataFetchResult, AAAccount, AATransaction } from "./interface.js"

export class MockAAService implements AccountAggregatorService {
  name = "Mock Account Aggregator (Sandbox)"

  private activeConsents: Map<string, ConsentResponse> = new Map()

  async createConsent(params: ConsentRequestParams): Promise<ConsentResponse> {
    const consentId = `CONSENT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    const createdAt = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

    const consent: ConsentResponse = {
      consentId,
      status: "PENDING",
      url: `/mock-aa/authorize?consentId=${consentId}`,
      createdAt,
      expiresAt
    }

    this.activeConsents.set(consentId, consent)
    return consent
  }

  async getConsentStatus(consentId: string): Promise<ConsentResponse> {
    if (this.activeConsents.has(consentId)) {
      return this.activeConsents.get(consentId)!
    }
    // Default mock response for demonstration
    return {
      consentId,
      status: "APPROVED",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  async revokeConsent(consentId: string): Promise<boolean> {
    if (this.activeConsents.has(consentId)) {
      const consent = this.activeConsents.get(consentId)!
      consent.status = "REVOKED"
      this.activeConsents.set(consentId, consent)
    }
    return true
  }

  async fetchFinancialData(consentId: string): Promise<AADataFetchResult> {
    const accounts: AAAccount[] = [
      {
        bank: "Demo Bank (SBI)",
        accountType: "Savings",
        maskedAccount: "XXXXXX4821",
        balance: 13700.0
      },
      {
        bank: "Paytm Payments Bank",
        accountType: "Current / Wallet",
        maskedAccount: "XXXXXX9012",
        balance: 3450.0
      }
    ]

    // Realistic 30-day transactions for Chennai gig worker (per TRD & Mock AA Spec)
    const transactions: AATransaction[] = [
      { date: "2026-09-01", description: "UBER PAYOUT", amount: 1850, type: "CREDIT", category: "Gig Income", platform: "uber" },
      { date: "2026-09-01", description: "Petrol - IOCL Guindy", amount: 450, type: "DEBIT", category: "Fuel" },
      { date: "2026-09-01", description: "SWIGGY DELIVERY EARNINGS", amount: 620, type: "CREDIT", category: "Gig Income", platform: "swiggy" },
      { date: "2026-09-02", description: "OLA PAYOUT", amount: 1340, type: "CREDIT", category: "Gig Income", platform: "ola" },
      { date: "2026-09-02", description: "Zomato Order / Meal", amount: 280, type: "DEBIT", category: "Food" },
      { date: "2026-09-03", description: "RAPIDO EARNINGS", amount: 410, type: "CREDIT", category: "Gig Income", platform: "rapido" },
      { date: "2026-09-05", description: "House Rent Transfer", amount: 9000, type: "DEBIT", category: "Rent" },
      { date: "2026-09-06", description: "ZEPTO PAYOUT", amount: 375, type: "CREDIT", category: "Gig Income", platform: "zepto" },
      { date: "2026-09-07", description: "Bike EMI - Bajaj Finance", amount: 2400, type: "DEBIT", category: "EMI" },
      { date: "2026-09-08", description: "BLINKIT DELIVERY PAYOUT", amount: 505, type: "CREDIT", category: "Gig Income", platform: "blinkit" },
      { date: "2026-09-08", description: "Airtel Recharge", amount: 299, type: "DEBIT", category: "Mobile Recharge" },
      { date: "2026-09-10", description: "Vehicle Service & Oil", amount: 850, type: "DEBIT", category: "Maintenance" },
      { date: "2026-09-11", description: "UBER PAYOUT", amount: 1975, type: "CREDIT", category: "Gig Income", platform: "uber" },
      { date: "2026-09-12", description: "Apollo Pharmacy", amount: 320, type: "DEBIT", category: "Medical" },
      { date: "2026-09-13", description: "Insurance Premium - ICICI Lombard", amount: 650, type: "DEBIT", category: "Insurance" },
      { date: "2026-09-14", description: "SWIGGY DELIVERY EARNINGS", amount: 700, type: "CREDIT", category: "Gig Income", platform: "swiggy" },
      { date: "2026-09-15", description: "ZOMATO PAYOUT", amount: 1450, type: "CREDIT", category: "Gig Income", platform: "zomato" },
      { date: "2026-09-16", description: "Petrol - BPCL Velachery", amount: 400, type: "DEBIT", category: "Fuel" },
      { date: "2026-09-17", description: "UBER PAYOUT", amount: 2150, type: "CREDIT", category: "Gig Income", platform: "uber" },
      { date: "2026-09-18", description: "Tea & Snacks - A2B", amount: 160, type: "DEBIT", category: "Food" },
      { date: "2026-09-19", description: "RAPIDO EARNINGS", amount: 620, type: "CREDIT", category: "Gig Income", platform: "rapido" },
      { date: "2026-09-20", description: "ZEPTO PAYOUT", amount: 890, type: "CREDIT", category: "Gig Income", platform: "zepto" },
      { date: "2026-09-21", description: "Grocery Store - Nilgiris", amount: 750, type: "DEBIT", category: "Personal" },
      { date: "2026-09-22", description: "SWIGGY DELIVERY EARNINGS", amount: 1100, type: "CREDIT", category: "Gig Income", platform: "swiggy" },
      { date: "2026-09-23", description: "Petrol - IOCL OMR", amount: 480, type: "DEBIT", category: "Fuel" },
      { date: "2026-09-24", description: "ZOMATO WEEKEND SURGE", amount: 1680, type: "CREDIT", category: "Gig Income", platform: "zomato" }
    ]

    return { accounts, transactions }
  }
}
