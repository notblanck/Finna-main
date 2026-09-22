"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Calendar,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  Lock,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockAA } from "@/lib/aa/mock-aa"
import { setuAA } from "@/lib/aa/setu-aa"
import { AATransaction } from "@/lib/aa/interface"
import { createClient } from "@/lib/supabase/client"

export default function AccountAggregatorPage() {
  const [step, setStep] = React.useState<"init" | "authorizing" | "review" | "active">("init")
  const [providerMode, setProviderMode] = React.useState<"setu" | "mock">("mock")
  const [fiTypes, setFiTypes] = React.useState<string[]>(["DEPOSIT"])
  const [dateRange, setDateRange] = React.useState<string>("90d")
  const [vpa, setVpa] = React.useState("9876543210@setu")
  const [isLoading, setIsLoading] = React.useState(false)

  // Transaction mapping review state
  const [transactions, setTransactions] = React.useState<AATransaction[]>([])
  const [activeConsent, setActiveConsent] = React.useState<any>(null)
  const [savedCount, setSavedCount] = React.useState(0)

  const handleStartConsent = async () => {
    setIsLoading(true)
    setStep("authorizing")

    try {
      const provider = providerMode === "setu" ? setuAA : mockAA
      const res = await provider.createConsent({
        userId: "user-current",
        vpa,
        fiTypes,
        dateRangeFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        dateRangeTo: new Date().toISOString(),
      })

      setActiveConsent(res)

      // Simulate Setu sandbox approval delay
      setTimeout(async () => {
        const session = await provider.requestFIData(res.id)
        const data = await provider.fetchFIData(session.sessionId)
        setTransactions(data.transactions)
        setStep("review")
        setIsLoading(false)
      }, 1500)
    } catch (err) {
      console.error("Consent failed:", err)
      setIsLoading(false)
      setStep("init")
    }
  }

  const handleCommitMappings = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Save consent in Supabase
        await supabase.from("consents").insert({
          user_id: user.id,
          provider: providerMode,
          consent_ref: activeConsent?.consentHandle || `CONSENT-${Date.now()}`,
          status: "APPROVED",
          fi_types: fiTypes,
        })

        // Commit income entries for credits
        for (const tx of transactions) {
          if (tx.type === "CREDIT" && tx.mappedPlatform) {
            await supabase.from("income_entries").insert({
              user_id: user.id,
              platform: tx.mappedPlatform,
              date: tx.date,
              gross_amount: tx.amount,
              source: "aa",
              notes: tx.narration,
            })
          } else if (tx.type === "DEBIT") {
            await supabase.from("expenses").insert({
              user_id: user.id,
              date: tx.date,
              amount: tx.amount,
              category: tx.categoryGuess || "General",
              source: "aa",
              notes: tx.narration,
            })
          }
        }
      }

      setSavedCount(transactions.length)
      setStep("active")
    } catch (err) {
      console.error("Failed to commit mappings:", err)
      setStep("active")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevoke = async () => {
    if (confirm("Are you sure you want to revoke this Account Aggregator consent?")) {
      setIsLoading(true)
      try {
        const provider = providerMode === "setu" ? setuAA : mockAA
        if (activeConsent?.id) {
          await provider.revokeConsent(activeConsent.id)
        }
        setActiveConsent(null)
        setStep("init")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#e5e5e5] bg-white/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight text-lg">
              <span className="size-7 rounded-lg bg-black text-white flex items-center justify-center text-xs">F</span>
              FINNA
            </Link>
            <span className="text-xs font-mono font-semibold text-[#737373]">Account Aggregator (AA)</span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-black transition"
          >
            <ArrowLeft className="size-4" /> Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Sandbox Notice Banner */}
      <div className="bg-[#f5f5f5] border-b border-[#e5e5e5] py-2.5 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#525252]">
            <ShieldAlert className="size-4 text-black shrink-0" />
            <span>
              <strong>Setu AA FIU Sandbox Mode:</strong> Transactions simulated for Chennai gig ecosystem (Uber, Swiggy, Rapido). No live banking data is touched.
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 font-mono text-[11px]">
            <button
              onClick={() => setProviderMode("mock")}
              className={`px-2 py-0.5 rounded cursor-pointer ${providerMode === "mock" ? "bg-black text-white" : "text-[#737373]"}`}
            >
              Mock AA
            </button>
            <span>/</span>
            <button
              onClick={() => setProviderMode("setu")}
              className={`px-2 py-0.5 rounded cursor-pointer ${providerMode === "setu" ? "bg-black text-white" : "text-[#737373]"}`}
            >
              Setu Sandbox
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {step === "init" && (
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#737373] bg-[#f5f5f5] px-3 py-1 rounded-full border border-[#e5e5e5]">
                RBI Regulated Account Aggregator Flow
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black mt-3">
                Link Your Bank via Account Aggregator
              </h1>
              <p className="mt-2 text-sm text-[#737373] leading-relaxed">
                FINNA acts as a Financial Information User (FIU) under RBI regulations. By granting read-only consent, we automatically detect and categorize your platform earnings (Uber, Swiggy, Zomato, Zepto) and fuel/maintenance expenses.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-black uppercase tracking-wider block mb-2">
                  Financial Information Types
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "DEPOSIT", label: "Savings & Current Accounts" },
                    { id: "TERM_DEPOSIT", label: "Fixed / Recurring Deposits" },
                  ].map((fi) => (
                    <button
                      key={fi.id}
                      type="button"
                      onClick={() =>
                        setFiTypes((prev) =>
                          prev.includes(fi.id) ? prev.filter((t) => t !== fi.id) : [...prev, fi.id]
                        )
                      }
                      className={`p-3.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                        fiTypes.includes(fi.id)
                          ? "bg-black text-white border-black"
                          : "bg-[#fafafa] text-black border-[#e5e5e5]"
                      }`}
                    >
                      <span>{fi.label}</span>
                      {fiTypes.includes(fi.id) && <Check className="size-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-black uppercase tracking-wider block mb-2">
                  Historical Statement Range
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "30d", label: "Last 30 Days" },
                    { id: "90d", label: "Last 90 Days (Recommended)" },
                    { id: "180d", label: "Last 6 Months" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setDateRange(r.id)}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold cursor-pointer transition ${
                        dateRange === r.id
                          ? "bg-black text-white border-black"
                          : "bg-[#fafafa] text-black border-[#e5e5e5]"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-black uppercase tracking-wider block mb-1">
                  AA Handle / Mobile VPA
                </label>
                <Input
                  value={vpa}
                  onChange={(e) => setVpa(e.target.value)}
                  className="h-11 bg-[#fafafa] border-[#e5e5e5]"
                  placeholder="e.g. 9876543210@setu"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] text-xs text-[#525252] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-black">
                  <Lock className="size-3.5" /> 100% Encrypted & Revocable Anytime
                </div>
                <p>
                  Consent is time-bound (12 months), read-only, and cannot be used to initiate transactions or debit money from your account.
                </p>
              </div>

              <Button
                onClick={handleStartConsent}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-black text-white hover:bg-black/90 font-semibold cursor-pointer text-sm"
              >
                Proceed to AA Authorization <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </section>
        )}

        {step === "authorizing" && (
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-12 text-center shadow-sm space-y-4">
            <Loader2 className="size-10 animate-spin mx-auto text-black" />
            <h2 className="text-xl font-bold text-black">Connecting to Setu AA Sandbox...</h2>
            <p className="text-xs text-[#737373] max-w-sm mx-auto">
              Simulating OTP approval and retrieving encrypted financial transaction history from State Bank of India.
            </p>
          </section>
        )}

        {step === "review" && (
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-black bg-[#f5f5f5] px-3 py-1 rounded-full border border-[#e5e5e5]">
                  Step 2 · Review & Confirm Categorization
                </span>
                <h2 className="text-xl font-bold tracking-tight text-black mt-2">
                  Detected Gig Payouts & Expenses
                </h2>
                <p className="text-xs text-[#737373]">
                  Verify automated mappings before they count toward your income forecast and safe-to-spend buffer.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#f5f5f5] px-3 py-1.5 rounded-xl border border-[#e5e5e5]">
                {transactions.length} Transactions
              </span>
            </div>

            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.txnId}
                  className="p-4 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                          tx.type === "CREDIT"
                            ? "bg-black text-white"
                            : "bg-[#e5e5e5] text-black"
                        }`}
                      >
                        {tx.type}
                      </span>
                      <span className="font-semibold text-black">{tx.narration}</span>
                    </div>
                    <p className="text-[#737373]">Date: {tx.date} · Detected Category: {tx.categoryGuess}</p>
                  </div>

                  <div className="flex items-center gap-4 sm:self-center">
                    <span className="font-black text-sm text-black">
                      {tx.type === "CREDIT" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] font-bold text-black bg-white px-2.5 py-1 rounded-lg border border-[#e5e5e5]">
                      {tx.mappedPlatform ? `Mapped: ${tx.mappedPlatform}` : tx.categoryGuess}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
              <Button
                variant="outline"
                onClick={() => setStep("init")}
                className="rounded-xl border-[#e5e5e5] h-11 px-5 cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCommitMappings}
                disabled={isLoading}
                className="rounded-xl bg-black text-white hover:bg-black/90 h-11 px-6 font-semibold cursor-pointer text-xs"
              >
                {isLoading ? "Committing Records..." : "Confirm & Commit to Dashboard"}
              </Button>
            </div>
          </section>
        )}

        {step === "active" && (
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 rounded-2xl bg-black text-white items-center justify-center">
                <CheckCircle2 className="size-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-black">
                  Account Aggregator Linked & Active
                </h2>
                <p className="text-xs text-[#737373]">
                  Consent is active. Live transactions are synced to your income forecast.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Consent Handle:</span>
                <span className="font-mono text-black font-semibold">{activeConsent?.consentHandle || "CONSENT-DEMO2026"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Provider:</span>
                <span className="text-black font-semibold">Setu AA (RBI Licensed NBFC-AA)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Status:</span>
                <span className="font-bold text-black bg-white px-2 py-0.5 rounded border border-[#e5e5e5]">APPROVED</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Linked Bank Account:</span>
                <span className="text-black font-semibold">State Bank of India (•••• 2841)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#737373]">Consent Expiry:</span>
                <span className="text-black font-semibold">September 2027 (12 Months)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={handleRevoke}
                className="rounded-xl border-[#e5e5e5] text-xs h-10 px-4 text-[#525252] hover:text-black hover:border-black cursor-pointer"
              >
                Revoke AA Consent
              </Button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-black text-white hover:bg-black/90 text-xs font-semibold cursor-pointer"
              >
                View Dashboard <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
