"use client"

import { useEffect, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  LockKeyhole,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  WalletCards,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  Smartphone
} from "lucide-react"
import { useConsent } from "./consent-provider"
import { PredictiveInsights } from "./predictive-insights"
import { formatSignedCurrency, getAccount, getTransactions, type Account, type Transaction } from "@/lib/mock-aa-data"
import { finnaApi } from "@/lib/api"

const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.35 } }

function Logo() {
  return (
    <div className="flex items-center gap-2.5 font-semibold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-xl bg-[#111111] text-[#ffffff]">
        <Sparkles className="size-4" />
      </span>
      <span className="text-lg">finna</span>
    </div>
  )
}

function Shell({ children, back = false }: { children: React.ReactNode; back?: boolean }) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111111]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8">
        <div className="flex items-center gap-5">
          {back && (
            <button
              onClick={() => history.back()}
              aria-label="Go back"
              className="rounded-full border border-[#dedede] p-2 text-[#666666] hover:bg-white"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <Logo />
        </div>
        <div className="flex items-center gap-2 text-xs text-[#69756b]">
          <LockKeyhole className="size-3.5" /> Private and secure
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-16 md:px-8">{children}</main>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f1f1] px-3 py-1.5 text-[11px] font-medium text-[#333333]">
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
          <p className="mt-6 max-w-lg text-base leading-7 text-[#666666]">
            FINNA uses your consented financial data to help you understand your money and make better decisions. You stay in control, always.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={start}
              className="group inline-flex items-center gap-3 rounded-full bg-[#111111] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#344238]"
            >
              Review and give consent <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </button>
            <button onClick={cancelConsent} className="rounded-full px-5 py-3.5 text-sm text-[#666666] hover:bg-white">
              Not now
            </button>
          </div>
        </section>
        <section className="rounded-[2rem] border border-[#dedede] bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,.07)] md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[.16em] text-[#777777]">Requested by</p>
              <h2 className="mt-2 text-2xl font-medium">FINNA</h2>
              <p className="mt-1 text-sm text-[#666666]">Financial Intelligence for New Age</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f3f3f3] text-[#333333]">
              <WalletCards className="size-5" />
            </div>
          </div>
          <div className="my-7 h-px bg-[#eeeeee]" />
          <p className="text-sm leading-6 text-[#666666]">{consent.purpose}</p>
          <div className="mt-7 space-y-4">
            {consent.dataTypes.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#eeeeee] text-[#222222]">
                  <Check className="size-3.5" />
                </span>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-[#eeeeee] pt-5 text-xs text-[#768178]">
            <span>Access duration</span>
            <strong className="font-medium text-[#263329]">{consent.duration}</strong>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#768178]">
            <span>Consent ID</span>
            <code className="text-[10px] text-[#526057]">{consent.id}</code>
          </div>
        </section>
      </motion.div>
      <div className="mx-auto mt-14 flex max-w-5xl items-center gap-3 text-xs text-[#888888]">
        <CircleHelp className="size-4" /> You can revoke this consent anytime from your FINNA profile.
      </div>
    </Shell>
  )
}

function AuthorizePage() {
  const { consent, updateConsent } = useConsent()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const approve = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Initiate consent creation via FINNA backend API
      const res = await finnaApi.createConsent(consent.phone, consent.vpa)

      if (res.consentId) {
        updateConsent({ id: res.consentId })
        try {
          sessionStorage.setItem("finna_aa_consent_id", res.consentId)
        } catch (_) {}
      }

      // If backend returns a live Setu hosted redirect URL (when USE_MOCK_AA=false)
      if (res.url && (res.url.startsWith("http://") || res.url.startsWith("https://"))) {
        window.location.href = res.url
        return
      }

      // The branch preview uses a visual-only AA sandbox handoff when no live URL is configured.
      window.history.pushState({}, "", "/mock-aa/setu-sandbox")
      window.dispatchEvent(new PopStateEvent("popstate"))
    } catch (err: any) {
      console.warn("Consent creation API fallback/notice:", err)
      // If live mode failed or returned an error
      if (err.message && (err.message.includes("Setu") || err.message.includes("500") || err.message.includes("400"))) {
        setErrorMessage(err.message.replace(/^API error \d+: /, "") || "Unable to reach Setu Account Aggregator. Please try again.")
        setIsLoading(false)
      } else {
        // The public preview must never imply that fabricated data came from a bank.
        window.history.pushState({}, "", "/mock-aa/setu-sandbox")
        window.dispatchEvent(new PopStateEvent("popstate"))
      }
    }
  }

  return (
    <Shell back>
      <motion.div {...fade} className="mx-auto max-w-3xl pt-10 md:pt-20">
        <div className="mx-auto max-w-lg rounded-[2rem] border border-[#dedede] bg-white p-7 shadow-[0_18px_60px_rgba(0,0,0,.08)] md:p-10">
          <div className="flex items-center justify-between border-b border-[#eeeeee] pb-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#111111] text-[#111111]">
                <WalletCards className="size-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-[#777777]">Regulated</p>
                <p className="font-medium">Account Aggregator</p>
              </div>
            </div>
            <span className="rounded-full bg-[#f1f1f1] px-2.5 py-1 text-[10px] text-[#555555]">RBI LICENSED</span>
          </div>
          <div className="py-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#f3f3f3] text-[#222222]">
              <ShieldCheck className="size-8" />
            </div>
            <h1 className="mt-5 text-3xl font-medium tracking-[-.04em]">Link your account</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#666666]">
              FINNA is requesting temporary access to your financial information through a secure, regulated connection.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f7f7f7] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Data requested</span>
              <span className="font-medium">3 categories</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[#666666]">For</span>
              <span className="font-medium">{consent.duration}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#f5c6cb] bg-[#fdf7f7] p-4 text-xs text-[#721c24]">
              <AlertCircle className="size-4 shrink-0 text-[#d9534f] mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Connection Notice</p>
                <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{errorMessage}</p>
              </div>
            </div>
          )}

          <button
            onClick={approve}
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] py-3.5 text-sm font-medium text-white transition hover:bg-[#344238] disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Connecting securely...
              </>
            ) : (
              <>
                Approve &amp; link account <ArrowRight className="size-4" />
              </>
            )}
          </button>
          <p className="mt-5 text-center text-[11px] leading-5 text-[#88938a]">
            By continuing, you agree to share this information with FINNA. Your data is encrypted end-to-end.
          </p>
        </div>
      </motion.div>
    </Shell>
  )
}

