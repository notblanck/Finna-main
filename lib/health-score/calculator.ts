// ==============================================================================
// FINNA Deterministic Financial Health Score Engine
// Tunable 6-component weights per TRD §5.2 specifications
// ==============================================================================

export interface HealthScoreWeights {
  incomeStability: number     // 25%
  savingsRate: number         // 20%
  emergencyBuffer: number     // 15%
  expenseDiscipline: number   // 15%
  debtLoad: number            // 15%
  protectionCompliance: number // 10%
}

export const DEFAULT_WEIGHTS: HealthScoreWeights = {
  incomeStability: 25,
  savingsRate: 20,
  emergencyBuffer: 15,
  expenseDiscipline: 15,
  debtLoad: 15,
  protectionCompliance: 10,
}

export interface ComponentBreakdown {
  key: string
  name: string
  score: number // actual earned
  maxScore: number // weight
  rating: "Good" | "Needs Attention" | "Critical"
  description: string
  dragReason?: string
}

export interface Recommendation {
  id: string
  rank: number
  title: string
  description: string
  impact: string
  actionLabel: string
  actionUrl: string
}

export interface HealthScoreResult {
  totalScore: number
  band: "Critical" | "At Risk" | "Stable" | "Healthy" | "Strong"
  components: ComponentBreakdown[]
  drags: ComponentBreakdown[]
  recommendations: Recommendation[]
  trend: { date: string; score: number }[]
  computedAt: string
}

