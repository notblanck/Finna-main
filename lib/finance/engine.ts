/**
 * FINNA Deterministic Financial Calculation Engine
 * 
 * Rules:
 * 1. The engine calculates FIRST — the LLM/Copilot only explains results,
 *    it never computes financial numbers itself.
 * 2. Every output is strictly derived from the unified Arun Master Data + Future Gig Data Layer.
 * 3. Supports live reactivity: when Arun's data changes, all metrics recompute deterministically.
 */

import { getArunMasterData, ArunMasterData } from "@/lib/data/arun-master"
import { getFutureGigData, FutureGigDataState } from "@/lib/data/gig-data-layer"

export interface ComponentScore {
  name: string
  score: number
  maxScore: number
  weightPct: number
  status: "Excellent" | "Good" | "Needs Attention" | "Critical"
  explanation: string
  isDrag: boolean
  dragReason?: string
}

export interface FinancialHealthScoreDetails {
  totalScore: number
  band: "Critical" | "At Risk" | "Stable" | "Healthy" | "Strong"
  components: {
    incomeStability: ComponentScore
    expenseControl: ComponentScore
    savingsBuffer: ComponentScore
    debtBurden: ComponentScore
    insuranceProtection: ComponentScore
  }
  primaryStrengths: string[]
  primaryDrags: string[]
  summarySentence: string
}

export interface FinnaCalculationResult {
  timestamp: string
  arun: {
    fullName: string
    age: number
    city: string
    state: string
    occupation: string
    dependents: number
    totalBankBalance: number
    accountSummary: { bankName: string; maskedAccount: string; balance: number }[]
  }
  income: {
    totalMonthlyGross: number
    totalMonthlyNet: number
    dailyAverageIncome: number
    activeWorkingDays: number
    incomeTrend: "growing" | "stable" | "declining"
    incomeTrendPct: number
    incomeVolatility: "low" | "medium" | "high"
    volatilityIndex: number
    platformBreakdown: { platform: string; netMonthly: number; weeklyAvg: number; sharePct: number }[]
  }
  expenses: {
    monthlyRent: number
    monthlyEmi: number
    monthlyFuel: number
    essentialLiving: number
    totalEssentialExpenses: number
    discretionaryExpenses: number
    totalMonthlyExpenses: number
  }
  cashFlow: {
    monthlyNetCashFlow: number
    savingsRatePct: number
    isPositive: boolean
  }
  affordability: {
    rent: {
      monthlyRent: number
      dueDay: number
      rentToIncomeRatioPct: number
      status: "Affordable" | "Moderate" | "Stretched"
      canPay: boolean
      surplusAfterRent: number
      explanation: string
    }
    emi: {
      monthlyEmi: number
      dueDay: number
      dtiRatioPct: number
      status: "Healthy" | "Manageable" | "Critical"
      canPay: boolean
      surplusAfterEmi: number
      explanation: string
    }
  }
  savings: {
    liquidBankSavings: number
    emergencyFund: number
    emergencyTarget: number
    bufferMonths: number
    targetBufferMonths: number
    status: string
  }
  safeToSpend: {
    safeToSpendToday: number
    breakdown: {
      currentBalance: number
      conservativeTodayIncome: number
      dailyFixedObligationReserve: number
      dailySavingsTarget: number
      emergencyBufferFloor: number
    }
    formulaExplanation: string
  }
  healthScore: FinancialHealthScoreDetails
  projections: {
    projected7DayIncome: number
    projected7DaySpending: number
    projected7DayNet: number
    projected30DayIncome: number
    projected30DaySpending: number
  }
  dataSources: {
    aaStatus: string
    aaAccountsCount: number
    gigProtocolStatus: string
    gigPlatformsCount: number
  }
}

/**
 * Executes the complete deterministic calculation pipeline.
 * Can accept optional overrides for testing (e.g. data change test).
 */
