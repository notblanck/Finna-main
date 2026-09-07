"use client"

import { ArrowLeft } from "lucide-react"
import { PredictiveInsights } from "@/components/finna/predictive-insights"

export default function InsightsPage() {
  return <main className="min-h-screen bg-[#fafafa] text-[#111111]"><header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8"><button onClick={() => window.history.back()} aria-label="Back to dashboard" className="flex items-center gap-2 rounded-full border border-[#dedede] bg-white px-4 py-2 text-sm text-[#555555] transition hover:bg-[#f1f1f1]"><ArrowLeft className="size-4" /> Dashboard</button><div className="flex items-center gap-2 font-semibold tracking-tight"><span className="flex size-8 items-center justify-center rounded-xl bg-[#111111] text-white">F</span><span className="text-lg">finna</span></div><span className="hidden text-xs text-[#777777] sm:block">Private and secure</span></header><section className="mx-auto max-w-6xl px-5 pb-16 md:px-8"><div className="pt-10 md:pt-16"><p className="text-xs uppercase tracking-[.18em] text-[#777777]">FINNA intelligence</p><h1 className="mt-4 max-w-2xl text-5xl font-medium tracking-[-.06em] md:text-7xl">A clearer view of what&apos;s <em className="font-display font-normal">ahead.</em></h1><p className="mt-5 max-w-xl text-base leading-7 text-[#666666]">Explore projections built from your consented financial history. Switch between short-term and monthly patterns to plan with more confidence.</p></div><PredictiveInsights /></section></main>
}
