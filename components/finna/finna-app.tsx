"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, Clock3, LockKeyhole, LogIn, ShieldCheck, Sparkles, WalletCards, Award, Activity, Landmark, Loader2, UserCheck } from "lucide-react"
import { useConsent } from "./consent-provider"
import { PredictiveInsights } from "./predictive-insights"
import { finnaApi, type ApiAccount, type ApiTransaction } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { evaluateUserSchemes } from "@/lib/schemes/matcher"
import { Skeleton } from "@/components/ui/skeleton"
import { Auth1 } from "@/components/auth/auth-1"

import { Auth } from "@/components/ui/auth-form-1"
import { CashflowCalendar } from "./cashflow-calendar"

const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: .35 } }

const formatINR = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)

const formatSigned = (amount: number, type: string) => {
  const isCredit = type?.toUpperCase() === "CREDIT"
  return `${isCredit ? "+" : "−"}${formatINR(amount)}`
}

function Logo() { return <div className="flex items-center gap-2.5 font-semibold tracking-tight"><span className="flex size-8 items-center justify-center rounded-xl bg-black text-white"><Sparkles className="size-4" /></span><span className="text-lg text-black">finna</span></div> }
function Shell({ children, back = false, onBack }: { children: React.ReactNode; back?: boolean; onBack?: () => void }) {
  const [navSchemesCount, setNavSchemesCount] = useState<number | null>(null)
  const [navHealthScore, setNavHealthScore] = useState<number | null>(null)
  const [navUser, setNavUser] = useState<any>(null)

  useEffect(() => {
    async function loadNavData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setNavUser(user)
          const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()
          const { eligible } = evaluateUserSchemes(profile || {})
          setNavSchemesCount(eligible.length)

          try {
            const hs = await finnaApi.getHealthScore()
            if (hs?.score) setNavHealthScore(hs.score)
          } catch {
            setNavHealthScore(72)
          }
        } else {
          const { eligible } = evaluateUserSchemes({ city: "Chennai", state: "Tamil Nadu", platforms: ["swiggy", "uber"] })
          setNavSchemesCount(eligible.length)
          setNavHealthScore(72)
        }
      } catch {
        // Fallback
      }
    }
    loadNavData()
  }, [])

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back()
    } else {
      window.history.pushState({}, "", "/dashboard")
      window.dispatchEvent(new PopStateEvent("popstate"))
    }
  }

  const navigateToLogin = () => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/login")
      window.dispatchEvent(new PopStateEvent("popstate"))
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-6">
          {back && (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="rounded-full border border-[#e5e5e5] p-2 text-[#737373] hover:text-black hover:bg-[#f5f5f5] transition cursor-pointer"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <Link href="/dashboard" className="cursor-pointer">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-[#737373]">
            <Link href="/dashboard" className="hover:text-black transition">Dashboard</Link>
            <Link href="/insights" className="hover:text-black transition">Cashflow Calendar</Link>
            <Link href="/schemes" className="hover:text-black transition flex items-center gap-1.5">
              <span>Schemes & Welfare</span>
              <span className="rounded-full bg-black px-1.5 py-0.5 text-[10px] text-white font-bold">
                {navSchemesCount ?? 3}
              </span>
            </Link>
            <Link href="/health-score" className="hover:text-black transition flex items-center gap-1.5">
              <span>Health Score</span>
              <span className="rounded-full bg-[#f5f5f5] border border-[#e5e5e5] px-1.5 py-0.5 text-[10px] text-black font-semibold">
                {navHealthScore ?? 72}
              </span>
            </Link>
            <Link href="/aa" className="hover:text-black transition">Bank Sync (AA)</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#737373]">
          {navUser ? (
            <div className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3.5 py-1.5 font-medium text-black">
              <UserCheck className="size-3.5 text-black" />
              <span>{navUser.user_metadata?.full_name?.split(" ")[0] || navUser.email?.split("@")[0] || "Account"}</span>
            </div>
          ) : (
            <button
              onClick={navigateToLogin}
              className="flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3.5 py-1.5 font-medium text-black hover:bg-[#f5f5f5] transition cursor-pointer"
            >
              <LogIn className="size-3.5 text-black" />
              <span>Sign In</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#737373]">
            <LockKeyhole className="size-3.5 text-black" /> Private and secure
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-16 md:px-8">{children}</main>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] px-3 py-1.5 text-[11px] font-medium text-black">
      {children}
    </span>
  )
}

function ConsentPage() {
  const { consent, giveConsent, cancelConsent } = useConsent()
  const start = () => {
    giveConsent()
    window.history.pushState({}, "", "/mock-aa/authorize")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }
  return (
    <Shell>
      <motion.div {...fade} className="mx-auto grid max-w-5xl gap-10 pt-12 lg:grid-cols-[1.1fr_.9fr] lg:pt-20">
        <section className="flex flex-col justify-center">
          <Pill>
            <ShieldCheck className="size-3.5" /> Consent request
          </Pill>
          <h1 className="mt-6 max-w-xl text-5xl font-medium leading-[1.03] tracking-[-.055em] md:text-7xl">
            Your financial story, <em className="font-display font-normal">made clearer.</em>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#737373]">
            FINNA uses your consented financial data to help you understand your money and make better decisions. You stay in control, always.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={start}
              className="group inline-flex items-center gap-3 rounded-full bg-black px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#262626]"
            >
              Review and give consent <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </button>
            <button
              onClick={cancelConsent}
              className="rounded-full border border-[#e5e5e5] px-5 py-3.5 text-sm text-[#737373] hover:text-black hover:bg-[#f5f5f5] transition"
            >
              Not now
            </button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2.5 pt-4 border-t border-[#e5e5e5]">
            <span className="text-xs text-[#737373]">Direct Explore:</span>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3.5 py-1.5 text-xs font-medium text-black hover:bg-[#f5f5f5] hover:border-black transition"
            >
              <Award className="size-3.5 text-black" />
              <span>Government Schemes</span>
            </Link>
            <Link
              href="/health-score"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3.5 py-1.5 text-xs font-medium text-black hover:bg-[#f5f5f5] hover:border-black transition"
            >
              <Activity className="size-3.5 text-black" />
              <span>Financial Health Score</span>
            </Link>
          </div>
        </section>
        <section className="rounded-[2rem] border border-[#e5e5e5] bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,.06)] md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[.16em] text-[#737373]">Requested by</p>
              <h2 className="mt-2 text-2xl font-medium text-black">FINNA</h2>
              <p className="mt-1 text-sm text-[#737373]">Financial Intelligence for New Age</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] text-black">
              <WalletCards className="size-5" />
            </div>
          </div>
          <div className="my-7 h-px bg-[#e5e5e5]" />
          <p className="text-sm leading-6 text-[#737373]">{consent.purpose}</p>
          <div className="mt-7 space-y-4">
            {consent.dataTypes.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-black">
                <span className="flex size-6 items-center justify-center rounded-full bg-black text-white">
                  <Check className="size-3.5" />
                </span>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-[#e5e5e5] pt-5 text-xs text-[#737373]">
            <span>Access duration</span>
            <strong className="font-medium text-black">{consent.duration}</strong>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#737373]">
            <span>Consent ID</span>
            <code className="text-[10px] text-[#525252] bg-[#f5f5f5] px-1.5 py-0.5 rounded">{consent.id}</code>
          </div>
        </section>
      </motion.div>
      <div className="mx-auto mt-14 flex max-w-5xl items-center gap-3 text-xs text-[#737373]">
        <CircleHelp className="size-4" /> You can revoke this consent anytime from your FINNA profile.
      </div>
    </Shell>
  )
}

function AuthorizePage() {
  const { consent, approveConsent } = useConsent()
  const approve = () => {
    approveConsent()
    window.history.pushState({}, "", "/mock-aa/retrieving")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }
  return (
    <Shell back onBack={() => {
      window.history.pushState({}, "", "/consent")
      window.dispatchEvent(new PopStateEvent("popstate"))
    }}>
      <motion.div {...fade} className="mx-auto max-w-3xl pt-10 md:pt-20">
        <div className="mx-auto max-w-lg rounded-[2rem] border border-[#e5e5e5] bg-white p-7 shadow-[0_18px_60px_rgba(0,0,0,.06)] md:p-10">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-black text-white">
                <WalletCards className="size-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-[#737373]">Sandbox</p>
                <p className="font-medium text-black">Account Aggregator</p>
              </div>
            </div>
            <span className="rounded-full bg-[#f5f5f5] border border-[#e5e5e5] px-2.5 py-1 text-[10px] font-semibold text-black">TEST MODE</span>
          </div>
          <div className="py-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#f5f5f5] border border-[#e5e5e5] text-black">
              <ShieldCheck className="size-8" />
            </div>
            <h1 className="mt-5 text-3xl font-medium tracking-[-.04em] text-black">Link your account</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#737373]">
              FINNA is requesting temporary access to your financial information through a secure, regulated connection.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#737373]">Data requested</span>
              <span className="font-medium text-black">3 categories</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[#737373]">For</span>
              <span className="font-medium text-black">{consent.duration}</span>
            </div>
          </div>
          <button
            onClick={approve}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black py-3.5 text-sm font-medium text-white hover:bg-[#262626] transition"
          >
            Approve &amp; link account <ArrowRight className="size-4" />
          </button>
          <p className="mt-5 text-center text-[11px] leading-5 text-[#737373]">
            By continuing, you agree to share this information with FINNA. Your data is encrypted end-to-end.
          </p>
        </div>
      </motion.div>
    </Shell>
  )
}

function RetrievingPage() {
  const [step, setStep] = useState(0)
  const steps = ["Verifying consent", "Connecting to your bank", "Retrieving transactions", "Building your financial picture"]

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, steps.length)), 950)
    return () => clearInterval(timer)
  }, [steps.length])

  useEffect(() => {
    if (step === steps.length) {
      const timer = setTimeout(() => {
        window.history.pushState({}, "", "/dashboard")
        window.dispatchEvent(new PopStateEvent("popstate"))
      }, 900)
      return () => clearTimeout(timer)
    }
  }, [step, steps.length])

  return (
    <Shell>
      <motion.div {...fade} className="mx-auto max-w-2xl pt-14 text-center md:pt-24">
        <Pill>
          <Clock3 className="size-3.5" /> Secure retrieval in progress
        </Pill>
        <h1 className="mt-6 text-4xl font-medium tracking-[-.05em] md:text-6xl text-black">
          Making sense of your <em className="font-display font-normal">money.</em>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[#737373]">
          Your data is being securely retrieved and organized. This usually takes a few moments.
        </p>
        <div className="mx-auto mt-12 max-w-md text-left">
          {steps.map((item, index) => (
            <div key={item} className="flex items-center gap-4 border-b border-[#e5e5e5] py-4">
              <span
                className={`flex size-8 items-center justify-center rounded-full text-xs font-medium ${
                  index < step
                    ? "bg-black text-white"
                    : index === step
                    ? "border border-black bg-white text-black font-bold"
                    : "bg-[#f5f5f5] text-[#a3a3a3]"
                }`}
              >
                {index < step ? <Check className="size-4" /> : index + 1}
              </span>
              <span className={index <= step ? "text-sm font-medium text-black" : "text-sm text-[#a3a3a3]"}>
                {item}
              </span>
              {index === step && step < steps.length && (
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="ml-auto size-1.5 rounded-full bg-black"
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-[#737373]">This page is a simulated Account Aggregator connection.</p>
      </motion.div>
    </Shell>
  )
}

function DashboardPage() {
  const [accounts, setAccounts] = useState<ApiAccount[]>([])
  const [transactions, setTransactions] = useState<ApiTransaction[]>([])
  const [healthScore, setHealthScore] = useState<number>(72)
  const [healthBand, setHealthBand] = useState<string>("Good")
  const [schemesCount, setSchemesCount] = useState<number>(3)
  const [userName, setUserName] = useState<string>("Arun")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError(null)
      try {
        const [accsRes, txnsRes, hsRes, profRes] = await Promise.allSettled([
          finnaApi.getAccounts(),
          finnaApi.getTransactions(),
          finnaApi.getHealthScore(),
          finnaApi.getProfile(),
        ])

        if (accsRes.status === "fulfilled") {
          setAccounts(accsRes.value)
        }
        if (txnsRes.status === "fulfilled") {
          setTransactions(txnsRes.value)
        }
        if (hsRes.status === "fulfilled" && hsRes.value) {
          const score = hsRes.value.score
          setHealthScore(score)
          if (score >= 80) setHealthBand("Strong")
          else if (score >= 65) setHealthBand("Good")
          else if (score >= 50) setHealthBand("Stable")
          else setHealthBand("Needs Attention")
        }
        if (profRes.status === "fulfilled" && (profRes.value as any)?.user) {
          const u = (profRes.value as any).user
          if (u.full_name) {
            setUserName(u.full_name.split(" ")[0])
          }
          const { eligible } = evaluateUserSchemes(u)
          if (eligible) {
            setSchemesCount(eligible.length)
          }
        }
      } catch (err: any) {
        console.error("Dashboard data load error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const goToInsights = () => {
    window.history.pushState({}, "", "/insights")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  const primaryAccount = accounts[0]
  const totalBalance = accounts.length > 0
    ? accounts.reduce((sum, a) => sum + a.balance, 0)
    : 42680

  return (
    <Shell>
      <motion.div {...fade} className="pt-10 md:pt-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Pill>
              <ShieldCheck className="size-3.5" /> Connected securely
            </Pill>
            <h1 className="mt-5 text-4xl font-medium tracking-[-.05em] md:text-6xl text-black">
              Good morning, {userName}.
            </h1>
            <p className="mt-3 text-sm text-[#737373]">Here is your financial picture, in one clear view.</p>
          </div>
          <button className="flex items-center gap-2 self-start rounded-full border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm text-black hover:bg-[#f5f5f5] transition cursor-pointer">
            This month <ChevronDown className="size-4" />
          </button>
        </div>

        {/* 3 Core Pillars: Bank Data, Financial Health, Welfare Schemes */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {/* Pillar 1: Total Balance & Bank Feed */}
          <div className="rounded-3xl bg-black p-6 text-white flex flex-col justify-between shadow-sm min-h-[220px]">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#a3a3a3]">Total balance</p>
                <span className="flex items-center gap-1 text-[11px] font-mono text-[#a3a3a3] bg-[#262626] px-2 py-0.5 rounded">
                  <Landmark className="size-3" /> AA Synced
                </span>
              </div>
              {loading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-10 w-44 bg-neutral-800" />
                  <Skeleton className="h-4 w-32 bg-neutral-800" />
                </div>
              ) : (
                <>
                  <p className="mt-3 text-4xl font-medium tracking-[-.04em]">
                    {accounts.length > 0 ? formatINR(totalBalance) : "₹42,680"}
                  </p>
                  <p className="mt-3 text-xs text-[#a3a3a3]">
                    {primaryAccount ? `${primaryAccount.bank_name} (${primaryAccount.masked_account})` : "State Bank of India · Synced"}
                  </p>
                </>
              )}
            </div>
            <Link
              href="/aa"
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-[#a3a3a3] hover:text-white transition group"
            >
              <span>Manage Bank Sync (AA)</span>
              <ArrowRight className="size-3 transition group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Pillar 2: Financial Health Score */}
          <div className="rounded-3xl border border-[#e5e5e5] bg-white p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#737373]">Financial health</p>
                <span className="rounded-full bg-[#f5f5f5] border border-[#e5e5e5] px-2 py-0.5 text-[10px] font-semibold text-black">
                  {loading ? "--" : `${healthScore} / 100`}
                </span>
              </div>
              {loading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-10 w-28 bg-[#e5e5e5]" />
                  <Skeleton className="h-2 w-full bg-[#e5e5e5]" />
                </div>
              ) : (
                <>
                  <p className="mt-3 text-4xl font-medium text-black">{healthBand}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5e5e5]">
                    <div
                      className="h-full rounded-full bg-black transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, healthScore))}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-[#737373]">Building steadily · 6-factor audit</p>
                </>
              )}
            </div>
            <Link
              href="/health-score"
              className="mt-6 inline-flex items-center justify-between rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-4 py-2.5 text-xs font-medium text-black hover:bg-black hover:text-white transition group cursor-pointer"
            >
              <span>Health Score Audit</span>
              <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Pillar 3: Welfare Schemes */}
          <div className="rounded-3xl border border-[#e5e5e5] bg-white p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#737373]">Welfare & Schemes</p>
                <span className="rounded-full bg-black text-white px-2 py-0.5 text-[10px] font-semibold">
                  {loading ? "--" : `${schemesCount} Matched`}
                </span>
              </div>
              {loading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-10 w-28 bg-[#e5e5e5]" />
                  <Skeleton className="h-4 w-full bg-[#e5e5e5]" />
                </div>
              ) : (
                <>
                  <p className="mt-3 text-4xl font-medium text-black">Eligible</p>
                  <p className="mt-4 text-xs text-[#737373] line-clamp-2">
                    e-Shram, PM-SYM Pension (₹3k/mo) & TN Gig Board benefits.
                  </p>
                </>
              )}
            </div>
            <Link
              href="/schemes"
              className="mt-6 inline-flex items-center justify-between rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-4 py-2.5 text-xs font-medium text-black hover:bg-black hover:text-white transition group cursor-pointer"
            >
              <span>Explore Schemes</span>
              <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_.8fr]">
          <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 md:p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-black">Recent activity</h2>
              <span className="text-xs text-[#737373]">{primaryAccount?.bank_name || "Bank Feed"}</span>
            </div>
            <div className="mt-4">
              {loading ? (
                <div className="space-y-4 py-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between border-t border-[#e5e5e5] py-4">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#737373]">
                  <p>No recent transactions synced yet.</p>
                  <Link href="/aa" className="mt-2 inline-block text-xs font-semibold text-black underline">
                    Connect Account Aggregator to sync live statement →
                  </Link>
                </div>
              ) : (
                transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-t border-[#e5e5e5] py-4">
                    <div>
                      <p className="text-sm font-medium text-black">{transaction.description}</p>
                      <p className="mt-1 text-xs text-[#737373]">
                        {transaction.category} · {transaction.txn_date}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        transaction.type === "CREDIT" ? "text-black" : "text-[#525252]"
                      }`}
                    >
                      {formatSigned(transaction.amount, transaction.type)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-black p-7 text-white border border-[#262626] shadow-[0_18px_60px_rgba(0,0,0,.08)] flex flex-col justify-between">
            <div>
              <Sparkles className="size-5 text-white" />
              <h2 className="mt-5 text-2xl font-medium tracking-[-.03em] text-white">A clearer next step.</h2>
              <p className="mt-3 text-sm leading-6 text-[#a3a3a3]">
                Your income is consistent, and your spending is stable. You could comfortably set aside ₹3,200 this month.
              </p>
            </div>
            <button
              onClick={goToInsights}
              className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-[#e5e5e5] transition group cursor-pointer self-start underline underline-offset-4"
            >
              Explore cashflow calendar <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </button>
          </section>
        </div>
      </motion.div>
    </Shell>
  )
}

function InsightsPage() {
  const returnToDashboard = () => {
    window.history.pushState({}, "", "/dashboard")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  return (
    <Shell back onBack={returnToDashboard}>
      <motion.div {...fade} className="pt-6 md:pt-10">
        <CashflowCalendar onBack={returnToDashboard} />
      </motion.div>
    </Shell>
  )
}

export function FinnaApp() {
  const [path, setPath] = useState(typeof window !== "undefined" ? window.location.pathname : "/consent")

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div key={path}>
        {path === "/login" ? (
          <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-background selection:bg-primary/20">
            <Auth
              redirectTo="/dashboard"
              onSuccess={() => {
                setPath("/dashboard")
                if (typeof window !== "undefined") {
                  window.history.pushState({}, "", "/dashboard")
                  window.dispatchEvent(new PopStateEvent("popstate"))
                }
              }}
            />
          </div>
        ) : path === "/mock-aa/authorize" ? (
          <AuthorizePage />
        ) : path === "/mock-aa/retrieving" ? (
          <RetrievingPage />
        ) : path === "/insights" || path === "/dashboard/insights" ? (
          <InsightsPage />
        ) : path === "/dashboard" ? (
          <DashboardPage />
        ) : (
          <ConsentPage />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

