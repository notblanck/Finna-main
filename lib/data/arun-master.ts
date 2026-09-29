/**
 * FINNA Arun Kumar Master Data Source (Single Source of Truth)
 * 
 * Represents Arun Kumar: 29-year-old gig partner based in Chennai, Tamil Nadu.
 * Works across Swiggy (Delivery) and Uber (Rides / Moto).
 * 
 * Every page, calculation, and Copilot answer reads from this authoritative model.
 */

export interface UserProfile {
  id: string
  fullName: string
  age: number
  city: string
  state: string
  occupation: string
  dependents: number
  vehicleType: "two_wheeler" | "four_wheeler" | "none"
  vehicleName: string
  hasOwnVehicle: boolean
  panLast4: string
  aadhaarLinked: boolean
  eShramId: string
  preferredLanguage: "en" | "ta" | "hi"
}

export interface BankAccount {
  id: string
  bankName: string
  accountType: "Savings" | "Current"
  accountNumber: string
  maskedAccount: string
  balance: number
  fipId: string
  lastSynced: string
}

export interface Transaction {
  id: string
  date: string
  amount: number
  type: "CREDIT" | "DEBIT"
  category: "gig_payout" | "rent" | "emi" | "fuel" | "groceries" | "utilities" | "maintenance" | "food" | "savings" | "transfer"
  description: string
  platform?: "swiggy" | "uber" | "zomato" | "rapido" | null
  balanceAfter: number
}

export interface Obligation {
  id: string
  type: "rent" | "emi" | "utility"
  payee: string
  amount: number
  dueDayOfMonth: number
  frequency: "monthly"
  status: "active"
}

export interface InsuranceItem {
  id: string
  type: "vehicle" | "accidental" | "health" | "life"
  provider: string
  policyNumber: string
  coverageAmount: number
  annualPremium: number
  validUntil: string
  status: "active" | "missing"
}

export interface SavingsBucket {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  purpose: string
}

export interface ArunMasterData {
  profile: UserProfile
  bankAccounts: BankAccount[]
  transactions: Transaction[]
  obligations: Obligation[]
  savings: SavingsBucket[]
  insurance: InsuranceItem[]
}

