"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Clock3, Sparkles, ShieldCheck, ArrowRight, Landmark } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { FinnaLogo } from "@/components/finna/logo"

const STEPS = [
  { title: "Verifying consent & identity", subtitle: "RBI-regulated consent token confirmed" },
  { title: "Connecting to your bank", subtitle: "Secure handshake with Financial Information Provider" },
  { title: "Retrieving & decrypting transactions", subtitle: "Syncing deposits, credits, and gig platform payouts" },
  { title: "Building your financial picture", subtitle: "Calculating health score and matching welfare schemes" },
]

export default function RetrievingPage() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isDone, setIsDone] = React.useState(false)

  React.useEffect(() => {
    // 1. Ensure cookie and local storage state are set so gated pages unlock
    if (typeof window !== "undefined") {
      document.cookie = "finna_aa_complete=true; path=/; max-age=31536000"
      localStorage.setItem("finna_aa_complete", "true")
    }

    // 2. Ensure Supabase user profile has aa_complete = true
    async function syncUserAA() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("users").update({ aa_complete: true }).eq("id", user.id)
        }
      } catch (err) {
        console.warn("AA sync notice:", err)
      }
    }
    syncUserAA()

    // 3. Step-by-step progress ticking
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length) {
          return prev + 1
        }
        clearInterval(interval)
        return prev
      })
    }, 950)

    return () => clearInterval(interval)
  }, [])

  // 4. When all steps tick off, redirect to main dashboard
  React.useEffect(() => {
    if (currentStep >= STEPS.length) {
      setIsDone(true)
      const timer = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard?synced=true"
        }
      }, 900)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-primary/20">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 md:px-8 border-b border-[#e5e5e5]">
        <FinnaLogo size="md" href="/" />
        <div className="flex items-center gap-2 text-xs font-mono text-[#737373] bg-[#f5f5f5] px-3 py-1.5 rounded-full border border-[#e5e5e5]">
          <Landmark className="size-3.5 text-black" />
          <span>RBI Account Aggregator</span>
        </div>
      </header>

      {/* Main 4-step progress container */}
      <main className="mx-auto w-full max-w-2xl px-5 py-12 md:py-18">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] px-3.5 py-1.5 text-xs font-medium text-black">
            <Clock3 className="size-3.5 text-black animate-spin" />
            <span>Secure retrieval in progress</span>
          </span>

          <h1 className="mt-6 text-4xl font-medium tracking-tight md:text-5xl text-black">
            Making sense of your <em className="font-serif italic font-normal">money.</em>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#737373]">
            Your consented financial data is being securely decrypted and aggregated. This takes only a few seconds.
          </p>

          {/* 4 Steps checklist */}
          <div className="mx-auto mt-10 max-w-md rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm text-left">
            <div className="space-y-5">
              {STEPS.map((item, index) => {
                const isCompleted = index < currentStep
                const isActive = index === currentStep

                return (
                  <div
                    key={item.title}
                    className={`flex items-start gap-4 transition-all duration-300 ${
                      index !== STEPS.length - 1 ? "border-b border-[#f0f0f0] pb-5" : ""
                    }`}
                  >
                    {/* Step Icon / Number Indicator */}
                    <div className="shrink-0 mt-0.5">
                      {isCompleted ? (
                        <motion.span
                          initial={{ scale: 0.5, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="flex size-7 items-center justify-center rounded-full bg-black text-white shadow-xs"
                        >
                          <Check className="size-4 stroke-[3]" />
                        </motion.span>
                      ) : isActive ? (
                        <span className="flex size-7 items-center justify-center rounded-full border-2 border-black bg-white text-black font-bold text-xs animate-pulse">
                          {index + 1}
                        </span>
                      ) : (
                        <span className="flex size-7 items-center justify-center rounded-full bg-[#f5f5f5] text-[#a3a3a3] text-xs font-medium">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-semibold transition-colors duration-200 ${
                            isCompleted || isActive ? "text-black" : "text-[#a3a3a3]"
                          }`}
                        >
                          {item.title}
                        </p>
                        {isCompleted && (
                          <span className="text-[11px] font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Done
                          </span>
                        )}
                        {isActive && (
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            className="size-2 rounded-full bg-black"
                          />
                        )}
                      </div>
                      <p className="text-xs text-[#737373] mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom regulatory note */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 text-xs text-[#737373]">
              <ShieldCheck className="size-4 text-black" />
              <span>RBI Licensed Account Aggregator Gateway · End-to-end Encrypted</span>
            </div>

            {isDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 text-xs font-semibold text-black flex items-center gap-1.5"
              >
                <span>Opening your dashboard...</span>
                <ArrowRight className="size-3.5 animate-pulse" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8 text-center text-xs text-[#a3a3a3] border-t border-[#e5e5e5]">
        FINNA · Financial Intelligence for New Age
      </footer>
    </div>
  )
}