function SetuSandboxPage() {
  const { consent, approveConsent } = useConsent()
  const [step, setStep] = useState(0)
  const [selectedBanks, setSelectedBanks] = useState<string[]>(["State Bank of India"])

  const proceedToRetrieval = () => {
    approveConsent()
    window.history.pushState({}, "", "/mock-aa/retrieving")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  const toggleBank = (bank: string) => {
    setSelectedBanks((current) =>
      current.includes(bank) ? current.filter((item) => item !== bank) : [...current, bank]
    )
  }

  return (
    <Shell back>
      <motion.div {...fade} className="mx-auto max-w-3xl pt-10 md:pt-20">
        <div className="mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-[#dedede] bg-white shadow-[0_18px_60px_rgba(0,0,0,.08)]">
          <div className="flex items-center justify-between border-b border-[#eeeeee] px-7 py-6 md:px-10">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#334d7c] text-white">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-[#777777]">Sandbox preview</p>
                <p className="font-medium">Setu Account Aggregator</p>
              </div>
            </div>
            <span className="rounded-full bg-[#edf2ff] px-2.5 py-1 text-[10px] font-medium text-[#405b8a]">DEMO</span>
          </div>

          <div className="px-7 py-8 md:px-10">
            <div className="mb-8 flex items-center gap-2">
              {[0, 1, 2, 3].map((item) => (
                <span key={item} className={`h-1 flex-1 rounded-full ${item <= step ? "bg-[#334d7c]" : "bg-[#e8e8e8]"}`} />
              ))}
            </div>

            {step === 0 && (
              <>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#334d7c]"><Smartphone className="size-6" /></div>
                <h1 className="mt-5 text-3xl font-medium tracking-[-.04em]">Verify your mobile</h1>
                <p className="mt-3 text-sm leading-6 text-[#666666]">Your mobile number helps find the accounts you choose to link. This is a sandbox demonstration.</p>
                <label className="mt-7 block text-xs font-medium text-[#555555]">Mobile number</label>
                <input defaultValue="98765 43210" inputMode="numeric" className="mt-2 w-full rounded-xl border border-[#dcdcdc] px-4 py-3 text-sm outline-none ring-[#334d7c] focus:ring-2" />
                <button onClick={() => setStep(1)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#334d7c] py-3.5 text-sm font-medium text-white hover:bg-[#263d67]">Continue <ArrowRight className="size-4" /></button>
              </>
            )}

            {step === 1 && (
              <>
                <Pill><Smartphone className="size-3.5" /> One-time password</Pill>
                <h1 className="mt-5 text-3xl font-medium tracking-[-.04em]">Enter verification code</h1>
                <p className="mt-3 text-sm leading-6 text-[#666666]">In a live flow, Setu sends a one-time password to your mobile. Any six digits work in this demo.</p>
                <input placeholder="••••••" inputMode="numeric" maxLength={6} className="mt-7 w-full rounded-xl border border-[#dcdcdc] px-4 py-3 text-center text-lg tracking-[.5em] outline-none ring-[#334d7c] focus:ring-2" />
                <button onClick={() => setStep(2)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#334d7c] py-3.5 text-sm font-medium text-white hover:bg-[#263d67]">Verify and continue <ArrowRight className="size-4" /></button>
              </>
            )}

            {step === 2 && (
              <>
                <Pill><Building2 className="size-3.5" /> Select institutions</Pill>
                <h1 className="mt-5 text-3xl font-medium tracking-[-.04em]">Choose accounts to link</h1>
                <p className="mt-3 text-sm leading-6 text-[#666666]">A live Account Aggregator shows eligible financial institutions. Choose any sample bank to continue.</p>
                <div className="mt-6 space-y-3">
                  {["State Bank of India", "HDFC Bank", "ICICI Bank"].map((bank) => {
                    const checked = selectedBanks.includes(bank)
                    return <button key={bank} onClick={() => toggleBank(bank)} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left text-sm transition ${checked ? "border-[#334d7c] bg-[#f4f7ff]" : "border-[#e2e2e2] hover:bg-[#fafafa]"}`}><span className="font-medium">{bank}</span><span className={`flex size-6 items-center justify-center rounded-full ${checked ? "bg-[#334d7c] text-white" : "border border-[#cfcfcf]"}`}>{checked && <Check className="size-3.5" />}</span></button>
                  })}
                </div>
                <button disabled={!selectedBanks.length} onClick={() => setStep(3)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#334d7c] py-3.5 text-sm font-medium text-white hover:bg-[#263d67] disabled:opacity-50">Review consent <ArrowRight className="size-4" /></button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#334d7c]"><ShieldCheck className="size-6" /></div>
                <h1 className="mt-5 text-3xl font-medium tracking-[-.04em]">Review and approve</h1>
                <p className="mt-3 text-sm leading-6 text-[#666666]">You are about to share the selected account information with FINNA.</p>
                <div className="mt-6 rounded-2xl bg-[#f7f7f7] p-4 text-sm">
                  <div className="flex justify-between"><span className="text-[#666666]">Requested by</span><strong>FINNA</strong></div>
                  <div className="mt-3 flex justify-between"><span className="text-[#666666]">Accounts</span><strong>{selectedBanks.length} selected</strong></div>
                  <div className="mt-3 flex justify-between"><span className="text-[#666666]">Access duration</span><strong>{consent.duration}</strong></div>
                </div>
                <button onClick={proceedToRetrieval} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#334d7c] py-3.5 text-sm font-medium text-white hover:bg-[#263d67]">Approve and share data <ArrowRight className="size-4" /></button>
                <p className="mt-4 text-center text-[11px] leading-5 text-[#88938a]">Demo only — no bank or personal data is collected.</p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Shell>
  )
}

function CallbackPage() {
  const { approveConsent, updateConsent, setConsentStatus } = useConsent()
  const [statusState, setStatusState] = useState<"verifying" | "approved" | "rejected" | "expired" | "failed">("verifying")
  const [detailMessage, setDetailMessage] = useState<string>("")

  const verifyConsent = useCallback(async () => {
    if (typeof window === "undefined") return

    const searchParams = new URLSearchParams(window.location.search)
    const consentId =
      searchParams.get("consent_id") ||
      searchParams.get("id") ||
      searchParams.get("consentId") ||
      searchParams.get("consentHandle") ||
      sessionStorage.getItem("finna_aa_consent_id") ||
      "CONSENT-DEMO2026"

    const queryStatus = (searchParams.get("status") || "").toUpperCase()
    const errorParam = searchParams.get("reserror") || searchParams.get("error") || searchParams.get("errorCode")

    // Handle direct query param error signals from Setu
    if (queryStatus === "REJECTED" || errorParam === "USER_REJECTED" || errorParam?.toLowerCase().includes("reject")) {
      setStatusState("rejected")
      setConsentStatus("rejected")
      setDetailMessage("Consent authorization was declined.")
      return
    }

    if (queryStatus === "EXPIRED" || errorParam === "EXPIRED") {
      setStatusState("expired")
      setConsentStatus("expired")
      setDetailMessage("The Account Aggregator consent session expired.")
      return
    }

    if (queryStatus === "FAILED" || errorParam) {
      setStatusState("failed")
      setConsentStatus("failed")
      setDetailMessage(errorParam || "Account Aggregator connection failed.")
      return
    }

    try {
      // Query backend for verified consent status
      const res = await finnaApi.getConsentStatus(consentId)
      const currentStatus = (res.status || "PENDING").toUpperCase()

      if (currentStatus === "APPROVED" || currentStatus === "ACTIVE") {
        approveConsent()
        updateConsent({ id: consentId, status: "approved" })
        setStatusState("approved")

        // Smoothly transition to the retrieving UI
        setTimeout(() => {
          window.history.pushState({}, "", "/mock-aa/retrieving")
          window.dispatchEvent(new PopStateEvent("popstate"))
        }, 500)
      } else if (currentStatus === "REJECTED") {
        setStatusState("rejected")
        setConsentStatus("rejected")
        setDetailMessage("Consent was declined by user.")
      } else if (currentStatus === "EXPIRED") {
        setStatusState("expired")
        setConsentStatus("expired")
        setDetailMessage("Consent session has expired.")
      } else if (currentStatus === "REVOKED" || currentStatus === "FAILED") {
        setStatusState("failed")
        setConsentStatus("failed")
        setDetailMessage("Consent request could not be completed.")
      } else {
        // Still pending: check again after 2 seconds
        const timer = setTimeout(() => {
          verifyConsent()
        }, 2000)
        return () => clearTimeout(timer)
      }
    } catch (err: any) {
      console.warn("Backend verification error:", err)
      // If query indicates success or fallback
      if (queryStatus === "APPROVED" || queryStatus === "ACTIVE" || queryStatus === "SUCCESS") {
        approveConsent()
        updateConsent({ id: consentId, status: "approved" })
        setStatusState("approved")
        setTimeout(() => {
          window.history.pushState({}, "", "/mock-aa/retrieving")
          window.dispatchEvent(new PopStateEvent("popstate"))
        }, 500)
      } else {
        setStatusState("failed")
        setDetailMessage("Unable to verify consent status with server.")
      }
    }
  }, [approveConsent, updateConsent, setConsentStatus])

  useEffect(() => {
    verifyConsent()
  }, [verifyConsent])

  const handleRetry = () => {
    window.history.pushState({}, "", "/mock-aa/authorize")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  const handleReturnHome = () => {
    window.history.pushState({}, "", "/")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  return (
    <Shell>
      <motion.div {...fade} className="mx-auto max-w-lg pt-12 md:pt-20">
        <div className="rounded-[2rem] border border-[#dedede] bg-white p-7 text-center shadow-[0_18px_60px_rgba(0,0,0,.08)] md:p-10">
          {statusState === "verifying" && (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#f3f3f3] text-[#222222]">
                <Clock3 className="size-8 text-[#526057]" />
              </div>
              <Pill>
                <ShieldCheck className="size-3.5" /> Verification in progress
              </Pill>
              <h1 className="mt-5 text-2xl font-medium tracking-[-.03em]">Verifying consent status</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#666666]">
                Confirming authorization with the Account Aggregator service. This will just take a second...
              </p>
              <div className="mt-8 flex justify-center">
                <Loader2 className="size-6 animate-spin text-[#333333]" />
              </div>
            </>
          )}

          {statusState === "rejected" && (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#fff4e5] text-[#b76e00]">
                <ShieldAlert className="size-8 text-[#d97706]" />
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3 py-1.5 text-[11px] font-medium text-[#92400e]">
                Consent Declined
              </span>
              <h1 className="mt-4 text-2xl font-medium tracking-[-.03em]">Account linking was declined</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#666666]">
                You chose not to link your account or the request was cancelled. You can link your account at any time to enable real-time financial tracking.
              </p>
              <div className="mt-8 space-y-3">
                <button
                  onClick={handleRetry}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] py-3.5 text-sm font-medium text-white transition hover:bg-[#344238]"
                >
                  Try linking again <ArrowRight className="size-4" />
                </button>
                <button
                  onClick={handleReturnHome}
                  className="w-full rounded-full border border-[#dedede] py-3 text-sm text-[#666666] hover:bg-[#fafafa]"
                >
                  Return to home
                </button>
              </div>
            </>
          )}

          {(statusState === "expired" || statusState === "failed") && (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#fee2e2] text-[#dc2626]">
                <AlertCircle className="size-8 text-[#dc2626]" />
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#fee2e2] px-3 py-1.5 text-[11px] font-medium text-[#991b1b]">
                {statusState === "expired" ? "Session Expired" : "Connection Failed"}
              </span>
              <h1 className="mt-4 text-2xl font-medium tracking-[-.03em]">
                {statusState === "expired" ? "Authorization session expired" : "Could not complete authorization"}
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#666666]">
                {detailMessage || "The Account Aggregator connection could not be completed. Please retry the consent authorization."}
              </p>
              <div className="mt-8 space-y-3">
                <button
                  onClick={handleRetry}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] py-3.5 text-sm font-medium text-white transition hover:bg-[#344238]"
                >
                  <RefreshCw className="size-4" /> Retry connection
                </button>
                <button
                  onClick={handleReturnHome}
                  className="w-full rounded-full border border-[#dedede] py-3 text-sm text-[#666666] hover:bg-[#fafafa]"
                >
                  Return to home
                </button>
              </div>
            </>
          )}
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
        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[#666666]">
          Your data is being securely retrieved and organized. This usually takes a few moments.
        </p>
        <div className="mx-auto mt-12 max-w-md text-left">
          {steps.map((item, index) => (
            <div key={item} className="flex items-center gap-4 border-b border-[#e5e5e5] py-4">
              <span
                className={`flex size-8 items-center justify-center rounded-full text-xs ${
                  index < step
                    ? "bg-[#111111] text-[#25351f]"
                    : index === step
                    ? "border border-[#aabca0] bg-white text-[#526057]"
                    : "bg-[#edf0ea] text-[#999999]"
                }`}
              >
                {index < step ? <Check className="size-4 text-white" /> : index + 1}
              </span>
              <span className={index <= step ? "text-sm text-[#263329]" : "text-sm text-[#999999]"}>{item}</span>
              {index === step && step < steps.length && (
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="ml-auto size-1.5 rounded-full bg-[#555555]"
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-[#888888]">Your financial data is encrypted and transferred securely.</p>
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

  return (
    <Shell>
      <motion.div {...fade} className="pt-10 md:pt-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Pill>
              <ShieldCheck className="size-3.5" /> Connected securely
            </Pill>
            <h1 className="mt-5 text-4xl font-medium tracking-[-.05em] md:text-6xl">Good morning, Arun.</h1>
            <p className="mt-3 text-sm text-[#666666]">Here is your financial picture, in one clear view.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start">
            <button className="flex items-center gap-2 rounded-full border border-[#dedede] bg-white px-4 py-2.5 text-sm text-[#526057]">
              This month <ChevronDown className="size-4" />
            </button>
          </div>
        </div>
        <PredictiveInsights />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-[#111111] p-6 text-white md:col-span-2">
            <p className="text-xs text-[#b5b5b5]">Total balance</p>
            <p className="mt-3 text-4xl font-medium tracking-[-.04em]">{account?.balance ?? "—"}</p>
            <p className="mt-8 text-xs text-[#b5b5b5]">Across 1 linked account · Updated {account?.lastSynced.toLowerCase() ?? "—"}</p>
          </div>
          <div className="rounded-3xl border border-[#dedede] bg-white p-6">
            <p className="text-xs text-[#777777]">Financial health</p>
            <p className="mt-3 text-4xl font-medium">Good</p>
            <div className="mt-8 h-2 overflow-hidden rounded-full bg-[#eeeeee]">
              <div className="h-full w-[72%] rounded-full bg-[#222222]" />
            </div>
            <p className="mt-3 text-xs text-[#666666]">72 / 100 · Building steadily</p>
          </div>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_.8fr]">
          <section className="rounded-3xl border border-[#dedede] bg-white p-6 md:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Recent activity</h2>
              <span className="text-xs text-[#888888]">{account?.bank}</span>
            </div>
            <div className="mt-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-t border-[#eeeeee] py-4">
                  <div>
                    <p className="text-sm font-medium">{transaction.merchant}</p>
                    <p className="mt-1 text-xs text-[#888888]">
                      {transaction.category} · {transaction.date}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${transaction.type === "credit" ? "text-[#678844]" : "text-[#263329]"}`}>
                    {formatSignedCurrency(transaction.amount, transaction.type)}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-3xl bg-[#eaf2d9] p-7">
            <Sparkles className="size-5 text-[#7a9951]" />
            <h2 className="mt-5 text-2xl font-medium tracking-[-.03em]">A clearer next step.</h2>
            <p className="mt-3 text-sm leading-6 text-[#5b6b57]">
              Your income is consistent, and your spending is stable. You could comfortably set aside ₹3,200 this month.
            </p>
            <button className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#435837]">
              Explore insights <ArrowRight className="size-4" />
            </button>
          </section>
        </div>
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
        {path === "/mock-aa/authorize" ? (
          <AuthorizePage />
        ) : path === "/mock-aa/setu-sandbox" ? (
          <SetuSandboxPage />
        ) : path === "/mock-aa/callback" || path === "/consent/callback" ? (
          <CallbackPage />
        ) : path === "/mock-aa/retrieving" ? (
          <RetrievingPage />
        ) : path === "/dashboard" ? (
          <DashboardPage />
        ) : (
          <ConsentPage />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

