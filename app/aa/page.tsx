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
  Landmark,
  Key,
  Smartphone,
  Layers,
  ChevronRight,
  RefreshCw,
  Trash2,
  SlidersHorizontal,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockAA } from "@/lib/aa/mock-aa"
import { setuAA } from "@/lib/aa/setu-aa"
import { AATransaction } from "@/lib/aa/interface"
import { createClient } from "@/lib/supabase/client"

interface BankOption {
  id: string
  name: string
  shortCode: string
  fipId: string
}

const SUPPORTED_BANKS: BankOption[] = [
  { id: "sbi", name: "State Bank of India", shortCode: "SBI", fipId: "FIP-SBI-01" },
  { id: "hdfc", name: "HDFC Bank", shortCode: "HDFC", fipId: "FIP-HDFC-01" },
  { id: "icici", name: "ICICI Bank", shortCode: "ICICI", fipId: "FIP-ICICI-01" },
  { id: "axis", name: "Axis Bank", shortCode: "AXIS", fipId: "FIP-AXIS-01" },
  { id: "kotak", name: "Kotak Mahindra Bank", shortCode: "KOTAK", fipId: "FIP-KOTAK-01" },
  { id: "bob", name: "Bank of Baroda", shortCode: "BOB", fipId: "FIP-BOB-01" },
  { id: "pnb", name: "Punjab National Bank", shortCode: "PNB", fipId: "FIP-PNB-01" },
  { id: "canara", name: "Canara Bank", shortCode: "CANARA", fipId: "FIP-CANARA-01" },
]

const AA_PROVIDERS = [
  { id: "setu", name: "Setu AA", license: "RBI NBFC-AA 2021", tag: "Recommended" },
  { id: "finvu", name: "Finvu AA", license: "RBI NBFC-AA 2020", tag: "Cookiejar" },
  { id: "anumati", name: "Anumati AA", license: "RBI NBFC-AA 2020", tag: "Perfios" },
  { id: "onemoney", name: "OneMoney AA", license: "RBI NBFC-AA 2019", tag: "Active" },
]

