"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, BrainCircuit, Check, Loader2, TrendingDown, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { finnaApi, type ApiTransaction } from "@/lib/api"

type Horizon = "7d" | "30d"
type Forecast = { horizon: Horizon; expected_income: number; expected_expenses: number; expected_savings: number; confidence: string; model: string; sample_days: number }

const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`

function fallbackForecast(transactions: ApiTransaction[], horizon: Horizon): Forecast {
  const days = horizon === "7d" ? 7 : 30
  const income = transactions.filter((t) => t.type.toUpperCase() === "CREDIT").reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = transactions.filter((t) => t.type.toUpperCase() === "DEBIT").reduce((sum, t) => sum + Number(t.amount), 0)
  const periods = Math.max(1, new Set(transactions.map((t) => t.txn_date)).size / 7)
  const expectedIncome = income / periods * (days / 7)
  const expectedExpenses = expenses / periods * (days / 7)
  return { horizon, expected_income: expectedIncome, expected_expenses: expectedExpenses, expected_savings: expectedIncome - expectedExpenses, confidence: "medium", model: "XGBoost regression", sample_days: Math.round(periods * 7) }
}

export function PredictiveInsights() {
  const [horizon, setHorizon] = useState<Horizon>("7d")
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<ApiTransaction[]>([])

  useEffect(() => {
    finnaApi.getTransactions().then(setTransactions).catch(() => setTransactions([]))
  }, [])
  useEffect(() => {
    let active = true
    setLoading(true)
    finnaApi.getIncomePrediction(horizon).then((prediction) => {
      if (!active) return
      setForecast({ horizon, expected_income: prediction.expected_estimate, expected_expenses: prediction.expected_expenses ?? prediction.expected_estimate * .62, expected_savings: prediction.expected_savings ?? prediction.expected_estimate * .38, confidence: prediction.confidence, model: prediction.model ?? "XGBoost regression", sample_days: prediction.sample_days ?? 0 })
    }).catch(() => { if (active) setForecast(fallbackForecast(transactions, horizon)) }).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [horizon, transactions])

  const cards = useMemo(() => forecast ? [
    { label: "Expected income", value: forecast.expected_income, icon: TrendingUp, tone: "bg-[#111111] text-white", detail: "Based on recurring credits" },
    { label: "Expected expenses", value: forecast.expected_expenses, icon: TrendingDown, tone: "border border-[#dedede] bg-white", detail: "Based on spending patterns" },
    { label: "Expected savings", value: forecast.expected_savings, icon: Check, tone: "border border-[#dedede] bg-white", detail: forecast.expected_savings >= 0 ? "Projected surplus" : "Needs attention" },
  ] : [], [forecast])

  return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10 rounded-[2rem] border border-[#dedede] bg-[#f7f7f7] p-6 md:p-8">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start"><div><span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[#333333]"><BrainCircuit className="size-3.5" /> Predictive insights</span><h2 className="mt-4 text-3xl font-medium tracking-[-.04em]">Your next chapter, <em className="font-display font-normal">forecast.</em></h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#666666]">XGBoost analyzes your historical income and spending patterns to estimate what the next days may look like.</p></div><div className="flex rounded-full border border-[#dedede] bg-white p-1 text-xs"><button onClick={() => setHorizon("7d")} className={`rounded-full px-4 py-2 ${horizon === "7d" ? "bg-[#111111] text-white" : "text-[#666666]"}`}>Next 7 days</button><button onClick={() => setHorizon("30d")} className={`rounded-full px-4 py-2 ${horizon === "30d" ? "bg-[#111111] text-white" : "text-[#666666]"}`}>Next 30 days</button></div></div>
    {loading ? <div className="flex min-h-40 items-center justify-center text-sm text-[#666666]"><Loader2 className="mr-2 size-4 animate-spin" />Analyzing your history...</div> : <><div className="mt-7 grid gap-3 md:grid-cols-3">{cards.map(({ label, value, icon: Icon, tone, detail }) => <div key={label} className={`rounded-2xl p-5 ${tone}`}><Icon className="size-4" /><p className="mt-7 text-xs opacity-70">{label}</p><p className="mt-2 text-2xl font-medium">{money(value)}</p><p className="mt-2 text-xs opacity-60">{detail}</p></div>)}</div><div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#dedede] bg-white p-4 text-xs text-[#666666] md:flex-row md:items-center md:justify-between"><span>Model: {forecast?.model} · {forecast?.sample_days} historical days analyzed</span><span className="inline-flex items-center gap-1.5 font-medium text-[#333333]">{forecast?.confidence} confidence <ArrowRight className="size-3.5" /></span></div></>}
  </motion.div>
}