export function calculateHealthScore(
  data: {
    monthlyIncome?: number
    monthlyExpense?: number
    liquidSavings?: number
    activeDaysRatio?: number
    platformCount?: number
    monthlyEmi?: number
    hasInsurance?: boolean
    eShramRegistered?: boolean
    panLinked?: boolean
  } = {},
  weights: HealthScoreWeights = DEFAULT_WEIGHTS
): HealthScoreResult {
  const income = data.monthlyIncome ?? 32450
  const expense = data.monthlyExpense ?? 18600
  const savings = data.liquidSavings ?? 14200
  const emi = data.monthlyEmi ?? 3200
  const platforms = data.platformCount ?? 2
  const activeDays = data.activeDaysRatio ?? 0.85
  const insurance = data.hasInsurance ?? true
  const eShram = data.eShramRegistered ?? false
  const pan = data.panLinked ?? true

  // 1. Income Stability (Weight: 25)
  // Evaluates platform diversification and consistent active workdays
  let stabilityScore = 0
  if (platforms >= 2) stabilityScore += 10
  else if (platforms === 1) stabilityScore += 6

  if (activeDays >= 0.8) stabilityScore += 15
  else if (activeDays >= 0.6) stabilityScore += 10
  else stabilityScore += 5
  stabilityScore = Math.min(stabilityScore, weights.incomeStability)

  // 2. Savings Rate (Weight: 20)
  // (income - expense) / income
  const savingsRatePct = income > 0 ? (income - expense) / income : 0
  let savingsRateScore = 0
  if (savingsRatePct >= 0.3) savingsRateScore = weights.savingsRate
  else if (savingsRatePct >= 0.2) savingsRateScore = Math.round(weights.savingsRate * 0.8)
  else if (savingsRatePct >= 0.1) savingsRateScore = Math.round(weights.savingsRate * 0.5)
  else savingsRateScore = Math.max(0, Math.round(savingsRatePct * weights.savingsRate))

  // 3. Emergency Buffer (Weight: 15)
  // liquid savings / monthly essential burn (target 3x)
  const bufferMonths = expense > 0 ? savings / expense : 0
  let bufferScore = 0
  if (bufferMonths >= 3) bufferScore = weights.emergencyBuffer
  else if (bufferMonths >= 1.5) bufferScore = Math.round(weights.emergencyBuffer * 0.75)
  else if (bufferMonths >= 0.75) bufferScore = Math.round(weights.emergencyBuffer * 0.5)
  else bufferScore = Math.round((bufferMonths / 3) * weights.emergencyBuffer)

  // 4. Expense Discipline (Weight: 15)
  // expense / income ratio
  const expenseRatio = income > 0 ? expense / income : 1
  let disciplineScore = 0
  if (expenseRatio <= 0.6) disciplineScore = weights.expenseDiscipline
  else if (expenseRatio <= 0.75) disciplineScore = Math.round(weights.expenseDiscipline * 0.7)
  else if (expenseRatio <= 0.9) disciplineScore = Math.round(weights.expenseDiscipline * 0.4)
  else disciplineScore = Math.round(weights.expenseDiscipline * 0.2)

  // 5. Debt Load (Weight: 15)
  // total EMI / monthly income (healthy < 30%)
  const debtRatio = income > 0 ? emi / income : 0
  let debtScore = 0
  if (debtRatio <= 0.15) debtScore = weights.debtLoad
  else if (debtRatio <= 0.3) debtScore = Math.round(weights.debtLoad * 0.75)
  else if (debtRatio <= 0.45) debtScore = Math.round(weights.debtLoad * 0.4)
  else debtScore = 0

  // 6. Protection & Compliance (Weight: 10)
  let protectionScore = 0
  if (insurance) protectionScore += 4
  if (eShram) protectionScore += 3
  if (pan) protectionScore += 3
  protectionScore = Math.min(protectionScore, weights.protectionCompliance)

  const totalScore = Math.round(
    stabilityScore + savingsRateScore + bufferScore + disciplineScore + debtScore + protectionScore
  )

  let band: "Critical" | "At Risk" | "Stable" | "Healthy" | "Strong" = "Stable"
  if (totalScore < 35) band = "Critical"
  else if (totalScore < 55) band = "At Risk"
  else if (totalScore < 70) band = "Stable"
  else if (totalScore < 85) band = "Healthy"
  else band = "Strong"

  const components: ComponentBreakdown[] = [
    {
      key: "incomeStability",
      name: "Income Stability",
      score: stabilityScore,
      maxScore: weights.incomeStability,
      rating: stabilityScore >= 20 ? "Good" : stabilityScore >= 14 ? "Needs Attention" : "Critical",
      description: `${platforms} active platforms · ${(activeDays * 100).toFixed(0)}% month shift consistency`,
      dragReason: stabilityScore < 18 ? "Single-platform dependency risks loss of earnings during sudden demand drops." : undefined,
    },
    {
      key: "savingsRate",
      name: "Savings Rate",
      score: savingsRateScore,
      maxScore: weights.savingsRate,
      rating: savingsRateScore >= 16 ? "Good" : savingsRateScore >= 10 ? "Needs Attention" : "Critical",
      description: `${(savingsRatePct * 100).toFixed(0)}% net monthly surplus (₹${(income - expense).toLocaleString("en-IN")})`,
      dragReason: savingsRateScore < 14 ? "Savings rate below 20% leaves little margin for fuel price hikes." : undefined,
    },
    {
      key: "emergencyBuffer",
      name: "Emergency Buffer",
      score: bufferScore,
      maxScore: weights.emergencyBuffer,
      rating: bufferScore >= 12 ? "Good" : bufferScore >= 8 ? "Needs Attention" : "Critical",
      description: `${bufferMonths.toFixed(1)} months essential living reserve (₹${savings.toLocaleString("en-IN")})`,
      dragReason: bufferMonths < 2 ? `Buffer is only ${bufferMonths.toFixed(1)} months. Target is 3 months essential burn.` : undefined,
    },
    {
      key: "expenseDiscipline",
      name: "Expense Discipline",
      score: disciplineScore,
      maxScore: weights.expenseDiscipline,
      rating: disciplineScore >= 12 ? "Good" : disciplineScore >= 8 ? "Needs Attention" : "Critical",
      description: `${(expenseRatio * 100).toFixed(0)}% total expense to income ratio`,
      dragReason: expenseRatio > 0.65 ? "Operating costs (fuel, repairs) consume over 65% of gross earnings." : undefined,
    },
    {
      key: "debtLoad",
      name: "Debt & EMI Load",
      score: debtScore,
      maxScore: weights.debtLoad,
      rating: debtScore >= 12 ? "Good" : debtScore >= 8 ? "Needs Attention" : "Critical",
      description: `EMI represents ${(debtRatio * 100).toFixed(0)}% of monthly gig payouts`,
      dragReason: debtRatio > 0.25 ? "Monthly vehicle EMI is near 30% of total revenue." : undefined,
    },
    {
      key: "protectionCompliance",
      name: "Social Security & Compliance",
      score: protectionScore,
      maxScore: weights.protectionCompliance,
      rating: protectionScore >= 8 ? "Good" : protectionScore >= 5 ? "Needs Attention" : "Critical",
      description: `${insurance ? "Insurance Active" : "No Insurance"} · ${eShram ? "e-Shram Registered" : "e-Shram Pending"} · ${pan ? "PAN Linked" : "PAN Missing"}`,
      dragReason: !eShram ? "Missing e-Shram registration forfeits ₹2 Lakh free PMSBY accident cover." : undefined,
    },
  ]

  const drags = components.filter((c) => c.dragReason !== undefined)

  const recommendations: Recommendation[] = [
    {
      id: "rec-1",
      rank: 1,
      title: "Activate Free ₹2 Lakh e-Shram Accidental Cover",
      description: "Link your Aadhaar on e-Shram to boost your compliance score and unlock central hospital aid.",
      impact: "+5 Points to Health Score",
      actionLabel: "Register on e-Shram",
      actionUrl: "/schemes/eshram-social-security",
    },
    {
      id: "rec-2",
      rank: 2,
      title: "Automate Daily ₹150 Emergency Stash",
      description: `Your buffer is ${bufferMonths.toFixed(1)} months. Setting aside ₹150/day reaches a full 2-month reserve in 60 days.`,
      impact: "+7 Points to Health Score",
      actionLabel: "Setup Daily Auto-Stash",
      actionUrl: "/dashboard",
    },
    {
      id: "rec-3",
      rank: 3,
      title: "Diversify Peak Hours with Quick Commerce",
      description: "Morning grocery shifts (6 AM - 10 AM on Zepto/Blinkit) add ₹800 daily during low ride-hailing demand.",
      impact: "+4 Points to Health Score",
      actionLabel: "View High-Yield Shifts",
      actionUrl: "/insights",
    },
  ]

  // Synthetic 90-day trend points showing steady upward progression
  const trend = [
    { date: "60 Days Ago", score: Math.max(30, totalScore - 14) },
    { date: "45 Days Ago", score: Math.max(35, totalScore - 9) },
    { date: "30 Days Ago", score: Math.max(40, totalScore - 6) },
    { date: "15 Days Ago", score: Math.max(45, totalScore - 2) },
    { date: "Today", score: totalScore },
  ]

  return {
    totalScore,
    band,
    components,
    drags,
    recommendations,
    trend,
    computedAt: new Date().toISOString(),
  }
}