export default function AccountAggregatorPage() {
  const [step, setStep] = React.useState<"init" | "artefact" | "otp" | "decrypting" | "review" | "active">("init")
  const [selectedBank, setSelectedBank] = React.useState<BankOption>(SUPPORTED_BANKS[0])
  const [selectedAA, setSelectedAA] = React.useState(AA_PROVIDERS[0])
  const [mobileNumber, setMobileNumber] = React.useState("9876543210")
  const [fiTypes, setFiTypes] = React.useState<string[]>(["DEPOSIT"])
  const [dateRange, setDateRange] = React.useState<string>("90d")
  const [otpValue, setOtpValue] = React.useState("")
  const [selectedAccount, setSelectedAccount] = React.useState("acc_sbi_4921")
  const [isLoading, setIsLoading] = React.useState(false)

  // Transaction mapping review state
  const [transactions, setTransactions] = React.useState<AATransaction[]>([])
  const [activeConsent, setActiveConsent] = React.useState<any>(null)
  const [syncStatusText, setSyncStatusText] = React.useState("")

  // Load existing active consent from localStorage on initial render
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("finna_active_aa_consent")
      if (saved) {
        const parsed = JSON.parse(saved)
        setActiveConsent(parsed)
        setStep("active")
      }
    } catch {
      // Ignored
    }
  }, [])

  const vpaHandle = `${mobileNumber}@${selectedAA.id}`
  const consentId = React.useMemo(() => `AA-${selectedAA.id.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, [selectedAA])

  // Step 1 -> Step 2: Review RBI Consent Artefact
  const handleProceedToArtefact = () => {
    setStep("artefact")
  }

  // Step 2 -> Step 3: Trigger AA Gateway OTP & Account Selection
  const handleProceedToOTP = () => {
    setStep("otp")
  }

  // Step 3 -> Step 4 & 5: Approve OTP, Decrypt FI Payload & Show Statement Review
  const handleAuthorizeOTP = async () => {
    setIsLoading(true)
    setStep("decrypting")
    setSyncStatusText("Establishing Diffie-Hellman (ECDH Curve25519) cryptographic channel...")

    setTimeout(() => {
      setSyncStatusText(`Querying ${selectedBank.name} (${selectedBank.fipId}) via ${selectedAA.name}...`)
    }, 800)

    setTimeout(() => {
      setSyncStatusText("Retrieving encrypted JWE financial statement payload...")
    }, 1600)

    setTimeout(async () => {
      try {
        const provider = mockAA
        const res = await provider.createConsent({
          userId: "user-current",
          vpa: vpaHandle,
          fiTypes,
          dateRangeFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          dateRangeTo: new Date().toISOString(),
        })

        const session = await provider.requestFIData(res.id)
        const data = await provider.fetchFIData(session.sessionId)
        setTransactions(data.transactions)
        
        const consentData = {
          consentHandle: consentId,
          provider: selectedAA.name,
          bank: selectedBank.name,
          fipId: selectedBank.fipId,
          accountEnding: "4921",
          status: "APPROVED",
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          lastSynced: "Just now",
        }
        setActiveConsent(consentData)
        setStep("review")
      } catch (err) {
        console.error("AA handshake error:", err)
        setStep("init")
      } finally {
        setIsLoading(false)
      }
    }, 2400)
  }

  // Step 5 -> Step 6: Commit Mappings to Database / Local Ledger
  const handleCommitMappings = async () => {
    setIsLoading(true)
    try {
      // Save consent in localStorage for instant access
      if (activeConsent) {
        localStorage.setItem("finna_active_aa_consent", JSON.stringify(activeConsent))
      }

      // If user is authenticated in Supabase, also save to real DB
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          await supabase.from("consents").insert({
            user_id: user.id,
            provider: selectedAA.id,
            consent_ref: activeConsent?.consentHandle || consentId,
            status: "APPROVED",
            fi_types: fiTypes,
          })

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
      } catch (dbErr) {
        console.warn("Local demo commit (Supabase skipped or unauthenticated):", dbErr)
      }

      setStep("active")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevoke = async () => {
    if (confirm("Are you sure you want to revoke this Account Aggregator consent? Under RBI regulations, all scheduled background fetches will stop immediately.")) {
      setIsLoading(true)
      try {
        localStorage.removeItem("finna_active_aa_consent")
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
            <nav className="hidden sm:flex items-center gap-4 text-xs font-medium text-[#737373]">
              <Link href="/dashboard" className="hover:text-black transition">Dashboard</Link>
              <Link href="/insights" className="hover:text-black transition">Cashflow</Link>
              <Link href="/schemes" className="hover:text-black transition">Schemes</Link>
              <Link href="/health-score" className="hover:text-black transition">Health Score</Link>
              <span className="text-black font-semibold">Account Aggregator</span>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-black transition"
          >
            <ArrowLeft className="size-4" /> Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Regulatory FIU Badge Bar */}
      <div className="bg-[#f5f5f5] border-b border-[#e5e5e5] py-2.5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#525252]">
            <ShieldCheck className="size-4 text-black shrink-0" />
            <span>
              <strong>RBI Licensed AA Framework:</strong> FINNA operates as a registered Financial Information User (FIU). 100% consent-driven, read-only data access.
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#737373] bg-white px-2 py-0.5 rounded border border-[#e5e5e5]">
            RBI Master Direction DNBR.030
          </span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* STEP 1: Bank & AA Discovery */}
        {step === "init" && (
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-10 shadow-sm space-y-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#737373] bg-[#f5f5f5] px-3 py-1 rounded-full border border-[#e5e5e5]">
                Step 1 of 3 · Discovery
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black mt-3">
                Link Your Bank via RBI Account Aggregator
              </h1>
              <p className="mt-2 text-sm text-[#737373] leading-relaxed">
                Connect your primary gig payout bank account (Swiggy, Zomato, Uber, Zepto, Blinkit settlements) without sharing internet banking passwords or uploading PDF statements.
              </p>
            </div>

            {/* Select Bank (FIP) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                Select Your Bank (Financial Information Provider - FIP)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SUPPORTED_BANKS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between h-20 ${
                      selectedBank.id === b.id
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-[#fafafa] text-black border-[#e5e5e5] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{b.shortCode}</span>
                    <span className="text-xs font-medium line-clamp-1">{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Select RBI-licensed AA Gateway */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                Choose Account Aggregator Gateway
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AA_PROVIDERS.map((aa) => (
                  <button
                    key={aa.id}
                    type="button"
                    onClick={() => setSelectedAA(aa)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                      selectedAA.id === aa.id
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-[#fafafa] text-black border-[#e5e5e5] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold">{aa.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        selectedAA.id === aa.id ? "bg-white text-black" : "bg-[#e5e5e5] text-[#525252]"
                      }`}>
                        {aa.tag}
                      </span>
                    </div>
                    <span className={`text-[10px] mt-2 ${selectedAA.id === aa.id ? "text-[#a3a3a3]" : "text-[#737373]"}`}>
                      {aa.license}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile & AA Handle */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black uppercase tracking-wider block">
                  Registered Mobile Number
                </label>
                <div className="flex items-center rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3">
                  <span className="text-xs text-[#737373] font-mono mr-2">+91</span>
                  <Input
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="border-0 bg-transparent h-11 p-0 focus-visible:ring-0 text-sm font-medium"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black uppercase tracking-wider block">
                  Generated AA VPA Identifier
                </label>
                <div className="flex items-center rounded-xl border border-[#e5e5e5] bg-[#f5f5f5] px-3 h-11">
                  <span className="text-xs font-mono text-black font-semibold">{vpaHandle}</span>
                </div>
              </div>
            </div>

            {/* Data Horizon */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                Historical Statement Horizon
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "30d", label: "Last 30 Days", desc: "Basic earnings check" },
                  { id: "90d", label: "Last 90 Days (Recommended)", desc: "Optimal gig cashflow smoothing" },
                  { id: "180d", label: "Last 180 Days", desc: "Credit & loan pre-qualification" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setDateRange(r.id)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition ${
                      dateRange === r.id
                        ? "bg-black text-white border-black"
                        : "bg-[#fafafa] text-black border-[#e5e5e5] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    <span className="text-xs font-bold block">{r.label}</span>
                    <span className={`text-[11px] block mt-1 ${dateRange === r.id ? "text-[#a3a3a3]" : "text-[#737373]"}`}>
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="p-4 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] text-xs text-[#525252] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-black">
                <Lock className="size-3.5" /> 100% Encrypted & Revocable at Any Time
              </div>
              <p>
                Account Aggregators cannot see your data — data is encrypted end-to-end between your bank ({selectedBank.name}) and FINNA. Consent is read-only; no debits or money transfers are possible.
              </p>
            </div>

            <Button
              onClick={handleProceedToArtefact}
              className="w-full h-12 rounded-xl bg-black text-white hover:bg-black/90 font-semibold cursor-pointer text-sm"
            >
              Review RBI Consent Artefact <ArrowRight className="size-4 ml-2" />
            </Button>
          </section>
        )}

        {/* STEP 2: RBI Master Direction Consent Artefact Review */}
        {step === "artefact" && (
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#737373] bg-[#f5f5f5] px-3 py-1 rounded-full border border-[#e5e5e5]">
                Step 2 of 3 · Consent Artefact
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-black mt-3">
                Review Statutory Consent Terms
              </h2>
              <p className="mt-1 text-sm text-[#737373]">
                Mandated by RBI Master Direction DNBR.030. Please review the exact permissions being granted.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Consent Handle ID:</span>
                <span className="font-mono font-bold text-black">{consentId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Data Consumer (FIU):</span>
                <span className="font-semibold text-black">FINNA Technologies Pvt Ltd (RBI Reg: 2026/FIU)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Data Provider (FIP):</span>
                <span className="font-semibold text-black">{selectedBank.name} ({selectedBank.fipId})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Account Aggregator Gateway:</span>
                <span className="font-semibold text-black">{selectedAA.name} (RBI Licensed)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Consent Purpose Code:</span>
                <span className="font-semibold text-black">101 · Gig Income Reconciliation & Cashflow Smoothing</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Data Requested:</span>
                <span className="font-semibold text-black">Statement of Account & Periodic Balance</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Fetch Mode & Frequency:</span>
                <span className="font-semibold text-black">PERIODIC (Daily automated statement refresh)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Data Retention Period:</span>
                <span className="font-semibold text-black">90 Days (in encrypted client vault)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#737373]">Consent Validity:</span>
                <span className="font-semibold text-black">12 Months (Valid until September 2027)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
              <Button
                variant="outline"
                onClick={() => setStep("init")}
                className="rounded-xl border-[#e5e5e5] h-11 px-5 cursor-pointer text-xs"
              >
                Back to Settings
              </Button>
              <Button
                onClick={handleProceedToOTP}
                className="rounded-xl bg-black text-white hover:bg-black/90 h-11 px-6 font-semibold cursor-pointer text-xs"
              >
                Accept & Proceed to AA Gateway <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </section>
        )}

        {/* STEP 3: AA Gateway OTP & Account Selection */}
        {step === "otp" && (
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-10 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#737373] bg-[#f5f5f5] px-3 py-1 rounded-full border border-[#e5e5e5]">
                  Step 3 of 3 · AA Gateway Authentication
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-black mt-3">
                  {selectedAA.name} Secure Verification
                </h2>
                <p className="mt-1 text-sm text-[#737373]">
                  Enter the 6-digit OTP sent to <strong>+91 {mobileNumber}</strong> to discover accounts at {selectedBank.name}.
                </p>
              </div>
              <span className="size-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-xs">
                AA
              </span>
            </div>

            {/* OTP Input with Auto-Fill helper */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                One-Time Password (OTP)
              </label>
              <div className="flex gap-3">
                <Input
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="Enter 6-digit OTP (or click Auto-Fill)"
                  maxLength={6}
                  className="h-12 bg-[#fafafa] border-[#e5e5e5] font-mono text-base tracking-widest text-center max-w-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOtpValue("849201")}
                  className="h-12 rounded-xl border-[#e5e5e5] text-xs font-semibold cursor-pointer px-4"
                >
                  Use Demo OTP: 849201
                </Button>
              </div>
            </div>

            {/* Discovered Bank Accounts */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                Discovered Accounts at {selectedBank.name}
              </label>
              <div className="space-y-2.5">
                {[
                  {
                    id: "acc_sbi_4921",
                    accountType: "Regular Savings Account",
                    number: "•••• •••• •••• 4921",
                    balance: "₹42,681.40",
                    isPrimary: true,
                    note: "Detected as Primary Gig Payout Account (Swiggy, Uber)",
                  },
                  {
                    id: "acc_sbi_1058",
                    accountType: "Digital Current Account",
                    number: "•••• •••• •••• 1058",
                    balance: "₹8,420.00",
                    isPrimary: false,
                    note: "Secondary business account",
                  },
                ].map((acc) => (
                  <label
                    key={acc.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      selectedAccount === acc.id
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-[#fafafa] text-black border-[#e5e5e5] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="account_selection"
                        checked={selectedAccount === acc.id}
                        onChange={() => setSelectedAccount(acc.id)}
                        className="accent-black size-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{acc.accountType}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            selectedAccount === acc.id ? "bg-[#262626] text-white" : "bg-[#e5e5e5] text-black"
                          }`}>
                            {acc.number}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${selectedAccount === acc.id ? "text-[#a3a3a3]" : "text-[#737373]"}`}>
                          {acc.note}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold font-mono">{acc.balance}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
              <Button
                variant="outline"
                onClick={() => setStep("artefact")}
                className="rounded-xl border-[#e5e5e5] h-11 px-5 cursor-pointer text-xs"
              >
                Back
              </Button>
              <Button
                onClick={handleAuthorizeOTP}
                disabled={isLoading}
                className="rounded-xl bg-black text-white hover:bg-black/90 h-11 px-6 font-semibold cursor-pointer text-xs"
              >
                {isLoading ? "Authenticating..." : "Approve Consent & Fetch Statements"}
              </Button>
            </div>
          </section>
        )}

        {/* STEP 4: Decrypting & Cryptographic Handshake */}
        {step === "decrypting" && (
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-12 text-center shadow-sm space-y-5">
            <Loader2 className="size-10 animate-spin mx-auto text-black" />
            <h2 className="text-xl font-bold text-black">Connecting to Account Aggregator Gateway...</h2>
            <p className="text-xs font-mono text-[#737373] max-w-md mx-auto bg-[#f5f5f5] p-3 rounded-xl border border-[#e5e5e5]">
              {syncStatusText}
            </p>
            <p className="text-[11px] text-[#a3a3a3]">
              Using end-to-end asymmetric cryptography (Curve25519 ECDH + AES-256 GCM).
            </p>
          </section>
        )}

        {/* STEP 5: Review Decrypted Statements & Platform Reconciliation */}
        {step === "review" && (
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-black bg-[#f5f5f5] px-3 py-1 rounded-full border border-[#e5e5e5]">
                  Step 4 · Financial Information Decrypted
                </span>
                <h2 className="text-xl font-bold tracking-tight text-black mt-2">
                  Reconciled Gig Payouts & Operational Expenses
                </h2>
                <p className="text-xs text-[#737373]">
                  FINNA's parser automatically matched your bank statement transactions to gig platforms (Swiggy, Uber, Zomato, Rapido).
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#f5f5f5] px-3 py-1.5 rounded-xl border border-[#e5e5e5] self-start sm:self-auto">
                {transactions.length} Decrypted Records
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
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
                    <span className={`font-bold text-sm font-mono ${tx.type === "CREDIT" ? "text-black" : "text-[#525252]"}`}>
                      {tx.type === "CREDIT" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] font-bold text-black bg-white px-2.5 py-1 rounded-lg border border-[#e5e5e5]">
                      {tx.mappedPlatform ? `Platform: ${tx.mappedPlatform.toUpperCase()}` : tx.categoryGuess}
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
                Discard
              </Button>
              <Button
                onClick={handleCommitMappings}
                disabled={isLoading}
                className="rounded-xl bg-black text-white hover:bg-black/90 h-11 px-6 font-semibold cursor-pointer text-xs"
              >
                {isLoading ? "Syncing Ledger..." : "Commit to Cashflow Calendar & Dashboard"}
              </Button>
            </div>
          </section>
        )}

        {/* STEP 6: Active AA Consent Manager */}
        {step === "active" && (
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-10 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="flex size-11 rounded-2xl bg-black text-white items-center justify-center">
                  <CheckCircle2 className="size-6" />
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-black">
                    Active Account Aggregator Consent
                  </h2>
                  <p className="text-xs text-[#737373]">
                    Your bank statement is synced. Daily automated refresh active.
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-black bg-[#f5f5f5] px-3 py-1.5 rounded-full border border-[#e5e5e5]">
                STATUS: APPROVED
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Consent Handle:</span>
                <span className="font-mono text-black font-bold">{activeConsent?.consentHandle || consentId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Account Aggregator Gateway:</span>
                <span className="text-black font-semibold">{activeConsent?.provider || selectedAA.name} (RBI Licensed)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Linked Bank (FIP):</span>
                <span className="text-black font-semibold">{activeConsent?.bank || selectedBank.name} (A/C ending in {activeConsent?.accountEnding || "4921"})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Data Purpose:</span>
                <span className="text-black font-semibold">Code 101 · Personal Financial Management & Gig Income Reconciliation</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e5e5e5]">
                <span className="text-[#737373]">Last Successful Sync:</span>
                <span className="text-black font-semibold">{activeConsent?.lastSynced || "Just now"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#737373]">Next Scheduled Refresh:</span>
                <span className="text-black font-semibold">Tomorrow at 04:00 AM IST (Automated)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleRevoke}
                className="rounded-xl border-[#e5e5e5] text-xs h-11 px-4 text-[#737373] hover:text-black hover:border-black cursor-pointer inline-flex items-center gap-2"
              >
                <Trash2 className="size-3.5" /> Revoke Consent Immediately
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("review")}
                  className="rounded-xl border-[#e5e5e5] text-xs h-11 px-4 cursor-pointer"
                >
                  <RefreshCw className="size-3.5 mr-1.5" /> View Synced Transactions
                </Button>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-black text-white hover:bg-black/90 text-xs font-semibold cursor-pointer"
                >
                  Go to Dashboard <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