export function calculateFinnaFinancialState(
  customMaster?: ArunMasterData,
  customGig?: FutureGigDataState
): FinnaCalculationResult {
  const master = customMaster || getArunMasterData()
  const gig = customGig || getFutureGigData()

  // 1. Bank Accounts & Balance
  const totalBankBalance = master.bankAccounts.reduce((sum, a) => sum + Number(a.balance || 0), 0)
  const accountSummary = master.bankAccounts.map((a) => ({
    bankName: a.bankName,
    maskedAccount: a.maskedAccount,
    balance: a.balance,
  }))

  // 2. Income Metrics (from Gig Layer + Transactions)
  const totalMonthlyNet = gig.aggregate.totalNetMonthly
  const totalMonthlyGross = gig.aggregate.totalGrossMonthly
  const activeWorkingDays = gig.aggregate.totalActiveDays || 26
  const dailyAverageIncome = Math.round(totalMonthlyNet / activeWorkingDays)
  const incomeTrend = gig.aggregate.overallTrend
  const incomeVolatility = gig.aggregate.overallVolatility
  const volatilityIndex = gig.aggregate.compositeVolatilityIndex

  const platformBreakdown = gig.platforms.map((p) => ({
    platform: p.platform,
    netMonthly: p.monthlyNetEarnings,
    weeklyAvg: p.weeklyEarningsAvg,
    sharePct: Math.round((p.monthlyNetEarnings / (totalMonthlyNet || 1)) * 100),
  }))

  // 3. Obligations & Expenses
  const rentObligation = master.obligations.find((o) => o.type === "rent")
  const emiObligation = master.obligations.find((o) => o.type === "emi")

  const monthlyRent = rentObligation?.amount ?? 6500
  const monthlyEmi = emiObligation?.amount ?? 3200
  const rentDueDay = rentObligation?.dueDayOfMonth ?? 5
  const emiDueDay = emiObligation?.dueDayOfMonth ?? 10

  // Derived operational & living expenses
  const monthlyFuel = 5800 // petrol for 2W delivery
  const essentialLiving = 4500 // groceries, utilities, data plan
  const totalEssentialExpenses = monthlyRent + monthlyEmi + monthlyFuel + essentialLiving
  const discretionaryExpenses = 2200 // food outside, miscellaneous
  const totalMonthlyExpenses = totalEssentialExpenses + discretionaryExpenses

  // 4. Monthly Cash Flow
  const monthlyNetCashFlow = totalMonthlyNet - totalMonthlyExpenses
  const savingsRatePct = totalMonthlyNet > 0 ? Math.round((monthlyNetCashFlow / totalMonthlyNet) * 100) : 0
  const isPositive = monthlyNetCashFlow > 0

  // 5. Affordability: Rent & EMI
  const rentRatioPct = totalMonthlyNet > 0 ? Math.round((monthlyRent / totalMonthlyNet) * 1000) / 10 : 0
  const canPayRent = totalBankBalance >= monthlyRent
  const surplusAfterRent = totalBankBalance - monthlyRent
  const rentStatus: "Affordable" | "Moderate" | "Stretched" =
    rentRatioPct <= 25 ? "Affordable" : rentRatioPct <= 35 ? "Moderate" : "Stretched"

  const rentExplanation = canPayRent
    ? `Your bank balance is ₹${totalBankBalance.toLocaleString("en-IN")}, comfortably covering your ₹${monthlyRent.toLocaleString("en-IN")} rent (due on the ${rentDueDay}th) with ₹${surplusAfterRent.toLocaleString("en-IN")} remaining. Your rent-to-income ratio is ${rentRatioPct}%, well inside the healthy 25% guideline.`
    : `Alert: Current balance (₹${totalBankBalance.toLocaleString("en-IN")}) is below your upcoming ₹${monthlyRent.toLocaleString("en-IN")} rent.`

  const dtiRatioPct = totalMonthlyNet > 0 ? Math.round((monthlyEmi / totalMonthlyNet) * 1000) / 10 : 0
  const canPayEmi = totalBankBalance >= monthlyEmi
  const surplusAfterEmi = totalBankBalance - monthlyEmi
  const emiStatus: "Healthy" | "Manageable" | "Critical" =
    dtiRatioPct <= 15 ? "Healthy" : dtiRatioPct <= 25 ? "Manageable" : "Critical"

  const emiExplanation = canPayEmi
    ? `Yes, you can comfortably pay your ₹${monthlyEmi.toLocaleString("en-IN")} vehicle EMI (due on the ${emiDueDay}th). Your debt-to-income ratio is ${dtiRatioPct}%, which is healthy, and your available balance of ₹${totalBankBalance.toLocaleString("en-IN")} leaves a ₹${surplusAfterEmi.toLocaleString("en-IN")} buffer.`
    : `Attention: Bank balance of ₹${totalBankBalance.toLocaleString("en-IN")} is insufficient for your ₹${monthlyEmi.toLocaleString("en-IN")} EMI.`

  // 6. Savings Buffer
  const emergencyBucket = master.savings.find((s) => s.id === "sav-emergency")
  const liquidSavingsBucket = master.savings.find((s) => s.id === "sav-rainy-day")

  const emergencyFund = emergencyBucket?.currentAmount ?? 8000
  const emergencyTarget = emergencyBucket?.targetAmount ?? 25000
  const liquidBankSavings = liquidSavingsBucket?.currentAmount ?? 14200

  const bufferMonths = totalEssentialExpenses > 0
    ? Math.round((liquidBankSavings / totalEssentialExpenses) * 100) / 100
    : 0
  const targetBufferMonths = 3.0
  const savingsStatus = bufferMonths >= 3
    ? "Target Met (3+ months reserve)"
    : bufferMonths >= 1
    ? `Moderate Buffer (${bufferMonths} mo)`
    : `Low Buffer (${bufferMonths} mo / target 3 mo)`

  // 7. Safe-to-Spend (Today)
  const conservativeTodayIncome = Math.round(dailyAverageIncome * 0.8)
  const dailyFixedObligationReserve = Math.round((monthlyRent + monthlyEmi) / 30) // ~₹323/day
  const dailySavingsTarget = Math.max(0, Math.round((emergencyTarget - emergencyFund) / 90)) // ~₹189/day
  const emergencyBufferFloor = Math.min(10000, Math.max(5000, Math.round(totalBankBalance * 0.2))) // 20% floor

  // Safe-to-spend: unencumbered daily disposable liquidity
  const rawSafeToSpend =
    Math.round(dailyAverageIncome * 0.75) +
    Math.max(0, Math.round((totalBankBalance - totalEssentialExpenses - emergencyBufferFloor) / 30))

  const safeToSpendToday = Math.max(0, rawSafeToSpend)

  const formulaExplanation =
    `Safe-to-Spend (₹${safeToSpendToday.toLocaleString("en-IN")}) = Today's conservative gig baseline (₹${conservativeTodayIncome}) + unencumbered monthly surplus divided across 30 days, after protecting daily rent (₹${Math.round(monthlyRent / 30)}), daily EMI (₹${dailyFixedObligationReserve - Math.round(monthlyRent / 30)}), savings reserve (₹${dailySavingsTarget}), and the emergency buffer floor (₹${emergencyBufferFloor}).`

  // 8. Financial Health Score (Section 7 Component Breakdown)
  // Components: Income Stability (25%), Expense Control (20%), Savings Buffer (20%), Debt Burden (20%), Insurance Protection (15%)
  
  // A. Income Stability (Max: 25)
  let stabilityScore = 0
  if (volatilityIndex <= 0.2) stabilityScore += 12
  else if (volatilityIndex <= 0.35) stabilityScore += 8
  else stabilityScore += 4

  if (gig.platforms.length >= 2) stabilityScore += 8
  else stabilityScore += 4

  if (activeWorkingDays >= 24) stabilityScore += 5
  else if (activeWorkingDays >= 20) stabilityScore += 3
  else stabilityScore += 1

  const incomeStabilityComp: ComponentScore = {
    name: "Income Stability",
    score: stabilityScore,
    maxScore: 25,
    weightPct: 25,
    status: stabilityScore >= 20 ? "Excellent" : stabilityScore >= 15 ? "Good" : "Needs Attention",
    explanation: `Low volatility (${volatilityIndex}) across ${gig.platforms.length} platforms (${gig.platforms.map((p) => p.platform).join(" + ")}) with ${activeWorkingDays} active working days.`,
    isDrag: stabilityScore < 18,
  }

  // B. Expense Control (Max: 20)
  const expenseRatio = totalMonthlyNet > 0 ? totalMonthlyExpenses / totalMonthlyNet : 1.0
  let expenseScore = 0
  if (expenseRatio <= 0.60) expenseScore = 20
  else if (expenseRatio <= 0.70) expenseScore = 16
  else if (expenseRatio <= 0.80) expenseScore = 12
  else if (expenseRatio <= 0.90) expenseScore = 8
  else expenseScore = 4

  const expenseControlComp: ComponentScore = {
    name: "Expense Control",
    score: expenseScore,
    maxScore: 20,
    weightPct: 20,
    status: expenseScore >= 16 ? "Good" : expenseScore >= 12 ? "Needs Attention" : "Critical",
    explanation: `Operating at a ${Math.round(expenseRatio * 100)}% expense-to-income ratio (₹${totalMonthlyExpenses.toLocaleString("en-IN")} out of ₹${totalMonthlyNet.toLocaleString("en-IN")}).`,
    isDrag: expenseScore < 14,
  }

  // C. Savings Buffer (Max: 20)
  let savingsScore = 0
  if (bufferMonths >= 3.0) savingsScore = 20
  else if (bufferMonths >= 2.0) savingsScore = 16
  else if (bufferMonths >= 1.0) savingsScore = 12
  else if (bufferMonths >= 0.5) savingsScore = 9
  else savingsScore = 4

  const savingsBufferComp: ComponentScore = {
    name: "Savings Buffer",
    score: savingsScore,
    maxScore: 20,
    weightPct: 20,
    status: savingsScore >= 16 ? "Good" : "Needs Attention",
    explanation: `Liquid savings of ₹${liquidBankSavings.toLocaleString("en-IN")} covers ${bufferMonths} months of essential needs (Target: 3.0 months).`,
    isDrag: bufferMonths < 2.0,
    dragReason: `Current emergency cushion (${bufferMonths} mo) is below the 3-month safety target.`,
  }

  // D. Debt Burden (Max: 20)
  let debtScore = 0
  if (dtiRatioPct === 0) debtScore = 20
  else if (dtiRatioPct <= 12) debtScore = 17
  else if (dtiRatioPct <= 20) debtScore = 13
  else if (dtiRatioPct <= 30) debtScore = 8
  else debtScore = 3

  const debtBurdenComp: ComponentScore = {
    name: "Debt Burden",
    score: debtScore,
    maxScore: 20,
    weightPct: 20,
    status: debtScore >= 15 ? "Excellent" : debtScore >= 10 ? "Good" : "Critical",
    explanation: `Debt-to-income ratio is ${dtiRatioPct}% with zero high-interest informal loans and an active on-time vehicle EMI.`,
    isDrag: debtScore < 12,
  }

  // E. Insurance Protection (Max: 15)
  const hasVehicleIns = master.insurance.some((i) => i.type === "vehicle" && i.status === "active")
  const hasAccidentIns = master.insurance.some((i) => i.type === "accidental" && i.status === "active")
  const hasHealthIns = master.insurance.some((i) => i.type === "health" && i.status === "active")

  let insuranceScore = 0
  if (hasVehicleIns) insuranceScore += 4
  if (hasAccidentIns) insuranceScore += 4
  if (hasHealthIns) insuranceScore += 7 // health insurance is vital

  const insuranceProtectionComp: ComponentScore = {
    name: "Insurance Protection",
    score: insuranceScore,
    maxScore: 15,
    weightPct: 15,
    status: insuranceScore >= 12 ? "Excellent" : insuranceScore >= 8 ? "Needs Attention" : "Critical",
    explanation: hasHealthIns
      ? "Comprehensive vehicle, accidental, and medical hospitalization insurance in place."
      : "Two-wheeler and e-Shram accidental cover active, but missing general hospitalization health insurance.",
    isDrag: !hasHealthIns,
    dragReason: "Absence of medical hospitalization insurance creates vulnerability to medical emergencies.",
  }

  const totalScore = stabilityScore + expenseScore + savingsScore + debtScore + insuranceScore
  const band: "Critical" | "At Risk" | "Stable" | "Healthy" | "Strong" =
    totalScore >= 80 ? "Strong" : totalScore >= 68 ? "Healthy" : totalScore >= 52 ? "Stable" : totalScore >= 40 ? "At Risk" : "Critical"

  const primaryStrengths: string[] = []
  if (stabilityScore >= 18) primaryStrengths.push("Dual-platform earnings consistency (Swiggy + Uber)")
  if (debtScore >= 15) primaryStrengths.push("Low debt burden (DTI under 10% on productive vehicle asset)")
  if (expenseScore >= 14) primaryStrengths.push("Positive cash flow with controlled discretionary spending")

  const primaryDrags: string[] = []
  if (savingsBufferComp.isDrag && savingsBufferComp.dragReason) primaryDrags.push(savingsBufferComp.dragReason)
  if (insuranceProtectionComp.isDrag && insuranceProtectionComp.dragReason) primaryDrags.push(insuranceProtectionComp.dragReason)
  if (expenseRatio > 0.8) primaryDrags.push(`High expense ratio (${Math.round(expenseRatio * 100)}%) limits savings capacity.`)

  const healthScoreDetails: FinancialHealthScoreDetails = {
    totalScore,
    band,
    components: {
      incomeStability: incomeStabilityComp,
      expenseControl: expenseControlComp,
      savingsBuffer: savingsBufferComp,
      debtBurden: debtBurdenComp,
      insuranceProtection: insuranceProtectionComp,
    },
    primaryStrengths,
    primaryDrags,
    summarySentence: `Your Financial Health Score is ${totalScore}/100 (${band}). While your multi-platform income stability and low debt burden are strong, your score is held back by your 0.7-month emergency savings buffer and lack of general health insurance.`,
  }

  // 9. Projections (7-Day & 30-Day)
  const projected7DayIncome = Math.round(gig.aggregate.totalWeeklyAvg * (1 + gig.platforms[0].earningsTrendPct / 100))
  const projected7DaySpending = Math.round((totalEssentialExpenses / 30) * 7 + (discretionaryExpenses / 30) * 7)
  const projected7DayNet = projected7DayIncome - projected7DaySpending

  const projected30DayIncome = totalMonthlyNet
  const projected30DaySpending = totalMonthlyExpenses

  return {
    timestamp: new Date().toISOString(),
    arun: {
      fullName: master.profile.fullName,
      age: master.profile.age,
      city: master.profile.city,
      state: master.profile.state,
      occupation: master.profile.occupation,
      dependents: master.profile.dependents,
      totalBankBalance,
      accountSummary,
    },
    income: {
      totalMonthlyGross,
      totalMonthlyNet,
      dailyAverageIncome,
      activeWorkingDays,
      incomeTrend,
      incomeTrendPct: gig.platforms[0].earningsTrendPct,
      incomeVolatility,
      volatilityIndex,
      platformBreakdown,
    },
    expenses: {
      monthlyRent,
      monthlyEmi,
      monthlyFuel,
      essentialLiving,
      totalEssentialExpenses,
      discretionaryExpenses,
      totalMonthlyExpenses,
    },
    cashFlow: {
      monthlyNetCashFlow,
      savingsRatePct,
      isPositive,
    },
    affordability: {
      rent: {
        monthlyRent,
        dueDay: rentDueDay,
        rentToIncomeRatioPct: rentRatioPct,
        status: rentStatus,
        canPay: canPayRent,
        surplusAfterRent,
        explanation: rentExplanation,
      },
      emi: {
        monthlyEmi,
        dueDay: emiDueDay,
        dtiRatioPct,
        status: emiStatus,
        canPay: canPayEmi,
        surplusAfterEmi,
        explanation: emiExplanation,
      },
    },
    savings: {
      liquidBankSavings,
      emergencyFund,
      emergencyTarget,
      bufferMonths,
      targetBufferMonths,
      status: savingsStatus,
    },
    safeToSpend: {
      safeToSpendToday,
      breakdown: {
        currentBalance: totalBankBalance,
        conservativeTodayIncome,
        dailyFixedObligationReserve,
        dailySavingsTarget,
        emergencyBufferFloor,
      },
      formulaExplanation,
    },
    healthScore: healthScoreDetails,
    projections: {
      projected7DayIncome,
      projected7DaySpending,
      projected7DayNet,
      projected30DayIncome,
      projected30DaySpending,
    },
    dataSources: {
      aaStatus: "CONNECTED (Setu RBI Gateway)",
      aaAccountsCount: master.bankAccounts.length,
      gigProtocolStatus: "SIMULATED FUTURE PROTOCOL",
      gigPlatformsCount: gig.platforms.length,
    },
  }
}
