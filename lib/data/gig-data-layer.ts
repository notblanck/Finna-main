/**
 * FINNA Future Gig-Economy Data Layer (Simulated / Open Protocol)
 * 
 * NOTE TO AUDITORS & SYSTEM:
 * This layer simulates future Open Network for Gig Work / Direct Platform Worker Data APIs.
 * It is strictly separated from Account Aggregator (AA) banking data and clearly labeled
 * as a simulated protocol source.
 */

export interface GigSettlement {
  settlementId: string
  period: string
  grossAmount: number
  platformCommission: number
  tdsDeducted: number // Section 194-O (1%)
  otherDeductions: number
  netPaid: number
  payoutDate: string
  status: "SETTLED"
}

export interface PlatformGigProfile {
  platform: "Swiggy" | "Uber"
  serviceType: "Delivery (Food/Instamart)" | "Rides (Moto/Auto)"
  tenureMonths: number
  rating: number
  monthlyGrossEarnings: number
  monthlyNetEarnings: number
  weeklyEarningsAvg: number
  workingDaysPerMonth: number
  activeHoursPerDay: number
  completedTripsOrOrders: number
  incentivesEarned: number // Surge, rain, late-night & milestone bonuses
  platformCommissions: number
  tdsDeductions: number
  gearDeductions: number
  earningsTrend: "growing" | "stable" | "declining"
  earningsTrendPct: number // Month-over-month %
  incomeVolatility: "low" | "medium" | "high"
  volatilityIndex: number // 0 (rock solid) to 1.0 (extreme swing)
  settlementHistory: GigSettlement[]
  lastSyncTimestamp: string
}

export interface FutureGigDataState {
  sourceType: "SIMULATED_FUTURE_GIG_PROTOCOL"
  description: "Direct platform worker telemetry via simulated worker protocol (distinct from RBI Account Aggregator banking feed)"
  platforms: PlatformGigProfile[]
  aggregate: {
    totalGrossMonthly: number
    totalNetMonthly: number
    totalWeeklyAvg: number
    totalActiveDays: number
    avgDailyHours: number
    totalCompletedOrdersOrRides: number
    totalIncentives: number
    totalPlatformCommissions: number
    totalTdsDeducted: number
    overallTrend: "stable" | "growing" | "declining"
    overallVolatility: "low" | "medium" | "high"
    compositeVolatilityIndex: number
  }
}

