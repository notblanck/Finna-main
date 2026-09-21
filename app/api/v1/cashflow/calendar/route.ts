import { NextResponse } from "next/server"

export interface CashflowDay {
  date: string
  dayOfWeek: string
  dayNumber: number
  monthName: string
  status: "actual" | "predicted"
  is_future: boolean
  earned: number
  spent: number
  saved: number
  transactions_count: number
  driver?: string
  confidence?: "low" | "medium" | "high"
  breakdown: {
    incomeSources: { name: string; amount: number }[]
    expenses: { name: string; amount: number }[]
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const totalDays = parseInt(searchParams.get("days") || "90", 10)
    
    // Starting from today
    const now = new Date()
    const daysList: CashflowDay[] = []

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    for (let i = 0; i < totalDays; i++) {
      const targetDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      const dayOfWeekIdx = targetDate.getDay()
      const dayOfWeek = weekdays[dayOfWeekIdx]
      const dayNumber = targetDate.getDate()
      const monthName = monthNames[targetDate.getMonth()]
      const y = targetDate.getFullYear()
      const m = String(targetDate.getMonth() + 1).padStart(2, "0")
      const d = String(dayNumber).padStart(2, "0")
      const dateStr = `${y}-${m}-${d}`

      const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 5 || dayOfWeekIdx === 6 // Fri, Sat, Sun are peak gig days
      const isMonthEnd = dayNumber >= 28 || dayNumber <= 3 // EMI / Rent / Bill cycle
      const isDiwaliSurge = targetDate.getMonth() === 10 && dayNumber >= 8 && dayNumber <= 15 // Festive surge in Nov

      // Realistic stochastic model tailored for gig workers
      let baseEarnings = isWeekend ? 1850 : 1250
      if (isDiwaliSurge) baseEarnings += 900

      // Daily noise +/- 10%
      const variance = Math.sin(i * 1.5) * 150
      const earned = Math.round(baseEarnings + variance)

      // Expenses: fuel, meals, platform fee, with periodic utility/EMI spikes
      let baseExpense = 380 + Math.cos(i * 2.1) * 80
      if (isMonthEnd && (dayNumber === 1 || dayNumber === 28)) {
        baseExpense += 1400 // Bike EMI or mobile recharge pulse
      }
      const spent = Math.round(baseExpense)

      // Expected Savings = Expected Earned - Expected Spent
      const saved = Math.max(0, earned - spent)

      const incomeSources = isWeekend
        ? [
            { name: "Swiggy Dinner Surge", amount: Math.round(earned * 0.55) },
            { name: "Uber Ride Hail Pulse", amount: Math.round(earned * 0.35) },
            { name: "Platform Incentive Bonus", amount: Math.round(earned * 0.10) }
          ]
        : [
            { name: "Regular Gig Deliveries", amount: Math.round(earned * 0.70) },
            { name: "Midday Micro-Orders", amount: Math.round(earned * 0.30) }
          ]

      const expenses = isMonthEnd && (dayNumber === 1 || dayNumber === 28)
        ? [
            { name: "Bike EMI / Maintenance", amount: 1400 },
            { name: "EV / Petrol Fueling", amount: 240 },
            { name: "Daily Food & Water", amount: 140 }
          ]
        : [
            { name: "EV / Petrol Fueling", amount: Math.round(spent * 0.65) },
            { name: "Daily Food & Water", amount: Math.round(spent * 0.35) }
          ]

      daysList.push({
        date: dateStr,
        dayOfWeek,
        dayNumber,
        monthName,
        status: "predicted",
        is_future: i > 0,
        earned,
        spent,
        saved,
        transactions_count: isWeekend ? 8 : 5,
        driver: isWeekend ? "Weekend High Volume Surge" : isDiwaliSurge ? "Festive Season Incentive Pulse" : "Standard Weekday Route",
        confidence: i <= 14 ? "high" : i <= 45 ? "medium" : "low",
        breakdown: {
          incomeSources,
          expenses
        }
      })
    }

    const totalEarned = daysList.reduce((acc, d) => acc + d.earned, 0)
    const totalSpent = daysList.reduce((acc, d) => acc + d.spent, 0)
    const totalSaved = daysList.reduce((acc, d) => acc + d.saved, 0)
    const avgDailySavings = Math.round(totalSaved / totalDays)

    return NextResponse.json({
      days: daysList,
      summary: {
        totalDays,
        totalEarned,
        totalSpent,
        totalSaved,
        avgDailySavings
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch cashflow calendar", message: err.message }, { status: 500 })
  }
}
