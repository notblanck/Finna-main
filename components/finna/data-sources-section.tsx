"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database,
  Landmark,
  Bike,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  Zap
} from "lucide-react"
import {
  getArunMasterData,
  updateArunMasterData,
  resetArunMasterData,
  ArunMasterData
} from "@/lib/data/arun-master"
import {
  getFutureGigData,
  updateFutureGigData,
  resetFutureGigData,
  FutureGigDataState
} from "@/lib/data/gig-data-layer"
import { calculateFinnaFinancialState, FinnaCalculationResult } from "@/lib/finance/engine"
import { Button } from "@/components/ui/button"

export function DataSourcesSection({ onDataChanged }: { onDataChanged?: () => void }) {
  const [masterData, setMasterData] = React.useState<ArunMasterData>(getArunMasterData())
  const [gigData, setGigData] = React.useState<FutureGigDataState>(getFutureGigData())
  const [finnaState, setFinnaState] = React.useState<FinnaCalculationResult>(calculateFinnaFinancialState())
  const [activeTab, setActiveTab] = React.useState<"unified" | "aa" | "gig" | "simulator">("unified")
  const [simulationActive, setSimulationActive] = React.useState(false)

  // Sync state on load and on event
  const refreshAll = React.useCallback(() => {
    const m = getArunMasterData()
    const g = getFutureGigData()
    setMasterData({ ...m })
    setGigData(JSON.parse(JSON.stringify(g)))
    setFinnaState(calculateFinnaFinancialState(m, g))
    if (onDataChanged) onDataChanged()
  }, [onDataChanged])

  React.useEffect(() => {
    refreshAll()
    const handleUpdate = () => refreshAll()
    if (typeof window !== "undefined") {
      window.addEventListener("finna_data_updated", handleUpdate)
      return () => window.removeEventListener("finna_data_updated", handleUpdate)
    }
  }, [refreshAll])

  // Simulation handler 1: Low Gig Income Shock (Section 14 Test)
  const handleLowIncomeTest = () => {
    updateFutureGigData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev))
      copy.aggregate.totalNetMonthly = 18000
      copy.aggregate.totalGrossMonthly = 19800
      copy.aggregate.overallTrend = "declining"
      copy.platforms[0].monthlyNetEarnings = 10000
      copy.platforms[1].monthlyNetEarnings = 8000
      return copy
    })
    setSimulationActive(true)
    refreshAll()
  }

  // Simulation handler 2: High EMI Burden
  const handleHighEmiTest = () => {
    const m = getArunMasterData()
    const newObs = m.obligations.map((o) =>
      o.type === "emi" ? { ...o, amount: 8500 } : o
    )
    updateArunMasterData({ obligations: newObs })
    setSimulationActive(true)
    refreshAll()
  }

  // Simulation handler 3: Low Savings & High Volatility
  const handleLowSavingsTest = () => {
    const m = getArunMasterData()
    const newSavings = m.savings.map((s) =>
      s.id === "sav-rainy-day" ? { ...s, currentAmount: 2000 } : s
    )
    updateArunMasterData({ savings: newSavings })
    updateFutureGigData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev))
      copy.aggregate.compositeVolatilityIndex = 0.48
      copy.aggregate.overallVolatility = "high"
      return copy
    })
    setSimulationActive(true)
    refreshAll()
  }

  // Reset to Baseline Arun
  const handleResetToBaseline = () => {
    resetArunMasterData()
    resetFutureGigData()
    setSimulationActive(false)
    refreshAll()
  }

  // Slider change for Gig Net Income
  const handleGigIncomeSlider = (val: number) => {
    updateFutureGigData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev))
      copy.aggregate.totalNetMonthly = val
      copy.aggregate.totalGrossMonthly = Math.round(val * 1.1)
      const ratio = val / 32450
      copy.platforms[0].monthlyNetEarnings = Math.round(18400 * ratio)
      copy.platforms[1].monthlyNetEarnings = Math.round(14050 * ratio)
      return copy
    })
    setSimulationActive(true)
    refreshAll()
  }

  // Slider change for EMI
  const handleEmiSlider = (val: number) => {
    const m = getArunMasterData()
    const newObs = m.obligations.map((o) =>
      o.type === "emi" ? { ...o, amount: val } : o
    )
    updateArunMasterData({ obligations: newObs })
    setSimulationActive(true)
    refreshAll()
  }

  return (
    <section className="mt-12 rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-black text-white">
              <Database className="size-3.5" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#737373]">
              Section 11 · Data Layer Visibility
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-black">
            Data Sources & Financial Understanding
          </h2>
          <p className="mt-1 text-xs text-[#737373]">
            Unifying RBI Account Aggregator banking feed with simulated direct platform worker data into one FINNA financial state.
          </p>
        </div>

        {/* Tab pills */}
        <div className="inline-flex rounded-full bg-[#f5f5f5] p-1 border border-[#e5e5e5] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("unified")}
            className={`px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
              activeTab === "unified" ? "bg-black text-white shadow-2xs" : "text-[#737373] hover:text-black"
            }`}
          >
            Combined Understanding
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("aa")}
            className={`px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
              activeTab === "aa" ? "bg-black text-white shadow-2xs" : "text-[#737373] hover:text-black"
            }`}
          >
            AA Banking Feed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gig")}
            className={`px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
              activeTab === "gig" ? "bg-black text-white shadow-2xs" : "text-[#737373] hover:text-black"
            }`}
          >
            Future Gig Protocol
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "simulator" ? "bg-black text-white shadow-2xs" : "text-black hover:bg-[#e5e5e5]"
            }`}
          >
            <Sliders className="size-3" />
            <span>Test Simulator</span>
            {simulationActive && <span className="size-2 rounded-full bg-amber-400 animate-ping" />}
          </button>
        </div>
      </div>

      {/* Notice if simulation is active */}
      {simulationActive && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600 shrink-0" />
            <span>
              <strong>Simulated Data Active:</strong> Arun's financial metrics are currently overridden to test dynamic recalculation (Section 14).
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetToBaseline}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 underline hover:text-black cursor-pointer"
          >
            <RotateCcw className="size-3" /> Reset to Arun Default
          </button>
        </div>
      )}

      {/* TAB 1: Unified Financial Understanding */}
      {activeTab === "unified" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">Net Monthly Cashflow</span>
            <p className={`text-2xl font-bold ${finnaState.cashFlow.isPositive ? "text-black" : "text-red-600"}`}>
              {finnaState.cashFlow.monthlyNetCashFlow >= 0 ? "+" : "−"}₹{Math.abs(finnaState.cashFlow.monthlyNetCashFlow).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-[#737373]">
              Net income ₹{finnaState.income.totalMonthlyNet.toLocaleString("en-IN")} − expenses ₹{finnaState.expenses.totalMonthlyExpenses.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">Safe-to-Spend Today</span>
            <p className="text-2xl font-bold text-black">
              ₹{finnaState.safeToSpend.safeToSpendToday.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-[#737373]">
              Unencumbered buffer after protecting rent, EMI, fuel & reserve floor
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">Financial Health Score</span>
            <p className="text-2xl font-bold text-black">
              {finnaState.healthScore.totalScore} / 100 <span className="text-xs font-normal text-[#737373]">({finnaState.healthScore.band})</span>
            </p>
            <p className="text-xs text-[#737373]">
              5 weighted pillars: Stability, Expenses, Savings, Debt & Insurance
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">Rent & EMI Affordability</span>
            <p className="text-2xl font-bold text-black">
              {finnaState.affordability.rent.rentToIncomeRatioPct}% <span className="text-xs text-[#737373]">/ {finnaState.affordability.emi.dtiRatioPct}% DTI</span>
            </p>
            <p className="text-xs text-[#737373]">
              Rent ₹{finnaState.expenses.monthlyRent} + EMI ₹{finnaState.expenses.monthlyEmi} both safely covered
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Account Aggregator (AA) Banking Feed */}
      {activeTab === "aa" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-xl bg-black text-white">
                <Landmark className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-black">Verified Bank Accounts (Setu AA Gateway)</p>
                <p className="text-[11px] text-[#737373]">Consent active for 1 year · FIP linked to PAN ****8492</p>
              </div>
            </div>
            <span className="text-xs font-bold font-mono text-black bg-white px-3 py-1 rounded-full border border-[#e5e5e5]">
              Total Balance: ₹{finnaState.arun.totalBankBalance.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {masterData.bankAccounts.map((acc) => (
              <div key={acc.id} className="p-4 rounded-2xl border border-[#e5e5e5] bg-white flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-black">{acc.bankName}</p>
                  <p className="text-[11px] text-[#737373]">{acc.accountType} · {acc.maskedAccount}</p>
                </div>
                <p className="text-base font-bold text-black">₹{acc.balance.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#fafafa] border border-[#e5e5e5]">
              <span className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Fixed Obligations</span>
              <p className="text-xs font-semibold text-black">Rent: ₹{finnaState.expenses.monthlyRent}/mo (Due 5th)</p>
              <p className="text-xs font-semibold text-black mt-1">EMI: ₹{finnaState.expenses.monthlyEmi}/mo (Due 10th)</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#fafafa] border border-[#e5e5e5]">
              <span className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Verified Savings</span>
              <p className="text-xs font-semibold text-black">Liquid Bank: ₹{finnaState.savings.liquidBankSavings.toLocaleString("en-IN")}</p>
              <p className="text-xs font-semibold text-black mt-1">Emergency Fund: ₹{finnaState.savings.emergencyFund.toLocaleString("en-IN")}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#fafafa] border border-[#e5e5e5]">
              <span className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Insurance Audit</span>
              <p className="text-xs font-semibold text-black">e-Shram: ₹2,00,000 Accidental</p>
              <p className="text-xs font-semibold text-red-600 mt-1">Health: Missing (Gap detected)</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Future Gig-Economy Data Layer (Simulated Protocol) */}
      {activeTab === "gig" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-amber-600 shrink-0" />
              <span>
                <strong>Simulated Future Protocol:</strong> This layer simulates direct platform worker telemetry via open worker protocols (distinct from RBI Account Aggregator banking feeds).
              </span>
            </div>
            <span className="font-mono text-[10px] bg-amber-200/60 px-2 py-0.5 rounded text-amber-950 font-bold">
              SIMULATED
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {gigData.platforms.map((p) => (
              <div key={p.platform} className="p-5 rounded-2xl border border-[#e5e5e5] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-black" />
                    <h3 className="font-bold text-sm text-black">{p.platform}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-black bg-[#f5f5f5] px-2 py-0.5 rounded border border-[#e5e5e5]">
                    ₹{p.monthlyNetEarnings.toLocaleString("en-IN")}/mo Net
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#737373]">
                  <div>Tenure: <strong className="text-black">{p.tenureMonths} mo</strong></div>
                  <div>Rating: <strong className="text-black">{p.rating} ★</strong></div>
                  <div>Working Days: <strong className="text-black">{p.workingDaysPerMonth} days</strong></div>
                  <div>Daily Hours: <strong className="text-black">{p.activeHoursPerDay} hrs</strong></div>
                  <div>Trips/Orders: <strong className="text-black">{p.completedTripsOrOrders}</strong></div>
                  <div>Incentives: <strong className="text-black">+₹{p.incentivesEarned}</strong></div>
                  <div>Commissions: <strong className="text-black">−₹{p.platformCommissions}</strong></div>
                  <div>1% TDS: <strong className="text-black">−₹{p.tdsDeductions}</strong></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] flex flex-wrap items-center justify-between text-xs gap-3">
            <div>Total Monthly Net: <strong className="text-black">₹{gigData.aggregate.totalNetMonthly.toLocaleString("en-IN")}</strong></div>
            <div>Combined Active Days: <strong className="text-black">{gigData.aggregate.totalActiveDays} days</strong></div>
            <div>Daily Active Hours: <strong className="text-black">{gigData.aggregate.avgDailyHours} hrs</strong></div>
            <div>Volatility Index: <strong className="text-black">{gigData.aggregate.compositeVolatilityIndex} (Low)</strong></div>
          </div>
        </div>
      )}

      {/* TAB 4: Section 14 Mandatory Data-Change Test Simulator */}
      {activeTab === "simulator" && (
        <div className="space-y-6 bg-[#fafafa] p-6 rounded-2xl border border-[#e5e5e5]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block mb-1">
              Section 14 Compliance Test Console
            </span>
            <h3 className="text-base font-bold text-black">Simulate Live Data Changes</h3>
            <p className="text-xs text-[#737373] mt-1">
              Verify that when underlying data changes, Cash Flow, Safe-to-Spend, Health Score, and Copilot answers automatically and visibly change.
            </p>
          </div>

          {/* Quick 1-Click Test Scenarios */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-black">1-Click Test Presets:</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleLowIncomeTest}
                className="p-3.5 rounded-xl border border-[#e5e5e5] bg-white hover:border-black text-left transition cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black">1. Low Income Shock</span>
                  <TrendingDown className="size-3.5 text-red-600" />
                </div>
                <p className="text-[11px] text-[#737373] mt-1">
                  Reduces gig income to ₹18,000. Cashflow turns negative, Safe-to-Spend drops to ₹0.
                </p>
              </button>

              <button
                type="button"
                onClick={handleHighEmiTest}
                className="p-3.5 rounded-xl border border-[#e5e5e5] bg-white hover:border-black text-left transition cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black">2. High EMI Burden</span>
                  <AlertTriangle className="size-3.5 text-amber-600" />
                </div>
                <p className="text-[11px] text-[#737373] mt-1">
                  Increases EMI to ₹8,500. DTI jumps to 26%, Safe-to-Spend reduces.
                </p>
              </button>

              <button
                type="button"
                onClick={handleLowSavingsTest}
                className="p-3.5 rounded-xl border border-[#e5e5e5] bg-white hover:border-black text-left transition cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black">3. Low Reserve Shock</span>
                  <Sliders className="size-3.5 text-black" />
                </div>
                <p className="text-[11px] text-[#737373] mt-1">
                  Reduces liquid savings to ₹2,000, spikes volatility to 0.48. Score drops to 48.
                </p>
              </button>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-4 pt-2 border-t border-[#e5e5e5]">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-black">Simulate Gig Monthly Net Income:</span>
                <span className="font-mono font-bold text-black">₹{gigData.aggregate.totalNetMonthly.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="12000"
                max="50000"
                step="500"
                value={gigData.aggregate.totalNetMonthly}
                onChange={(e) => handleGigIncomeSlider(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-black">Simulate Monthly Bike EMI:</span>
                <span className="font-mono font-bold text-black">₹{finnaState.expenses.monthlyEmi.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="200"
                value={finnaState.expenses.monthlyEmi}
                onChange={(e) => handleEmiSlider(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-[#737373]">
              Try asking Copilot <em>"How much can I safely spend?"</em> or <em>"Can I pay my EMI?"</em> before and after adjusting!
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToBaseline}
              className="rounded-xl border-[#e5e5e5] text-xs h-9 cursor-pointer"
            >
              <RotateCcw className="size-3.5 mr-1.5" /> Reset to Arun Baseline
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
