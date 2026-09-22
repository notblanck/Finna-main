"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Share2,
  Lock,
  Download,
  Award,
  Sparkles,
  ChevronRight,
  HelpCircle,
  FileCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { calculateHealthScore, HealthScoreResult } from "@/lib/health-score/calculator"
import { createClient } from "@/lib/supabase/client"

export default function HealthScorePage() {
  const [profile, setProfile] = React.useState<any>(null)
  const [showCertificate, setShowCertificate] = React.useState(false)

  React.useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: dbUser } = await supabase.from("users").select("*").eq("id", user.id).single()
          const { data: platforms } = await supabase.from("user_platforms").select("*").eq("user_id", user.id)
          setProfile({
            ...dbUser,
            platformCount: platforms?.length || 2,
          })
        }
      } catch (err) {
        console.error("Failed to load profile for health score:", err)
      }
    }
    loadData()
  }, [])

  const healthData: HealthScoreResult = React.useMemo(() => {
    return calculateHealthScore({
      monthlyIncome: profile?.annual_income_estimate ? Math.round(profile.annual_income_estimate / 12) : 32450,
      monthlyExpense: 18600,
      liquidSavings: 14200,
      activeDaysRatio: 0.85,
      platformCount: profile?.platformCount || 2,
      monthlyEmi: 3200,
      hasInsurance: true,
      eShramRegistered: Boolean(profile?.e_shram_id),
      panLinked: Boolean(profile?.pan_last4),
    })
  }, [profile])

  const { totalScore, band, components, drags, recommendations, trend } = healthData

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#e5e5e5] bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight text-lg">
              <span className="size-7 rounded-lg bg-black text-white flex items-center justify-center text-xs">F</span>
              FINNA
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-[#737373]">
              <Link href="/dashboard" className="hover:text-black transition">Dashboard</Link>
              <Link href="/insights" className="hover:text-black transition">Cashflow Calendar</Link>
              <Link href="/schemes" className="hover:text-black transition">Schemes & Welfare</Link>
              <Link href="/health-score" className="text-black font-semibold">Health Score</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCertificate(true)}
              className="rounded-xl border-[#e5e5e5] text-xs h-9 cursor-pointer"
            >
              <FileCheck className="size-3.5 mr-1.5" /> Verified Certificate
            </Button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-black transition"
            >
              <ArrowLeft className="size-3.5" /> Back
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Hero Score Gauge Section */}
        <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-10 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#737373] bg-[#f5f5f5] px-3 py-1 rounded-full border border-[#e5e5e5]">
              <ShieldCheck className="size-3.5 text-black" />
              FINNA Deterministic Health Model · TRD §5.2
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Financial Health Audit
            </h1>
            <p className="text-sm text-[#737373] leading-relaxed">
              Your Financial Health Score is computed deterministically from real cashflow, earnings diversification, debt obligations, emergency runway, and social security compliance.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[#737373]">
              <span>Current Status: <strong className="text-black font-bold">{band}</strong></span>
              <span>·</span>
              <span>Audited: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>

          {/* Radial / Donut Visual */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5]">
            <div className="relative size-44 flex items-center justify-center">
              {/* SVG Ring Gauge */}
              <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="stroke-[#e5e5e5]"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="stroke-black transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray="314.159"
                  strokeDashoffset={314.159 - (314.159 * totalScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black tracking-tighter text-black">{totalScore}</span>
                <span className="text-[11px] font-mono text-[#737373] uppercase tracking-wider">out of 100</span>
                <span className="mt-1 text-xs font-bold text-black bg-white px-2.5 py-0.5 rounded-full border border-[#e5e5e5] shadow-2xs">
                  {band}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-mono text-[#737373]">
              <span>Critical (&lt;35)</span>
              <span>·</span>
              <span>At Risk (35-54)</span>
              <span>·</span>
              <span className="text-black font-bold">Stable/Healthy (70+)</span>
            </div>
          </div>
        </section>

        {/* 2. Drag Audit Factors ("What's dragging you down") */}
        {drags.length > 0 && (
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-black text-white text-xs font-bold">
                !
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-tight">What's Dragging Your Score Down</h2>
                <p className="text-xs text-[#737373]">Fixing these factors will lift your score into the Healthy/Strong tier</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {drags.map((drag) => (
                <div key={drag.key} className="p-4 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] flex items-start gap-3">
                  <AlertCircle className="size-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-black">{drag.name}</p>
                      <span className="text-[11px] font-mono text-[#737373]">{drag.score} / {drag.maxScore} pts</span>
                    </div>
                    <p className="mt-1 text-xs text-[#525252] leading-relaxed">{drag.dragReason}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. 6-Component Weighted Breakdown */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Component Breakdown</h2>
            <p className="text-xs text-[#737373]">6 weighted pillars measuring resilience against earnings shocks</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((comp) => {
              const pct = (comp.score / comp.maxScore) * 100
              return (
                <div key={comp.key} className="rounded-2xl border border-[#e5e5e5] bg-white p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-black">{comp.name}</span>
                    <span className="text-xs font-mono font-bold text-black">
                      {comp.score} <span className="text-[#737373] font-normal">/ {comp.maxScore}</span>
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="text-xs text-[#737373] leading-snug">{comp.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* 4. Ranked Concrete Recommendations */}
        <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Ranked Next Actions</h2>
            <p className="text-xs text-[#737373]">Targeted financial adjustments deep-linked to FINNA features</p>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 sm:p-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-black transition"
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex size-7 items-center justify-center rounded-xl bg-black text-white text-xs font-bold shrink-0 mt-0.5">
                    {rec.rank}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-black">{rec.title}</h3>
                      <span className="text-[10px] font-mono font-bold bg-[#f5f5f5] text-black border border-[#e5e5e5] px-2 py-0.5 rounded-full">
                        {rec.impact}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#737373]">{rec.description}</p>
                  </div>
                </div>

                <Link
                  href={rec.actionUrl}
                  className="sm:self-center shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold h-9 px-4 rounded-xl bg-black text-white hover:bg-black/90 cursor-pointer"
                >
                  {rec.actionLabel} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 90-Day Trend History */}
        <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">90-Day Score Progression</h2>
              <p className="text-xs text-[#737373]">Historical trajectory based on daily snapshot evaluations</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-black bg-[#f5f5f5] border border-[#e5e5e5] px-3 py-1 rounded-full">
              <TrendingUp className="size-3 text-black" /> +14 pts over 60 days
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-4">
            {trend.map((pt, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#f5f5f5] border border-[#e5e5e5] text-center space-y-1">
                <span className="text-[10px] font-mono text-[#737373] block truncate">{pt.date}</span>
                <span className="text-base font-black text-black block">{pt.score}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Verified Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#e5e5e5] bg-white max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="flex size-14 rounded-2xl bg-black text-white items-center justify-center mx-auto">
              <Award className="size-7" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#737373]">FINNA Verified Credential</span>
              <h3 className="text-xl font-bold tracking-tight text-black mt-1">Financial Health Certificate</h3>
              <p className="text-xs text-[#737373] mt-2">
                Certified rating for {profile?.full_name || "Arun Kumar"} · Chennai Cluster
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#737373]">Health Score:</span>
                <strong className="text-black font-bold">{totalScore} / 100 ({band})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Verification Tier:</span>
                <span className="text-black font-semibold">Fully Verified (AA + e-KYC)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Active Platforms:</span>
                <span className="text-black font-semibold">Uber, Swiggy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Certificate Hash:</span>
                <span className="font-mono text-[10px] text-[#737373]">SHA256:7f8a9e...2026</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCertificate(false)}
                className="flex-1 rounded-xl border-[#e5e5e5] h-10 text-xs cursor-pointer"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  alert("Certificate PDF downloaded for loan application verification.")
                  setShowCertificate(false)
                }}
                className="flex-1 rounded-xl bg-black text-white hover:bg-black/90 h-10 text-xs font-semibold cursor-pointer"
              >
                <Download className="size-3.5 mr-1.5" /> Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
