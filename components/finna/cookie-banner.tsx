"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie, Shield, Check, X, SlidersHorizontal, ChevronRight } from "lucide-react"

export interface CookiePreferences {
  essential: boolean
  analytics: boolean
  functionality: boolean
  timestamp: string
}

const STORAGE_KEY = "finna_cookie_consent"

export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // Ignore
  }
  return null
}

export function CookieBanner() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCustomizeOpen, setIsCustomizeOpen] = React.useState(false)
  const [isCopilotOpen, setIsCopilotOpen] = React.useState(false)
  const [preferences, setPreferences] = React.useState<{
    analytics: boolean
    functionality: boolean
  }>({
    analytics: true,
    functionality: true,
  })

  React.useEffect(() => {
    // Check if consent has already been recorded
    const existing = getCookieConsent()
    if (!existing) {
      // Small timeout so page loads first
      const timer = setTimeout(() => setIsOpen(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  // Listen for Copilot state changes and close-all-overlays events
  React.useEffect(() => {
    const handleCopilotState = (e: any) => {
      const open = !!e.detail?.isOpen
      setIsCopilotOpen(open)
      if (open) {
        setIsCustomizeOpen(false)
      }
    }

    const handleCloseOverlays = (e: any) => {
      if (e.detail?.source !== "cookie-customize") {
        setIsCustomizeOpen(false)
      }
    }

    window.addEventListener("finna:copilot-state", handleCopilotState)
    window.addEventListener("finna:close-all-overlays", handleCloseOverlays)
    return () => {
      window.removeEventListener("finna:copilot-state", handleCopilotState)
      window.removeEventListener("finna:close-all-overlays", handleCloseOverlays)
    }
  }, [])

  // Listen for global open requests (from footer or mobile menu)
  React.useEffect(() => {
    const handleOpen = () => {
      window.dispatchEvent(new CustomEvent("finna:close-all-overlays", { detail: { source: "cookie-customize" } }))
      const existing = getCookieConsent()
      if (existing) {
        setPreferences({
          analytics: existing.analytics,
          functionality: existing.functionality,
        })
      }
      setIsCustomizeOpen(true)
      setIsOpen(true)
    }

    window.addEventListener("finna:open-cookie-settings", handleOpen)
    ;(window as any).openFinnaCookieSettings = handleOpen

    return () => {
      window.removeEventListener("finna:open-cookie-settings", handleOpen)
      delete (window as any).openFinnaCookieSettings
    }
  }, [])

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
      document.cookie = `finna_cookie_consent=${encodeURIComponent(
        JSON.stringify(prefs)
      )}; path=/; max-age=31536000; SameSite=Lax`
      window.dispatchEvent(new CustomEvent("finna:cookie-consent-updated", { detail: prefs }))
    } catch (e) {
      console.warn("Could not save cookie preferences", e)
    }
    setIsOpen(false)
    setIsCustomizeOpen(false)
  }

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      functionality: true,
      timestamp: new Date().toISOString(),
    })
  }

  const handleRejectNonEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      functionality: false,
      timestamp: new Date().toISOString(),
    })
  }

  const handleSaveCustom = () => {
    saveConsent({
      essential: true,
      analytics: preferences.analytics,
      functionality: preferences.functionality,
      timestamp: new Date().toISOString(),
    })
  }

  if (!isOpen || isCopilotOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] pointer-events-none flex items-end sm:items-end sm:p-6 p-3">
        {/* Backdrop for customize modal */}
        {isCustomizeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCustomizeOpen(false)}
            className="fixed inset-0 bg-black/40 pointer-events-auto"
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="pointer-events-auto w-full max-w-xl mx-auto rounded-3xl border border-[#e5e5e5] bg-white p-5 sm:p-6 shadow-2xl relative z-10 text-black"
        >
          {!isCustomizeOpen ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] text-black shrink-0">
                  <Cookie className="size-5" />
                </span>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-black tracking-tight">
                    We respect your privacy
                  </h3>
                  <p className="mt-1 text-xs text-[#737373] leading-relaxed">
                    FINNA uses essential cookies to secure your session and enable Account Aggregator sync. We also use analytics and functionality cookies to improve your gig finance insights. You can manage or reject non-essential cookies.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#e5e5e5]">
                <div className="flex items-center gap-3 text-xs text-[#737373]">
                  <Link href="/cookies" className="hover:text-black underline underline-offset-2">
                    Cookie Policy
                  </Link>
                  <span>·</span>
                  <Link href="/privacy" className="hover:text-black underline underline-offset-2">
                    Privacy
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomizeOpen(true)}
                    className="rounded-full border border-[#e5e5e5] bg-white px-3.5 py-2 text-xs font-medium text-black hover:bg-[#f5f5f5] transition cursor-pointer"
                  >
                    Customize
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectNonEssential}
                    className="rounded-full border border-[#e5e5e5] bg-white px-3.5 py-2 text-xs font-medium text-[#737373] hover:text-black hover:bg-[#f5f5f5] transition cursor-pointer"
                  >
                    Reject non-essential
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-[#262626] transition shadow-xs cursor-pointer"
                  >
                    Accept all
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-black" />
                  <h3 className="text-sm font-bold text-black">Cookie Preferences</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(false)}
                  className="rounded-full p-1 text-[#737373] hover:text-black hover:bg-[#f5f5f5] transition cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {/* Essential */}
                <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black">Essential Cookies</span>
                      <span className="font-mono text-[10px] bg-black text-white px-1.5 py-0.2 rounded font-medium">
                        Always active
                      </span>
                    </div>
                    <p className="mt-1 text-[#737373] text-[11px] leading-relaxed">
                      Strictly required for authentication, account security, CSRF protection, and RBI Account Aggregator session state. Cannot be switched off.
                    </p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="rounded-2xl border border-[#e5e5e5] bg-white p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-black block">Analytics Cookies</span>
                    <p className="mt-1 text-[#737373] text-[11px] leading-relaxed">
                      Allow us to understand page usage, platform performance, and error diagnostics anonymously to make FINNA faster.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences((p) => ({ ...p, analytics: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#e5e5e5] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e5e5e5] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                {/* Functionality */}
                <div className="rounded-2xl border border-[#e5e5e5] bg-white p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-black block">Functionality & Personalization</span>
                    <p className="mt-1 text-[#737373] text-[11px] leading-relaxed">
                      Preserve your AI Copilot language preference (English/Tamil/Hindi), voice speech audio mute states, and active cashflow view modes.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={preferences.functionality}
                      onChange={(e) =>
                        setPreferences((p) => ({ ...p, functionality: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#e5e5e5] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e5e5e5] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(false)}
                  className="rounded-xl px-3 py-2 text-xs text-[#737373] hover:text-black transition cursor-pointer"
                >
                  Back
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRejectNonEssential}
                    className="rounded-full border border-[#e5e5e5] px-3.5 py-2 text-xs font-medium text-[#737373] hover:text-black hover:bg-[#f5f5f5] transition cursor-pointer"
                  >
                    Reject all
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-[#262626] transition cursor-pointer shadow-xs"
                  >
                    Save preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

/**
 * Consent-aware Analytics wrapper so @vercel/analytics only runs after consent
 */
export function ConsentAnalytics() {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = React.useState(false)

  React.useEffect(() => {
    const updateConsent = () => {
      const consent = getCookieConsent()
      setHasAnalyticsConsent(consent?.analytics === true)
    }

    updateConsent()
    window.addEventListener("finna:cookie-consent-updated", updateConsent)
    return () => window.removeEventListener("finna:cookie-consent-updated", updateConsent)
  }, [])

  if (!hasAnalyticsConsent) return null

  // Dynamic import of @vercel/analytics
  const AnalyticsComponent = React.lazy(() =>
    import("@vercel/analytics/next").then((mod) => ({ default: mod.Analytics }))
  )

  return (
    <React.Suspense fallback={null}>
      <AnalyticsComponent />
    </React.Suspense>
  )
}
