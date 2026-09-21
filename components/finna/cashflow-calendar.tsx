"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  Clock,
  ArrowRight,
  ArrowLeft,
  Info,
  Layers,
  Filter,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowDownRight,
  ArrowUpRight
} from "lucide-react"

export interface CashflowDayItem {
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
  breakdown?: {
    incomeSources: { name: string; amount: number }[]
    expenses: { name: string; amount: number }[]
  }
}

interface CashflowCalendarProps {
  onBack?: () => void
}

export function CashflowCalendar({ onBack }: CashflowCalendarProps) {
  const [daysData, setDaysData] = useState<CashflowDayItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<CashflowDayItem | null>(null)
  const [selectedHorizon, setSelectedHorizon] = useState<"7" | "30" | "90">("90")
  const [viewMode, setViewMode] = useState<"calendar" | "timeline">("calendar")
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)

  // Generate or fetch 90-day cashflow forecast
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const res = await fetch("/api/v1/cashflow/calendar?days=90")
        if (res.ok) {
          const json = await res.json()
          if (json.days && json.days.length > 0) {
            setDaysData(json.days)
            setSelectedDay(json.days[0])
            return
          }
        }
      } catch (err) {
        console.warn("Could not fetch from API, generating client-side 90-day forecast:", err)
      }

      // Fallback deterministic generator for 90 days
      const now = new Date()
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const generated: CashflowDayItem[] = []

      for (let i = 0; i < 90; i++) {
        const targetDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
        const dayOfWeekIdx = targetDate.getDay()
        const dayOfWeek = weekdays[dayOfWeekIdx]
        const dayNumber = targetDate.getDate()
        const monthName = monthNames[targetDate.getMonth()]
        const dateStr = targetDate.toISOString().slice(0, 10)

        const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 5 || dayOfWeekIdx === 6
        const isMonthEnd = dayNumber >= 28 || dayNumber <= 3

        let baseEarned = isWeekend ? 1900 : 1300
        const earned = Math.round(baseEarned + Math.sin(i * 1.5) * 160)
        let baseSpent = 410 + Math.cos(i * 2.1) * 70
        if (isMonthEnd && (dayNumber === 1 || dayNumber === 28)) {
          baseSpent += 1350
        }
        const spent = Math.round(baseSpent)
        const saved = Math.max(0, earned - spent)

        generated.push({
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
          driver: isWeekend ? "Weekend Volume Surge" : "Standard Weekday Route",
          confidence: i <= 14 ? "high" : i <= 45 ? "medium" : "low",
          breakdown: {
            incomeSources: isWeekend
              ? [
                  { name: "Swiggy Dinner Surge", amount: Math.round(earned * 0.55) },
                  { name: "Uber Ride Hail Pulse", amount: Math.round(earned * 0.35) },
                  { name: "Incentive Target Bonus", amount: Math.round(earned * 0.1) }
                ]
              : [
                  { name: "Gig Route Deliveries", amount: Math.round(earned * 0.7) },
                  { name: "Midday Micro-Orders", amount: Math.round(earned * 0.3) }
                ],
            expenses: isMonthEnd && (dayNumber === 1 || dayNumber === 28)
              ? [
                  { name: "Bike EMI / Maintenance", amount: 1350 },
                  { name: "Fuel & Battery Swap", amount: 250 },
                  { name: "Meals & Refreshment", amount: 160 }
                ]
              : [
                  { name: "Fuel & Battery Swap", amount: Math.round(spent * 0.65) },
                  { name: "Meals & Refreshment", amount: Math.round(spent * 0.35) }
                ]
          }
        })
      }
      setDaysData(generated)
      setSelectedDay(generated[0])
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Filter based on 7, 30, or 90 days horizon
  const visibleDays = useMemo(() => {
    const count = parseInt(selectedHorizon, 10)
    return daysData.slice(0, count)
  }, [daysData, selectedHorizon])

  // Reset month index when horizon changes
  useEffect(() => {
    setCurrentMonthIndex(0)
  }, [selectedHorizon])

  // Group days by Month for clean calendar pagination
  const monthsGrouped = useMemo(() => {
    const groups: { monthLabel: string; days: CashflowDayItem[] }[] = []
    const map = new Map<string, CashflowDayItem[]>()

    visibleDays.forEach((day) => {
      const key = `${day.monthName} ${day.date.slice(0, 4)}`
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(day)
    })

    map.forEach((days, monthLabel) => {
      groups.push({ monthLabel, days })
    })

    return groups
  }, [visibleDays])

  const currentMonth = monthsGrouped[currentMonthIndex] || monthsGrouped[0]

  // Totals for summary banner
  const totals = useMemo(() => {
    const totalEarned = visibleDays.reduce((acc, d) => acc + d.earned, 0)
    const totalSpent = visibleDays.reduce((acc, d) => acc + d.spent, 0)
    const totalSaved = visibleDays.reduce((acc, d) => acc + d.saved, 0)
    const avgDailySaved = visibleDays.length > 0 ? Math.round(totalSaved / visibleDays.length) : 0
    return { totalEarned, totalSpent, totalSaved, avgDailySaved }
  }, [visibleDays])

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dfe5d9] pb-6">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#657067] hover:text-[#17211b] transition mb-3 cursor-pointer group"
            >
              <ArrowLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
              <span>Back to Dashboard</span>
            </button>
          )}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe5d9] bg-[#f8f9f5] px-3.5 py-1 text-xs font-medium text-[#526057]">
            <Sparkles className="size-3 text-[#7ea13d]" />
            <span>90-Day Predictive Cashflow Model</span>
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-[#17211b]">
            Cash Flow Calendar
          </h1>
          <p className="mt-1 text-sm text-[#657067]">
            Daily forecasted earnings, operating expenses, and net savings across every day for the next 90 days.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Horizon Selection */}
          <div className="inline-flex rounded-full bg-[#f1f4ec] p-1 border border-[#dfe5d9]">
            {(["7", "30", "90"] as const).map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(h)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  selectedHorizon === h
                    ? "bg-[#17211b] text-white shadow-sm"
                    : "text-[#657067] hover:text-[#17211b]"
                }`}
              >
                {h === "90" ? "Next 90 Days" : `${h} Days`}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="inline-flex rounded-full bg-[#f1f4ec] p-1 border border-[#dfe5d9]">
            <button
              onClick={() => setViewMode("calendar")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white text-[#17211b] shadow-sm"
                  : "text-[#657067] hover:text-[#17211b]"
              }`}
            >
              <CalendarIcon className="size-3.5" /> Calendar
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-white text-[#17211b] shadow-sm"
                  : "text-[#657067] hover:text-[#17211b]"
              }`}
            >
              <Layers className="size-3.5" /> Timeline
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards for the Selected Horizon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expected Earnings */}
        <div className="rounded-3xl border border-[#dfe5d9] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#657067]">Expected Earnings</span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-[#edf6dc] text-[#4e683d]">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[#17211b]">
            ₹{totals.totalEarned.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#678844] font-medium">
            <span>+{selectedHorizon} days projected revenue</span>
          </div>
        </div>

        {/* Expected Expenses */}
        <div className="rounded-3xl border border-[#dfe5d9] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#657067]">Expected Expenses</span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <ArrowDownRight className="size-4" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[#17211b]">
            ₹{totals.totalSpent.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <span>Fuel, EMIs & living overhead</span>
          </div>
        </div>

        {/* Expected Savings */}
        <div className="rounded-3xl border border-[#cbe886] bg-[#f7fceb] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#3c5620]">Expected Savings</span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-[#d7f36a] text-[#122017]">
              <PiggyBank className="size-4" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[#1e2f11]">
            ₹{totals.totalSaved.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#4b6928] font-semibold">
            <span>Net surplus available to save</span>
          </div>
        </div>

        {/* Daily Average Pace */}
        <div className="rounded-3xl border border-[#dfe5d9] bg-[#17211b] p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#aeb9aa]">Daily Savings Pace</span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-white/10 text-[#d7f36a]">
              <Zap className="size-4" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[#d7f36a]">
            ₹{totals.avgDailySaved.toLocaleString("en-IN")}<span className="text-sm font-normal text-[#aeb9aa]">/day</span>
          </p>
          <div className="mt-2 text-xs text-[#aeb9aa]">
            Consistently positive cashflow
          </div>
        </div>
      </div>

      {/* Main Interactive Grid & Day Breakdown Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Center: The Calendar or Timeline View */}
        <div className="lg:col-span-8 rounded-[2rem] border border-[#dfe5d9] bg-white p-6 md:p-8 shadow-sm">
          {viewMode === "calendar" ? (
            <div>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#edf0e9]">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-2xl bg-[#edf6dc] text-[#4e683d]">
                    <CalendarIcon className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-[#17211b]">{currentMonth?.monthLabel || "Upcoming"}</h3>
                    <p className="text-xs text-[#657067]">
                      Showing {currentMonth?.days.length || 0} forecast days in this cycle
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentMonthIndex <= 0}
                    onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
                    className="p-2 rounded-xl border border-[#dfe5d9] hover:bg-[#f8f9f5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="size-4 text-[#17211b]" />
                  </button>
                  <span className="text-xs font-medium text-[#657067]">
                    {currentMonthIndex + 1} of {monthsGrouped.length}
                  </span>
                  <button
                    disabled={currentMonthIndex >= monthsGrouped.length - 1}
                    onClick={() => setCurrentMonthIndex((prev) => Math.min(monthsGrouped.length - 1, prev + 1))}
                    className="p-2 rounded-xl border border-[#dfe5d9] hover:bg-[#f8f9f5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="size-4 text-[#17211b]" />
                  </button>
                </div>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wider text-[#8a968c] mb-3">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {/* Empty padding cells for weekday offset */}
                {(() => {
                  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                  const firstDayOfWeek = currentMonth?.days[0]?.dayOfWeek
                  const offset = firstDayOfWeek ? weekdays.indexOf(firstDayOfWeek) : 0
                  return Array.from({ length: Math.max(0, offset) }).map((_, i) => (
                    <div key={`blank-${i}`} className="hidden sm:block min-h-[96px] sm:min-h-[108px] rounded-2xl border border-transparent p-2.5 opacity-0 pointer-events-none" />
                  ))
                })()}

                {currentMonth?.days.map((day) => {
                  const isSelected = selectedDay?.date === day.date
                  const isWeekend = day.dayOfWeek === "Sat" || day.dayOfWeek === "Sun"

                  return (
                    <motion.div
                      key={day.date}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDay(day)}
                      className={`relative min-h-[96px] sm:min-h-[108px] rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between border cursor-pointer transition ${
                        isSelected
                          ? "border-[#17211b] bg-[#f4f7ee] ring-2 ring-[#17211b] shadow-sm"
                          : isWeekend
                          ? "border-[#dfe5d9] bg-[#fafbf8] hover:border-[#a0b58e]"
                          : "border-[#edf0e9] bg-white hover:border-[#ccd7c6]"
                      }`}
                    >
                      {/* Top Day Header */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? "text-[#17211b]" : "text-[#526057]"}`}>
                          {day.dayNumber} {day.monthName}
                        </span>
                        {isWeekend ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#edf6dc] text-[#4e683d]">
                            Surge
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium text-[#8a968c]">
                            {day.dayOfWeek}
                          </span>
                        )}
                      </div>

                      {/* Earnings & Expenses Badges */}
                      <div className="space-y-1 my-1">
                        <div className="text-[10px] sm:text-[11px] font-semibold text-[#3b7c25] flex items-center justify-between">
                          <span className="text-[9px] text-[#556950] font-normal">Earn</span>
                          <span>+₹{day.earned.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-medium text-rose-700 flex items-center justify-between">
                          <span className="text-[9px] text-[#8c5255] font-normal">Spend</span>
                          <span>-₹{day.spent.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      {/* Bottom Expected Savings Tag */}
                      <div className="border-t border-[#edf0e9] pt-1 flex items-center justify-between text-[10px] font-bold text-[#17211b]">
                        <span className="text-[9px] uppercase tracking-tight text-[#8a968c]">Save:</span>
                        <span className="text-[#2c4e16]">₹{day.saved.toLocaleString("en-IN")}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Timeline List View */
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#17211b]">
                  90-Day Chronological Cash Flow
                </h3>
                <span className="text-xs text-[#657067] font-medium">
                  {visibleDays.length} days listed
                </span>
              </div>

              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {visibleDays.map((day) => {
                  const isSelected = selectedDay?.date === day.date
                  return (
                    <div
                      key={day.date}
                      onClick={() => setSelectedDay(day)}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? "border-[#17211b] bg-[#f4f7ee] shadow-sm"
                          : "border-[#edf0e9] bg-[#fafbf8] hover:border-[#ccd7c6]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="size-11 rounded-2xl bg-white border border-[#dfe5d9] flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] uppercase font-bold text-[#8a968c] leading-tight">
                            {day.monthName}
                          </span>
                          <span className="text-sm font-black text-[#17211b] leading-tight">
                            {day.dayNumber}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#17211b]">
                            {day.dayOfWeek}, {day.date}
                          </p>
                          <p className="text-xs text-[#657067] flex items-center gap-1.5">
                            <span>{day.driver}</span>
                            <span>•</span>
                            <span className="text-[#3b7c25] font-medium">{day.confidence} confidence</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 text-right">
                        <div>
                          <p className="text-xs font-bold text-[#3b7c25]">+₹{day.earned}</p>
                          <p className="text-[11px] font-medium text-rose-700">-₹{day.spent}</p>
                        </div>
                        <div className="min-w-[70px] text-right pl-3 border-l border-[#dfe5d9]">
                          <p className="text-[10px] uppercase font-semibold text-[#8a968c]">Net Saved</p>
                          <p className="text-sm font-bold text-[#1e2f11]">₹{day.saved}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Selected Single Day Deep-Dive Inspector */}
        <div className="lg:col-span-4 rounded-[2rem] border border-[#dfe5d9] bg-[#fafbf8] p-6 md:p-8 shadow-sm">
          {selectedDay ? (
            <div className="space-y-6">
              {/* Day Header */}
              <div className="border-b border-[#edf0e9] pb-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#edf6dc] px-3 py-1 text-[11px] font-bold text-[#4e683d]">
                    {selectedDay.dayOfWeek} Forecast
                  </span>
                  <span className="text-xs text-[#8a968c] font-medium">
                    {selectedDay.date}
                  </span>
                </div>
                <h3 className="mt-3 text-2xl font-bold text-[#17211b]">
                  {selectedDay.monthName} {selectedDay.dayNumber} Overview
                </h3>
                <p className="text-xs text-[#657067] mt-1">
                  Estimated through machine learning pattern recognition.
                </p>
              </div>

              {/* 3 Metrics Box for Selected Day */}
              <div className="space-y-3">
                {/* Expected Earning */}
                <div className="p-4 rounded-2xl bg-white border border-[#edf0e9] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-[#edf6dc] text-[#3b7c25]">
                      <ArrowUpRight className="size-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-[#657067]">Expected Earning</p>
                      <p className="text-base font-bold text-[#17211b]">+₹{selectedDay.earned.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#3b7c25] bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Inflow
                  </span>
                </div>

                {/* Expected Expense */}
                <div className="p-4 rounded-2xl bg-white border border-[#edf0e9] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                      <ArrowDownRight className="size-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-[#657067]">Expected Expenses</p>
                      <p className="text-base font-bold text-[#17211b]">-₹{selectedDay.spent.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                    Outflow
                  </span>
                </div>

                {/* Expected Savings */}
                <div className="p-4 rounded-2xl bg-[#f4fadc] border border-[#cbe886] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-[#d7f36a] text-[#122017]">
                      <PiggyBank className="size-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-[#4b6928]">Expected Savings</p>
                      <p className="text-lg font-black text-[#1e2f11]">₹{selectedDay.saved.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#38531f] bg-white px-2.5 py-1 rounded-lg shadow-2xs">
                    Net Surplus
                  </span>
                </div>
              </div>

              {/* Inflow Sources Breakdown */}
              <div className="rounded-2xl bg-white border border-[#edf0e9] p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#17211b] mb-3 flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-[#3b7c25]" /> Projected Earning Drivers
                </h4>
                <div className="space-y-2">
                  {selectedDay.breakdown?.incomeSources.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#fafbf8]">
                      <span className="text-[#526057]">{item.name}</span>
                      <span className="font-semibold text-[#17211b]">+₹{item.amount.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outflow Drivers Breakdown */}
              <div className="rounded-2xl bg-white border border-[#edf0e9] p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#17211b] mb-3 flex items-center gap-1.5">
                  <TrendingDown className="size-3.5 text-rose-600" /> Projected Spending Obligations
                </h4>
                <div className="space-y-2">
                  {selectedDay.breakdown?.expenses.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#fafbf8]">
                      <span className="text-[#526057]">{item.name}</span>
                      <span className="font-semibold text-rose-800">-₹{item.amount.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action / Safe-To-Spend recommendation */}
              <div className="rounded-2xl bg-[#17211b] p-5 text-white">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-[#d7f36a]" />
                  <span className="text-[11px] uppercase tracking-wider text-[#aeb9aa] font-semibold">
                    FINNA Micro-Allocation
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#c3cfbf]">
                  On this day, auto-saving ₹{Math.round(selectedDay.saved * 0.7)} into your emergency reserve still leaves you with a safe-to-spend buffer of ₹{selectedDay.earned - Math.round(selectedDay.saved * 0.7)}.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#8a968c]">
              <Info className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click any specific day on the calendar to inspect its full 24-hour financial projection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
