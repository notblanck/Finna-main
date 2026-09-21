"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, Clock3, LockKeyhole, LogIn, ShieldCheck, Sparkles, WalletCards } from "lucide-react"
import { useConsent } from "./consent-provider"
import { PredictiveInsights } from "./predictive-insights"
import { formatSignedCurrency, getAccount, getTransactions, type Account, type Transaction } from "@/lib/mock-aa-data"
import { Auth1 } from "@/components/auth/auth-1"

import { Auth } from "@/components/ui/auth-form-1"
import { CashflowCalendar } from "./cashflow-calendar"

const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: .35 } }

function Logo() { return <div className="flex items-center gap-2.5 font-semibold tracking-tight"><span className="flex size-8 items-center justify-center rounded-xl bg-[#d7f36a] text-[#122017]"><Sparkles className="size-4" /></span><span className="text-lg">finna</span></div> }
function Shell({ children, back = false, onBack }: { children: React.ReactNode; back?: boolean; onBack?: () => void }) {
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
    <div className="min-h-screen bg-[#f8f9f5] text-[#17211b]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8">
        <div className="flex items-center gap-5">
          {back && (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="rounded-full border border-[#dfe5d9] p-2 text-[#657067] hover:bg-white transition cursor-pointer"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <Logo />
        </div>
        <div className="flex items-center gap-4 text-xs text-[#69756b]">
          <button
            onClick={navigateToLogin}
            className="flex items-center gap-1.5 rounded-full border border-[#dfe5d9] bg-white px-3.5 py-1.5 font-medium text-[#17211b] hover:bg-[#edf2e6] transition cursor-pointer"
          >
            <LogIn className="size-3.5 text-[#5e774a]" />
            <span>Sign In</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#69756b]">
            <LockKeyhole className="size-3.5" /> Private and secure
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-16 md:px-8">{children}</main>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf6dc] px-3 py-1.5 text-[11px] font-medium text-[#4e683d]">
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
          <p className="mt-6 max-w-lg text-base leading-7 text-[#657067]">
            FINNA uses your consented financial data to help you understand your money and make better decisions. You stay in control, always.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={start}
              className="group inline-flex items-center gap-3 rounded-full bg-[#17211b] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#344238]"
            >
              Review and give consent <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </button>
            <button
              onClick={cancelConsent}
              className="rounded-full px-5 py-3.5 text-sm text-[#657067] hover:bg-white transition"
            >
              Not now
            </button>
          </div>
        </section>
        <section className="rounded-[2rem] border border-[#dfe5d9] bg-white p-6 shadow-[0_18px_60px_rgba(31,55,35,.07)] md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[.16em] text-[#869188]">Requested by</p>
              <h2 className="mt-2 text-2xl font-medium">FINNA</h2>
              <p className="mt-1 text-sm text-[#657067]">Financial Intelligence for New Age</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f0f7dd] text-[#729052]">
              <WalletCards className="size-5" />
            </div>
          </div>
          <div className="my-7 h-px bg-[#edf0e9]" />
          <p className="text-sm leading-6 text-[#657067]">{consent.purpose}</p>
          <div className="mt-7 space-y-4">
            {consent.dataTypes.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#eaf5d3] text-[#6c9148]">
                  <Check className="size-3.5" />
                </span>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-[#edf0e9] pt-5 text-xs text-[#768178]">
            <span>Access duration</span>
            <strong className="font-medium text-[#263329]">{consent.duration}</strong>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#768178]">
            <span>Consent ID</span>
            <code className="text-[10px] text-[#526057]">{consent.id}</code>
          </div>
        </section>
      </motion.div>
      <div className="mx-auto mt-14 flex max-w-5xl items-center gap-3 text-xs text-[#8a948c]">
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
        <div className="mx-auto max-w-lg rounded-[2rem] border border-[#d8dfd2] bg-white p-7 shadow-[0_18px_60px_rgba(31,55,35,.08)] md:p-10">
          <div className="flex items-center justify-between border-b border-[#edf0e9] pb-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#15251c] text-[#d7f36a]">
                <WalletCards className="size-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-[#869188]">Sandbox</p>
                <p className="font-medium">Account Aggregator</p>
              </div>
            </div>
            <span className="rounded-full bg-[#fff4d8] px-2.5 py-1 text-[10px] text-[#94742a]">TEST MODE</span>
          </div>
          <div className="py-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#f0f7dd] text-[#6c9148]">
              <ShieldCheck className="size-8" />
            </div>
            <h1 className="mt-5 text-3xl font-medium tracking-[-.04em]">Link your account</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#657067]">
              FINNA is requesting temporary access to your financial information through a secure, regulated connection.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f7f9f4] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#68736b]">Data requested</span>
              <span className="font-medium">3 categories</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[#68736b]">For</span>
              <span className="font-medium">{consent.duration}</span>
            </div>
          </div>
          <button
            onClick={approve}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#17211b] py-3.5 text-sm font-medium text-white hover:bg-[#344238] transition"
          >
            Approve &amp; link account <ArrowRight className="size-4" />
          </button>
          <p className="mt-5 text-center text-[11px] leading-5 text-[#88938a]">
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
        <h1 className="mt-6 text-4xl font-medium tracking-[-.05em] md:text-6xl">
          Making sense of your <em className="font-display font-normal">money.</em>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[#657067]">
          Your data is being securely retrieved and organized. This usually takes a few moments.
        </p>
        <div className="mx-auto mt-12 max-w-md text-left">
          {steps.map((item, index) => (
            <div key={item} className="flex items-center gap-4 border-b border-[#e8ede5] py-4">
              <span
                className={`flex size-8 items-center justify-center rounded-full text-xs font-medium ${
                  index < step
                    ? "bg-[#d7f36a] text-[#25351f]"
                    : index === step
                    ? "border border-[#aabca0] bg-white text-[#526057]"
                    : "bg-[#edf0ea] text-[#a2aca3]"
                }`}
              >
                {index < step ? <Check className="size-4" /> : index + 1}
              </span>
              <span className={index <= step ? "text-sm text-[#263329]" : "text-sm text-[#a2aca3]"}>
                {item}
              </span>
              {index === step && step < steps.length && (
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="ml-auto size-1.5 rounded-full bg-[#8baa68]"
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-[#8a948c]">This page is a simulated Account Aggregator connection.</p>
      </motion.div>
    </Shell>
  )
}

function DashboardPage() {
  const [account, setAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    Promise.all([getAccount(), getTransactions()]).then(([a, t]) => {
      setAccount(a)
      setTransactions(t)
    })
  }, [])

  const goToInsights = () => {
    window.history.pushState({}, "", "/insights")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  return (
    <Shell>
      <motion.div {...fade} className="pt-10 md:pt-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Pill>
              <ShieldCheck className="size-3.5" /> Connected securely
            </Pill>
            <h1 className="mt-5 text-4xl font-medium tracking-[-.05em] md:text-6xl">Good morning, Arun.</h1>
            <p className="mt-3 text-sm text-[#657067]">Here is your financial picture, in one clear view.</p>
          </div>
          <button className="flex items-center gap-2 self-start rounded-full border border-[#dfe5d9] bg-white px-4 py-2.5 text-sm text-[#526057]">
            This month <ChevronDown className="size-4" />
          </button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-[#17211b] p-6 text-white md:col-span-2">
            <p className="text-xs text-[#aeb9aa]">Total balance</p>
            <p className="mt-3 text-4xl font-medium tracking-[-.04em]">{account?.balance ?? "—"}</p>
            <p className="mt-8 text-xs text-[#aeb9aa]">
              Across 1 linked account · Updated {account?.lastSynced.toLowerCase() ?? "—"}
            </p>
          </div>

          <div className="rounded-3xl border border-[#dfe5d9] bg-white p-6">
            <p className="text-xs text-[#869188]">Financial health</p>
            <p className="mt-3 text-4xl font-medium">Good</p>
            <div className="mt-8 h-2 overflow-hidden rounded-full bg-[#edf0e9]">
              <div className="h-full w-[72%] rounded-full bg-[#b9d875]" />
            </div>
            <p className="mt-3 text-xs text-[#657067]">72 / 100 · Building steadily</p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_.8fr]">
          <section className="rounded-3xl border border-[#dfe5d9] bg-white p-6 md:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Recent activity</h2>
              <span className="text-xs text-[#8a948c]">{account?.bank}</span>
            </div>
            <div className="mt-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-t border-[#edf0e9] py-4">
                  <div>
                    <p className="text-sm font-medium">{transaction.merchant}</p>
                    <p className="mt-1 text-xs text-[#8a948c]">
                      {transaction.category} · {transaction.date}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      transaction.type === "credit" ? "text-[#678844]" : "text-[#263329]"
                    }`}
                  >
                    {formatSignedCurrency(transaction.amount, transaction.type)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-[#17211b] p-7 text-white border border-[#233128] shadow-[0_18px_60px_rgba(23,33,27,.08)] flex flex-col justify-between">
            <div>
              <Sparkles className="size-5 text-[#d7f36a]" />
              <h2 className="mt-5 text-2xl font-medium tracking-[-.03em] text-white">A clearer next step.</h2>
              <p className="mt-3 text-sm leading-6 text-[#aeb9aa]">
                Your income is consistent, and your spending is stable. You could comfortably set aside ₹3,200 this month.
              </p>
            </div>
            <button
              onClick={goToInsights}
              className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#d7f36a] hover:text-[#eaf98d] transition group cursor-pointer self-start"
            >
              Explore insights <ArrowRight className="size-4 transition group-hover:translate-x-1" />
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