// -------------------------------------------------------------
// Baseline Arun Record (Single Source of Truth)
// -------------------------------------------------------------
export const ARUN_BASELINE_DATA: ArunMasterData = {
  profile: {
    id: "arun-kumar-chennai-2026",
    fullName: "Arun Kumar",
    age: 29,
    city: "Chennai",
    state: "Tamil Nadu",
    occupation: "Gig Delivery & Ride Partner",
    dependents: 2, // Wife + 4-year-old child
    vehicleType: "two_wheeler",
    vehicleName: "Honda Activa 6G (TN-09-CB-4892)",
    hasOwnVehicle: true,
    panLast4: "8492",
    aadhaarLinked: true,
    eShramId: "UAN-1290-4821-9943",
    preferredLanguage: "en",
  },
  bankAccounts: [
    {
      id: "acc-sbi-arun",
      bankName: "State Bank of India",
      accountType: "Savings",
      accountNumber: "3920192841",
      maskedAccount: "•••• 2841",
      balance: 34250,
      fipId: "FIP-SBI-IN",
      lastSynced: "Just now (via Setu AA)",
    },
    {
      id: "acc-hdfc-arun",
      bankName: "HDFC Bank",
      accountType: "Savings",
      accountNumber: "5010098492",
      maskedAccount: "•••• 9012",
      balance: 8430,
      fipId: "FIP-HDFC-IN",
      lastSynced: "Just now (via Setu AA)",
    },
  ],
  obligations: [
    {
      id: "obl-rent",
      type: "rent",
      payee: "House Landlord (Velachery, Chennai)",
      amount: 6500,
      dueDayOfMonth: 5,
      frequency: "monthly",
      status: "active",
    },
    {
      id: "obl-bike-emi",
      type: "emi",
      payee: "Bajaj Finance (Two-Wheeler Loan)",
      amount: 3200,
      dueDayOfMonth: 10,
      frequency: "monthly",
      status: "active",
    },
  ],
  savings: [
    {
      id: "sav-emergency",
      name: "Emergency Fund",
      targetAmount: 25000,
      currentAmount: 8000,
      purpose: "Medical & vehicle breakdown reserve",
    },
    {
      id: "sav-rainy-day",
      name: "Liquid Bank Savings",
      targetAmount: 20000,
      currentAmount: 14200,
      purpose: "Weekly smoothing fund",
    },
  ],
  insurance: [
    {
      id: "ins-activa-comp",
      type: "vehicle",
      provider: "Acko General Insurance",
      policyNumber: "ACKO-2W-893120",
      coverageAmount: 75000,
      annualPremium: 1450,
      validUntil: "2027-04-15",
      status: "active",
    },
    {
      id: "ins-eshram-pmsby",
      type: "accidental",
      provider: "e-Shram (PMSBY National Cover)",
      policyNumber: "PMSBY-UAN-4821",
      coverageAmount: 200000,
      annualPremium: 20,
      validUntil: "2027-05-31",
      status: "active",
    },
    {
      id: "ins-health-missing",
      type: "health",
      provider: "None",
      policyNumber: "N/A",
      coverageAmount: 0,
      annualPremium: 0,
      validUntil: "N/A",
      status: "missing",
    },
  ],
  transactions: [
    // Recent 14 Days Statement
    { id: "tx-1", date: "2026-09-28", amount: 4850, type: "CREDIT", category: "gig_payout", description: "Swiggy Weekly Settlement - Payout", platform: "swiggy", balanceAfter: 42680 },
    { id: "tx-2", date: "2026-09-27", amount: 420, type: "DEBIT", category: "fuel", description: "Indian Oil Petrol Pump - Velachery", platform: null, balanceAfter: 37830 },
    { id: "tx-3", date: "2026-09-26", amount: 3600, type: "CREDIT", category: "gig_payout", description: "Uber India Technology - Weekly Payout", platform: "uber", balanceAfter: 38250 },
    { id: "tx-4", date: "2026-09-25", amount: 380, type: "DEBIT", category: "fuel", description: "Bharat Petroleum - Guindy", platform: null, balanceAfter: 34650 },
    { id: "tx-5", date: "2026-09-24", amount: 650, type: "DEBIT", category: "groceries", description: "Reliance Fresh - Vegetables & Milk", platform: null, balanceAfter: 35030 },
    { id: "tx-6", date: "2026-09-22", amount: 499, type: "DEBIT", category: "utilities", description: "Jio Prepaid 84-Day Plan Recharge", platform: null, balanceAfter: 35680 },
    { id: "tx-7", date: "2026-09-21", amount: 4620, type: "CREDIT", category: "gig_payout", description: "Swiggy Weekly Settlement - Payout", platform: "swiggy", balanceAfter: 36179 },
    { id: "tx-8", date: "2026-09-20", amount: 450, type: "DEBIT", category: "maintenance", description: "Activa Oil Change & Brake Tightening", platform: null, balanceAfter: 31559 },
    { id: "tx-9", date: "2026-09-18", amount: 3450, type: "CREDIT", category: "gig_payout", description: "Uber India Technology - Weekly Payout", platform: "uber", balanceAfter: 32009 },
    { id: "tx-10", date: "2026-09-14", amount: 4480, type: "CREDIT", category: "gig_payout", description: "Swiggy Weekly Settlement - Payout", platform: "swiggy", balanceAfter: 28559 },
    { id: "tx-11", date: "2026-09-10", amount: 3200, type: "DEBIT", category: "emi", description: "ACH Debit - TVS/Bajaj Finance 2W EMI", platform: null, balanceAfter: 24079 },
    { id: "tx-12", date: "2026-09-07", amount: 3550, type: "CREDIT", category: "gig_payout", description: "Uber India Technology - Weekly Payout", platform: "uber", balanceAfter: 27279 },
    { id: "tx-13", date: "2026-09-05", amount: 6500, type: "DEBIT", category: "rent", description: "UPI to Landlord S. Ramanathan (House Rent)", platform: null, balanceAfter: 23729 },
    { id: "tx-14", date: "2026-09-01", amount: 4450, type: "CREDIT", category: "gig_payout", description: "Swiggy Weekly Settlement - Payout", platform: "swiggy", balanceAfter: 30229 },
  ],
}

// -------------------------------------------------------------
// Global In-Memory Store with LocalStorage & Overwrite Capability
// Allows testing data changes (Rule #14) dynamically
// -------------------------------------------------------------
let activeMasterData: ArunMasterData = { ...ARUN_BASELINE_DATA }

export function getArunMasterData(): ArunMasterData {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("finna_arun_override")
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Use in-memory fallback
    }
  }
  return activeMasterData
}

export function updateArunMasterData(partial: Partial<ArunMasterData>): ArunMasterData {
  activeMasterData = {
    ...activeMasterData,
    ...partial,
    profile: { ...activeMasterData.profile, ...(partial.profile || {}) },
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("finna_arun_override", JSON.stringify(activeMasterData))
      // Trigger storage event for live reactive update across components
      window.dispatchEvent(new Event("finna_data_updated"))
    } catch {
      // Ignored
    }
  }
  return activeMasterData
}

export function resetArunMasterData(): ArunMasterData {
  activeMasterData = JSON.parse(JSON.stringify(ARUN_BASELINE_DATA))
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("finna_arun_override")
      window.dispatchEvent(new Event("finna_data_updated"))
    } catch {
      // Ignored
    }
  }
  return activeMasterData
}
