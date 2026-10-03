"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Cookie, SlidersHorizontal, ShieldCheck, CheckCircle2 } from "lucide-react"
import { FinnaLogo } from "@/components/finna/logo"
import { UserNav } from "@/components/finna/user-nav"

export default function CookiePolicyPage() {
  const openSettings = () => {
    if (typeof window !== "undefined" && (window as any).openFinnaCookieSettings) {
      ;(window as any).openFinnaCookieSettings()
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("finna:open-cookie-settings"))
    }
  }

  return (
    <div className="min-h-screen bg-white text-black selection:bg-primary/20">
      {/* Top Header */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Go to home"
            className="rounded-full border border-[#e5e5e5] p-2 text-[#737373] hover:text-black hover:bg-[#f5f5f5] transition cursor-pointer"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <FinnaLogo size="sm" href="/" />
        </div>
        <div className="flex items-center gap-3">
          <UserNav />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12 md:py-16 space-y-10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] px-3.5 py-1 text-xs font-medium text-black">
            <Cookie className="size-3.5" /> Cookie Usage & Transparency
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-medium tracking-tight">
            Cookie Policy
          </h1>
          <p className="mt-2 text-sm text-[#737373]">
            Last Updated: October 2026 · Effective Date: October 2026
          </p>
        </div>

        {/* Change Preferences Callout */}
        <div className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-black flex items-center gap-2">
              <SlidersHorizontal className="size-4" /> Manage Your Cookie Preferences
            </h3>
            <p className="text-xs text-[#737373]">
              You can adjust or revoke your cookie choices at any time. Your preferences are saved immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={openSettings}
            className="rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#262626] transition shadow-xs cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Open Cookie Settings
          </button>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-[#404040]">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">1. What are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device (computer, phone, or tablet) when you visit a website. They help the website recognize your device, maintain your signed-in state, remember your preferences, and ensure that secure features like Account Aggregator tokens work reliably across browser tabs and mobile sessions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black tracking-tight">2. Categories of Cookies We Use</h2>

            <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-black text-sm">A. Strictly Essential Cookies</h3>
                <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 rounded font-semibold">
                  Required · Always Active
                </span>
              </div>
              <p className="text-xs text-[#737373]">
                These cookies are necessary for the website to function. They enable core security, maintain your authenticated session with Supabase, remember CSRF tokens, and record whether you have completed the mandatory Account Aggregator consent gate. Without these cookies, the service cannot be provided.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-black text-sm">B. Functionality & Personalization Cookies</h3>
                <span className="font-mono text-[10px] bg-[#f5f5f5] text-[#525252] border border-[#e5e5e5] px-2 py-0.5 rounded font-medium">
                  Optional · Configurable
                </span>
              </div>
              <p className="text-xs text-[#737373]">
                These cookies allow FINNA to remember your choices, such as your selected language for the FINNA AI Copilot (English, Tamil, Hindi), voice synthesis mute/unmute audio settings, and custom chart display modes.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-black text-sm">C. Performance & Analytics Cookies</h3>
                <span className="font-mono text-[10px] bg-[#f5f5f5] text-[#525252] border border-[#e5e5e5] px-2 py-0.5 rounded font-medium">
                  Optional · Configurable
                </span>
              </div>
              <p className="text-xs text-[#737373]">
                We use privacy-first telemetry (via Vercel Web Analytics) to observe aggregated traffic patterns, page load times, and error rates. These cookies do not track you across other websites and are only activated if you provide consent.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">3. Cookies Summary Table</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#e5e5e5] rounded-xl overflow-hidden">
                <thead className="bg-[#f5f5f5] text-black uppercase font-mono text-[11px] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="p-3">Cookie Name</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  <tr>
                    <td className="p-3 font-mono font-medium">sb-*-auth-token</td>
                    <td className="p-3">FINNA (Supabase)</td>
                    <td className="p-3 font-medium">Essential</td>
                    <td className="p-3">Maintains authenticated user session and refresh tokens securely.</td>
                    <td className="p-3">Session / 1 Year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium">finna_aa_complete</td>
                    <td className="p-3">FINNA</td>
                    <td className="p-3 font-medium">Essential</td>
                    <td className="p-3">Stores Account Aggregator completion status to unlock dashboard routing.</td>
                    <td className="p-3">1 Year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium">finna_cookie_consent</td>
                    <td className="p-3">FINNA</td>
                    <td className="p-3 font-medium">Essential</td>
                    <td className="p-3">Remembers your cookie banner preferences and choices.</td>
                    <td className="p-3">1 Year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium">_va_*</td>
                    <td className="p-3">Vercel Analytics</td>
                    <td className="p-3 font-medium">Analytics</td>
                    <td className="p-3">Aggregated anonymous page speed and visit metrics.</td>
                    <td className="p-3">Session / 30 Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">4. Browser Cookie Controls</h2>
            <p>
              In addition to our in-app preferences modal, most web browsers allow you to manage or delete cookies via browser settings. If you block all cookies, please note that secure login sessions and Account Aggregator bank synchronization may not operate as intended.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">5. Contact Information</h2>
            <p>
              For questions concerning this Cookie Policy or our privacy practices, contact us at:
            </p>
            <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 space-y-1.5 text-xs font-mono">
              <p><strong>Entity:</strong> [Company Name]</p>
              <p><strong>Email:</strong> [Contact Email] (e.g. privacy@finnastudio.me)</p>
              <p><strong>Address:</strong> [Address, e.g., FINNA Tech Studio, Chennai, Tamil Nadu, PIN 600001, India]</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-5xl border-t border-[#e5e5e5] px-5 py-8 text-center text-xs text-[#737373] space-y-2">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/terms" className="hover:text-black">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
          <Link href="/cookies" className="text-black font-semibold">Cookie Policy</Link>
          <button type="button" onClick={openSettings} className="hover:text-black underline cursor-pointer">
            Cookie settings
          </button>
        </div>
        <p>© 2026 [Company Name]. All rights reserved.</p>
      </footer>
    </div>
  )
}
