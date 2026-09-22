"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Bookmark,
  Send,
  Calendar,
  FileText,
  ListOrdered,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SCHEMES_CATALOG, SchemeItem } from "@/lib/schemes/data"

export default function SchemeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [isSaved, setIsSaved] = React.useState(false)
  const [isApplied, setIsApplied] = React.useState(false)

  const scheme = SCHEMES_CATALOG.find((s) => s.slug === slug)

  if (!scheme) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold">Scheme Not Found</h1>
        <p className="mt-2 text-sm text-[#737373]">The requested welfare scheme could not be located.</p>
        <Link href="/schemes" className="mt-4 underline text-sm font-semibold">
          Return to Schemes
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#e5e5e5] bg-white/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-black transition"
          >
            <ArrowLeft className="size-4" /> Back to Schemes
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaved(!isSaved)}
              className={`rounded-xl border-[#e5e5e5] text-xs h-9 cursor-pointer ${isSaved ? "bg-black text-white" : ""}`}
            >
              <Bookmark className="size-3.5 mr-1.5" />
              {isSaved ? "Saved" : "Save Scheme"}
            </Button>
            <Button
              size="sm"
              onClick={() => setIsApplied(!isApplied)}
              className="rounded-xl bg-black text-white hover:bg-black/90 text-xs h-9 cursor-pointer"
            >
              <Send className="size-3.5 mr-1.5" />
              {isApplied ? "Applied ✓" : "Mark as Applied"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Main Header */}
        <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-10 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#737373] bg-[#f5f5f5] px-3 py-1 rounded-full border border-[#e5e5e5]">
              {scheme.type.replace("_", " ")}
            </span>
            {scheme.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-black bg-[#f5f5f5] border border-[#e5e5e5] px-3 py-1 rounded-full">
                <ShieldCheck className="size-3.5" /> Verified Official Source
              </span>
            )}
            <span className="text-xs text-[#737373] ml-auto">
              Last audited: {scheme.last_verified_at}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
            {scheme.title}
          </h1>
          <p className="text-sm font-medium text-[#737373]">
            Administered by {scheme.provider_name}
          </p>

          <div className="mt-4 p-4 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5]">
            <p className="text-xs font-mono text-[#737373] uppercase tracking-wider">Key Benefit</p>
            <p className="mt-1 text-lg font-bold text-black">{scheme.benefit_summary}</p>
          </div>
        </section>

        {/* Overview & Description */}
        <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold tracking-tight">About This Scheme</h2>
          <p className="text-sm leading-relaxed text-[#525252]">
            {scheme.long_description}
          </p>
        </section>

        {/* Eligibility Criteria */}
        <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Eligibility Criteria</h2>
          <div className="space-y-3">
            {scheme.criteria.map((c, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f5f5f5] border border-[#e5e5e5]">
                <CheckCircle2 className="size-4 text-black shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-black">{c.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Required Documents */}
        <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-black" />
            <h2 className="text-lg font-bold tracking-tight">Required Documents</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {scheme.required_documents.map((doc, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-black flex items-center gap-2">
                <span className="size-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
                {doc}
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-Step Application */}
        <section className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ListOrdered className="size-5 text-black" />
            <h2 className="text-lg font-bold tracking-tight">How to Apply</h2>
          </div>
          <div className="space-y-3">
            {scheme.how_to_apply.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f5f5f5] border border-[#e5e5e5]">
                <span className="size-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm text-black leading-snug">{step}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={scheme.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/90 cursor-pointer"
            >
              Open Official Portal <ExternalLink className="size-4" />
            </a>
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-[#e5e5e5] text-xs font-semibold text-[#737373] hover:text-black hover:border-black cursor-pointer"
            >
              View Verification Source
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
