"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Bike,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ArrowLeft
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { evaluateUserSchemes, EvaluatedScheme } from "@/lib/schemes/matcher"
import { createClient } from "@/lib/supabase/client"

export default function SchemesPage() {
  const [profile, setProfile] = React.useState<any>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedType, setSelectedType] = React.useState<string>("all")

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: dbUser } = await supabase.from("users").select("*").eq("id", user.id).single()
          const { data: platforms } = await supabase.from("user_platforms").select("platform").eq("user_id", user.id)
          setProfile({
            ...dbUser,
            platforms: platforms ? platforms.map((p) => p.platform) : ["swiggy", "uber"],
          })
        }
      } catch (err) {
        console.error("Failed to load profile for schemes:", err)
      }
    }
    loadProfile()
  }, [])

  const { eligible, likelyEligible, allSchemes } = React.useMemo(() => {
    return evaluateUserSchemes(profile || {
      city: "Chennai",
      state: "Tamil Nadu",
      platforms: ["swiggy", "uber"],
      annual_income_estimate: 336000,
      has_own_vehicle: true,
      vehicle_type: "two_wheeler",
      aadhaar_linked: true,
    })
  }, [profile])

  const filteredSchemes = React.useMemo(() => {
    return allSchemes.filter((item) => {
      const matchesSearch =
        item.scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.scheme.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.scheme.provider_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType =
        selectedType === "all" || item.scheme.type === selectedType
      return matchesSearch && matchesType
    })
  }, [allSchemes, searchQuery, selectedType])

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
              <Link href="/schemes" className="text-black font-semibold">Schemes & Welfare</Link>
              <Link href="/health-score" className="hover:text-black transition">Health Score</Link>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-black transition"
          >
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Hero Banner */}
        <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#737373] bg-[#f5f5f5] px-3 py-1 rounded-full border border-[#e5e5e5]">
              <ShieldCheck className="size-3.5 text-black" />
              Official Government & Platform Social Security
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Schemes, Relief & Welfare Benefits
            </h1>
            <p className="mt-3 text-sm text-[#737373] leading-relaxed">
              Every gig worker is entitled to healthcare, accident protection, and welfare support. FINNA matches your real profile against verified central, state, and platform welfare rules with plain-English eligibility.
            </p>
          </div>
        </section>

        {/* 1. Personalized "Eligible For You" Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-black text-white text-xs font-bold">
                {eligible.length}
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight">You're Eligible Right Now</h2>
                <p className="text-xs text-[#737373]">Matched based on your profile and linked platforms</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligible.map((item) => (
              <SchemeCard key={item.scheme.id} evaluated={item} />
            ))}
          </div>
        </section>

        {/* 2. Likely Eligible Section */}
        {likelyEligible.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-[#f5f5f5] border border-[#e5e5e5] text-black text-xs font-bold">
                {likelyEligible.length}
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Likely Eligible — Missing Info</h2>
                <p className="text-xs text-[#737373]">Complete one missing field to unlock these benefits</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {likelyEligible.map((item) => (
                <SchemeCard key={item.scheme.id} evaluated={item} />
              ))}
            </div>
          </section>
        )}

        {/* 3. Catalog Section with Filters */}
        <section className="space-y-6 pt-4 border-t border-[#e5e5e5]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">All Schemes & Benefits</h2>
              <p className="text-xs text-[#737373]">Explore central, state, platform, and loan opportunities</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="size-4 absolute left-3 top-3 text-[#737373]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, provider..."
                  className="pl-9 h-10 bg-white border-[#e5e5e5] text-xs"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "All Types" },
              { id: "government_scheme", label: "Government Schemes" },
              { id: "platform_benefit", label: "Platform Benefits" },
              { id: "insurance", label: "Healthcare & Insurance" },
              { id: "loan", label: "Micro Loans & Credit" },
              { id: "pension", label: "Pensions" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedType(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  selectedType === cat.id
                    ? "bg-black text-white border-black"
                    : "bg-white text-[#737373] border-[#e5e5e5] hover:border-[#a3a3a3]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchemes.map((item) => (
              <SchemeCard key={item.scheme.id} evaluated={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function SchemeCard({ evaluated }: { evaluated: EvaluatedScheme }) {
  const { scheme, status, checklist, missingFieldPrompt } = evaluated

  const isEligible = status === "eligible"
  const isLikely = status === "likely_eligible"

  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 flex flex-col justify-between hover:border-black transition-all shadow-xs group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] bg-[#f5f5f5] px-2.5 py-0.5 rounded-md border border-[#e5e5e5]">
            {scheme.type.replace("_", " ")}
          </span>
          {isEligible && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-[#f5f5f5] border border-[#e5e5e5] px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="size-3 text-black" /> Eligible
            </span>
          )}
          {isLikely && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#525252] bg-[#f5f5f5] border border-[#e5e5e5] px-2.5 py-0.5 rounded-full">
              <HelpCircle className="size-3 text-[#525252]" /> Needs Info
            </span>
          )}
        </div>

        <h3 className="font-bold text-base text-black group-hover:underline underline-offset-2">
          {scheme.title}
        </h3>
        <p className="mt-1 text-xs text-[#737373]">{scheme.provider_name}</p>

        {/* Benefit Highlight */}
        <div className="mt-3 p-3 rounded-xl bg-[#f5f5f5] border border-[#e5e5e5]">
          <p className="text-xs font-semibold text-black leading-snug">{scheme.benefit_summary}</p>
        </div>

        {/* Plain-English Criteria Checklist */}
        <div className="mt-3.5 space-y-1.5 border-t border-[#e5e5e5] pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">Eligibility Checklist</p>
          {checklist.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              {c.passed ? (
                <CheckCircle2 className="size-3.5 text-black shrink-0 mt-0.5" />
              ) : (
                <XCircle className="size-3.5 text-[#a3a3a3] shrink-0 mt-0.5" />
              )}
              <span className={c.passed ? "text-black" : "text-[#737373]"}>{c.text}</span>
            </div>
          ))}
        </div>

        {missingFieldPrompt && (
          <p className="mt-2.5 text-xs text-black font-medium bg-[#f5f5f5] p-2 rounded-lg border border-[#e5e5e5]">
            💡 {missingFieldPrompt}
          </p>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-[#e5e5e5] flex items-center justify-between">
        <Link
          href={`/schemes/${scheme.slug}`}
          className="text-xs font-semibold text-black hover:underline inline-flex items-center gap-1"
        >
          View Full Details <ChevronRight className="size-3" />
        </Link>
        <a
          href={scheme.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[#737373] hover:text-black inline-flex items-center gap-1"
        >
          Official Portal <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  )
}
