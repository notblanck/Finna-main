"use client"

import React, { useState, useEffect } from "react"
import {
  Sparkles,
  Info,
  Edit2,
  Check,
  X,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Landmark,
  HelpCircle,
} from "lucide-react"
import {
  EstimatedFinancialProfile,
  getEstimatedFinancialProfile,
  updateEstimatedField,
  isEstimateModeActive,
} from "@/lib/data/estimate-store"

interface EstimatedProfileCardProps {
  onOpenEditModal?: () => void
}

export function EstimatedProfileCard({ onOpenEditModal }: EstimatedProfileCardProps) {
  const [profile, setProfile] = useState<EstimatedFinancialProfile | null>(null)
  const [isEstimateMode, setIsEstimateMode] = useState(false)
  const [showHowEstimated, setShowHowEstimated] = useState(false)

  // Edit states for income, rent, emi
  const [editingField, setEditingField] = useState<"income" | "rent" | "emi" | null>(null)
  const [tempValue, setTempValue] = useState<string>("")

  const loadData = () => {
    const prof = getEstimatedFinancialProfile()
    setProfile(prof)
    setIsEstimateMode(isEstimateModeActive())
  }

  useEffect(() => {
    loadData()

    if (typeof window !== "undefined") {
      window.addEventListener("finna_data_updated", loadData)
      return () => window.removeEventListener("finna_data_updated", loadData)
    }
  }, [])

  if (!profile || !isEstimateMode) {
    return null
  }

  const handleStartEdit = (field: "income" | "rent" | "emi", currentVal: number) => {
    setEditingField(field)
    setTempValue(String(Math.round(currentVal)))
  }

  const handleSaveEdit = (field: "income" | "rent" | "emi") => {
    const num = parseFloat(tempValue.replace(/,/g, ""))
    if (!isNaN(num) && num >= 0) {
      updateEstimatedField(field, num)
      setEditingField(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setTempValue("")
  }

  const badgeText = profile.data_source_badge === "synthetic"
    ? "Illustrative data"
    : profile.data_source_badge === "city_average"
    ? "City average"
    : `ML estimate (city data, ${profile.data_year || 2026})`

  return (
    <div className="mt-8 rounded-3xl border border-[#e5e5e5] bg-white p-6 md:p-8 shadow-sm space-y-6">
      {/* Header with City & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0f0f0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <Sparkles className="size-3 text-emerald-600" />
              <span>Estimated financial profile for {profile.inputs.city}</span>
            </span>
            <span className="text-xs text-[#737373]">({profile.inputs.state})</span>
          </div>
          <p className="text-xs text-[#737373] mt-1">
            {profile.metadata.synthetic
              ? "Illustrative data — synthetic estimates, not real worker statistics. You can customize any number to reflect your finances."
              : "Predictive financial profile based on city data. You can customize any number to reflect your finances."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Data Source Badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] px-2.5 py-1 text-[11px] font-mono text-[#525252]">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>{badgeText}</span>
            <span className="text-[#a3a3a3]">· {profile.model_version}</span>
          </span>

          {/* How is this estimated button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHowEstimated(!showHowEstimated)}
              className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] px-2.5 py-1 text-[11px] text-[#737373] hover:text-black hover:bg-[#f5f5f5] transition cursor-pointer"
            >
              <HelpCircle className="size-3" />
              <span>How is this estimated?</span>
            </button>

            {/* How is this estimated popover */}
            {showHowEstimated && (
              <div className="absolute right-0 top-8 z-30 w-80 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-xl text-xs space-y-2.5 text-left">
                <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-2">
                  <h4 className="font-semibold text-black flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-black" />
                    How FINNA estimates
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowHowEstimated(false)}
                    className="text-[#a3a3a3] hover:text-black"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <p className="text-[#525252] leading-relaxed">
                  We train a multi-target <strong>XGBoost regressor</strong> on worker samples, blended with the supplied city-average baseline and adjusted for month seasonality.
                </p>
                <div className="rounded-xl bg-[#fafafa] p-2.5 space-y-1 text-[11px] border border-[#f0f0f0]">
                  <p className="text-[#525252]">
                    • <strong>Model Version:</strong> {profile.model_version}
                  </p>
                  <p className="text-[#525252]">
                    • <strong>Dataset Source:</strong> {profile.data_source} ({profile.data_year})
                  </p>
                  <p className="text-[#525252]">
                    • <strong>City Baseline:</strong> ₹{Math.round(profile.baseline_city_average.weekly_income).toLocaleString("en-IN")}/wk
                  </p>
                  <p className="text-[#525252]">
                    • <strong>Confidence:</strong> {(profile.confidence_level || profile.metadata.confidence).toUpperCase()}
                  </p>
                </div>
                <p className="text-[10px] text-[#737373] italic">
                  {profile.metadata.synthetic
                    ? "Illustrative data only: this synthetic estimate is not a real statistic, actual income, or verified income."
                    : "This is an educational estimate, not your actual or verified income. Connect bank sync anytime for real-time accuracy."}
                </p>
              </div>
            )}
          </div>

          {/* Change details button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenEditModal) onOpenEditModal()
              else if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("finna_open_edit_details"))
              }
            }}
            className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] px-2.5 py-1 text-[11px] text-[#737373] hover:text-black hover:bg-[#f5f5f5] transition cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Change details</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Estimations */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Weekly & Monthly Income with Range */}
        <div className="rounded-2xl bg-black p-5 text-white flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#a3a3a3]">Expected gig income</span>
              {profile.user_edited?.income ? (
                <span className="rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 text-[10px] font-mono">
                  your input
                </span>
              ) : (
                <span className="text-[10px] font-mono text-[#a3a3a3] uppercase tracking-wider">
                  city estimate
                </span>
              )}
            </div>

            {editingField === "income" ? (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-28 rounded-lg bg-neutral-800 px-2.5 py-1 text-sm text-white font-mono border border-neutral-600 focus:outline-none focus:border-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit("income")}
                  className="p-1 rounded bg-white text-black hover:bg-[#e5e5e5]"
                >
                  <Check className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1 rounded text-neutral-400 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <p className="text-3xl font-medium tracking-tight text-white">
                    ₹{Math.round(profile.weekly_income.expected).toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-[#a3a3a3] ml-1">/ wk</span>
                  </p>
                  <p className="text-xs text-[#a3a3a3] mt-0.5">
                    ~₹{Math.round(profile.monthly_income.expected).toLocaleString("en-IN")} monthly net
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartEdit("income", profile.monthly_income.expected)}
                  className="p-1 rounded text-neutral-400 hover:text-white transition"
                  title="Customize monthly income"
                >
                  <Edit2 className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Visual Low / High Range Bar */}
          <div className="mt-4 pt-3 border-t border-neutral-800 space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-[#a3a3a3]">
              <span>Low: ₹{Math.round(profile.weekly_income.low).toLocaleString("en-IN")}</span>
              <span>Expected</span>
              <span>High: ₹{Math.round(profile.weekly_income.high).toLocaleString("en-IN")}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden relative">
              <div className="absolute inset-y-0 bg-neutral-500 rounded-full left-1/4 right-1/4" />
              <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-white rounded-full -translate-x-1/2" />
            </div>
            <p className="text-[10px] text-[#737373]">
              City average: ₹{Math.round(profile.baseline_city_average.weekly_income).toLocaleString("en-IN")}/wk
            </p>
          </div>
        </div>

        {/* Typical Rent & Expenses */}
        <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#737373]">Estimated monthly expenses</span>
              <span className="text-xs font-mono font-medium text-black">
                ₹{Math.round(profile.monthly_expenses.total).toLocaleString("en-IN")}/mo
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {/* Rent row */}
              <div className="flex items-center justify-between py-1 border-b border-[#f5f5f5] text-xs">
                <span className="text-[#737373] flex items-center gap-1.5">
                  Typical Rent
                  {profile.user_edited?.rent && (
                    <span className="text-[9px] text-emerald-600 font-mono">your input</span>
                  )}
                </span>
                {editingField === "rent" ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-20 rounded border border-[#e5e5e5] px-1.5 py-0.5 text-xs font-mono"
                      autoFocus
                    />
                    <button onClick={() => handleSaveEdit("rent")} className="text-emerald-600">
                      <Check className="size-3" />
                    </button>
                    <button onClick={handleCancelEdit} className="text-[#a3a3a3]">
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <strong className="text-black font-semibold">
                      ₹{Math.round(profile.typical_rent.expected).toLocaleString("en-IN")}
                    </strong>
                    <button
                      type="button"
                      onClick={() => handleStartEdit("rent", profile.typical_rent.expected)}
                      className="text-[#a3a3a3] hover:text-black"
                    >
                      <Edit2 className="size-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* EMI row */}
              <div className="flex items-center justify-between py-1 border-b border-[#f5f5f5] text-xs">
                <span className="text-[#737373] flex items-center gap-1.5">
                  Vehicle EMI
                  {profile.user_edited?.emi && (
                    <span className="text-[9px] text-emerald-600 font-mono">your input</span>
                  )}
                </span>
                {editingField === "emi" ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-20 rounded border border-[#e5e5e5] px-1.5 py-0.5 text-xs font-mono"
                      autoFocus
                    />
                    <button onClick={() => handleSaveEdit("emi")} className="text-emerald-600">
                      <Check className="size-3" />
                    </button>
                    <button onClick={handleCancelEdit} className="text-[#a3a3a3]">
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <strong className="text-black font-semibold">
                      ₹{Math.round(profile.monthly_expenses.emi_burden).toLocaleString("en-IN")}
                    </strong>
                    <button
                      type="button"
                      onClick={() => handleStartEdit("emi", profile.monthly_expenses.emi_burden)}
                      className="text-[#a3a3a3] hover:text-black"
                    >
                      <Edit2 className="size-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Food & Transport */}
              <div className="flex items-center justify-between py-1 text-xs text-[#737373]">
                <span>Food & Utilities</span>
                <span className="text-black font-medium">
                  ₹{Math.round(profile.monthly_expenses.food_utilities).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 text-xs text-[#737373]">
                <span>Transport & Fuel ({profile.inputs.hours}h/wk)</span>
                <span className="text-black font-medium">
                  ₹{Math.round(profile.monthly_expenses.transport_fuel).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[#737373] pt-2">
            Click pencil to edit any value; the engine recalculates instantly.
          </p>
        </div>

        {/* Safe-to-Spend & Savings Capacity */}
        <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#737373]">Safe-to-spend today</span>
              <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
                Daily Buffer
              </span>
            </div>
            <p className="mt-3 text-3xl font-medium tracking-tight text-black">
              ₹{Math.round(profile.safe_to_spend_today).toLocaleString("en-IN")}
              <span className="text-xs font-normal text-[#737373] ml-1">/ day</span>
            </p>
            <p className="mt-1 text-xs text-[#737373]">
              Protects rent, loan EMI, fuel, and reserve goals
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f0f0f0] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737373]">Safe savings capacity:</span>
              <strong className="text-black font-semibold">
                ₹{Math.round(profile.safe_savings_capacity).toLocaleString("en-IN")}/mo
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs text-[#737373]">
              <span>Platform / Work:</span>
              <span className="capitalize text-black font-medium">{profile.inputs.platform}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Next Action */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Sparkles className="size-4.5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-emerald-900">Suggested Next Action</p>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {profile.suggested_action}
            </p>
          </div>
        </div>

        <a
          href="/aa?new=true"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-900 transition self-start sm:self-auto shrink-0 shadow-xs cursor-pointer"
        >
          <Landmark className="size-3.5" />
          <span>Connect Bank Sync</span>
          <ArrowRight className="size-3" />
        </a>
      </div>
    </div>
  )
}