export const BASELINE_GIG_DATA: FutureGigDataState = {
  sourceType: "SIMULATED_FUTURE_GIG_PROTOCOL",
  description: "Direct platform worker telemetry via simulated worker protocol (distinct from RBI Account Aggregator banking feed)",
  platforms: [
    {
      platform: "Swiggy",
      serviceType: "Delivery (Food/Instamart)",
      tenureMonths: 18,
      rating: 4.85,
      monthlyGrossEarnings: 20250,
      monthlyNetEarnings: 18400,
      weeklyEarningsAvg: 4600,
      workingDaysPerMonth: 26,
      activeHoursPerDay: 5.5,
      completedTripsOrOrders: 215,
      incentivesEarned: 2400,
      platformCommissions: 1650,
      tdsDeductions: 184, // 1% under Section 194-O
      gearDeductions: 16,
      earningsTrend: "growing",
      earningsTrendPct: 4.5,
      incomeVolatility: "low",
      volatilityIndex: 0.16,
      settlementHistory: [
        { settlementId: "SW-SETT-0928", period: "Sep 21 - Sep 27, 2026", grossAmount: 5320, platformCommission: 430, tdsDeducted: 48, otherDeductions: 0, netPaid: 4850, payoutDate: "2026-09-28", status: "SETTLED" },
        { settlementId: "SW-SETT-0921", period: "Sep 14 - Sep 20, 2026", grossAmount: 5080, platformCommission: 410, tdsDeducted: 46, otherDeductions: 4, netPaid: 4620, payoutDate: "2026-09-21", status: "SETTLED" },
        { settlementId: "SW-SETT-0914", period: "Sep 07 - Sep 13, 2026", grossAmount: 4940, platformCommission: 410, tdsDeducted: 44, otherDeductions: 6, netPaid: 4480, payoutDate: "2026-09-14", status: "SETTLED" },
        { settlementId: "SW-SETT-0907", period: "Aug 31 - Sep 06, 2026", grossAmount: 4910, platformCommission: 410, tdsDeducted: 44, otherDeductions: 6, netPaid: 4450, payoutDate: "2026-09-07", status: "SETTLED" },
      ],
      lastSyncTimestamp: "2026-09-28T18:30:00Z",
    },
    {
      platform: "Uber",
      serviceType: "Rides (Moto/Auto)",
      tenureMonths: 12,
      rating: 4.88,
      monthlyGrossEarnings: 15450,
      monthlyNetEarnings: 14050,
      weeklyEarningsAvg: 3512,
      workingDaysPerMonth: 24,
      activeHoursPerDay: 3.5,
      completedTripsOrOrders: 145,
      incentivesEarned: 1400,
      platformCommissions: 1250,
      tdsDeductions: 140, // 1% under Section 194-O
      gearDeductions: 10,
      earningsTrend: "stable",
      earningsTrendPct: 1.2,
      incomeVolatility: "low",
      volatilityIndex: 0.19,
      settlementHistory: [
        { settlementId: "UB-SETT-0926", period: "Sep 18 - Sep 24, 2026", grossAmount: 3950, platformCommission: 310, tdsDeducted: 36, otherDeductions: 4, netPaid: 3600, payoutDate: "2026-09-26", status: "SETTLED" },
        { settlementId: "UB-SETT-0919", period: "Sep 11 - Sep 17, 2026", grossAmount: 3800, platformCommission: 310, tdsDeducted: 35, otherDeductions: 5, netPaid: 3450, payoutDate: "2026-09-19", status: "SETTLED" },
        { settlementId: "UB-SETT-0912", period: "Sep 04 - Sep 10, 2026", grossAmount: 3900, platformCommission: 310, tdsDeducted: 35, otherDeductions: 5, netPaid: 3550, payoutDate: "2026-09-12", status: "SETTLED" },
      ],
      lastSyncTimestamp: "2026-09-27T19:15:00Z",
    },
  ],
  aggregate: {
    totalGrossMonthly: 35700,
    totalNetMonthly: 32450,
    totalWeeklyAvg: 8112,
    totalActiveDays: 26, // Dual platform active days
    avgDailyHours: 9.0, // 5.5h Swiggy + 3.5h Uber
    totalCompletedOrdersOrRides: 360,
    totalIncentives: 3800,
    totalPlatformCommissions: 2900,
    totalTdsDeducted: 324,
    overallTrend: "stable",
    overallVolatility: "low",
    compositeVolatilityIndex: 0.17,
  },
}

let activeGigData: FutureGigDataState = JSON.parse(JSON.stringify(BASELINE_GIG_DATA))

export function getFutureGigData(): FutureGigDataState {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("finna_gig_override")
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Fallback
    }
  }
  return activeGigData
}

export function updateFutureGigData(updater: (prev: FutureGigDataState) => FutureGigDataState): FutureGigDataState {
  activeGigData = updater(activeGigData)
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("finna_gig_override", JSON.stringify(activeGigData))
      window.dispatchEvent(new Event("finna_data_updated"))
    } catch {
      // Ignored
    }
  }
  return activeGigData
}

export function resetFutureGigData(): FutureGigDataState {
  activeGigData = JSON.parse(JSON.stringify(BASELINE_GIG_DATA))
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("finna_gig_override")
      window.dispatchEvent(new Event("finna_data_updated"))
    } catch {
      // Ignored
    }
  }
  return activeGigData
}
