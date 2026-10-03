"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Calendar,
  Award,
  Activity,
  Landmark,
  Menu,
  X,
  FileText,
  Shield,
  Cookie,
  SlidersHorizontal,
  LogOut,
  ChevronRight,
  Loader2,
  Edit2
} from "lucide-react"
import { FinnaLogo, FinnaLogoMark } from "./logo"
import { UserNav } from "./user-nav"
import { createClient } from "@/lib/supabase/client"
import { finnaApi } from "@/lib/api"

interface MobileNavProps {
  schemesCount?: number | null
  healthScore?: number | null
  back?: boolean
  onBack?: () => void
}

export function MobileTopBar({ schemesCount }: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [user, setUser] = React.useState<any>(null)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) setUser(data?.user || null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user || null)
    })
    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      finnaApi.setAuthToken("")
      if (typeof window !== "undefined") {
        localStorage.removeItem("finna_token")
        localStorage.removeItem("finna_user")
        localStorage.removeItem("finna_active_aa_consent")
        localStorage.removeItem("finna_aa_complete")
        document.cookie = "finna_aa_complete=false; path=/; max-age=0"
        window.location.href = "/login"
      }
    } catch {
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    } finally {
      setIsLoggingOut(false)
      setIsMenuOpen(false)
    }
  }

  const openCookieSettings = () => {
    setIsMenuOpen(false)
    if (typeof window !== "undefined" && (window as any).openFinnaCookieSettings) {
      ;(window as any).openFinnaCookieSettings()
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("finna:open-cookie-settings"))
    }
  }

  return (
    <>
      <div className="md:hidden sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#e5e5e5] bg-white/95 px-4 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2" aria-label="FINNA Home">
          <FinnaLogoMark className="size-6" />
          <span className="text-lg font-bold tracking-tight text-black">finna</span>
        </Link>

        <div className="flex items-center gap-2">
          <UserNav compact />
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open navigation menu"
            className="flex size-9 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black hover:bg-[#f5f5f5] transition cursor-pointer"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-over Sheet */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="relative w-4/5 max-w-xs h-full bg-white border-l border-[#e5e5e5] shadow-2xl flex flex-col justify-between p-5 z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
                  <div className="flex items-center gap-2">
                    <FinnaLogoMark className="size-6" />
                    <span className="text-base font-bold text-black">Menu</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close menu"
                    className="rounded-full p-1.5 text-[#737373] hover:text-black hover:bg-[#f5f5f5] transition cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Legal & App Links */}
                <div className="space-y-1 text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("finna_open_edit_details"))
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f5f5f5] text-black transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Edit2 className="size-4 text-black" />
                      <span className="font-semibold">Change my details</span>
                    </div>
                    <ChevronRight className="size-4 text-[#a3a3a3]" />
                  </button>

                  <Link
                    href="/terms"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f5f5f5] text-black transition"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-[#737373]" />
                      <span>Terms of Service</span>
                    </div>
                    <ChevronRight className="size-4 text-[#a3a3a3]" />
                  </Link>

                  <Link
                    href="/privacy"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f5f5f5] text-black transition"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="size-4 text-[#737373]" />
                      <span>Privacy Policy</span>
                    </div>
                    <ChevronRight className="size-4 text-[#a3a3a3]" />
                  </Link>

                  <Link
                    href="/cookies"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f5f5f5] text-black transition"
                  >
                    <div className="flex items-center gap-3">
                      <Cookie className="size-4 text-[#737373]" />
                      <span>Cookie Policy</span>
                    </div>
                    <ChevronRight className="size-4 text-[#a3a3a3]" />
                  </Link>

                  <button
                    type="button"
                    onClick={openCookieSettings}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f5f5f5] text-black transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <SlidersHorizontal className="size-4 text-[#737373]" />
                      <span>Cookie settings</span>
                    </div>
                    <ChevronRight className="size-4 text-[#a3a3a3]" />
                  </button>
                </div>
              </div>

              {/* Bottom section with user status and logout */}
              <div className="border-t border-[#e5e5e5] pt-4 space-y-3">
                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <LogOut className="size-4" />
                    )}
                    <span>Log Out ({user.email?.split("@")[0]})</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-black p-3 text-xs font-semibold text-white hover:bg-[#262626] transition shadow-xs"
                  >
                    <span>Login / Sign up</span>
                  </Link>
                )}

                <div className="text-center text-[11px] text-[#a3a3a3]">
                  FINNA · Financial Health for India
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export function MobileBottomTabs({ schemesCount = 3 }: { schemesCount?: number | null }) {
  const pathname = usePathname()

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      id: "insights",
      label: "Cashflow",
      href: "/insights",
      icon: Calendar,
      isActive: pathname === "/insights" || pathname.startsWith("/insights/"),
    },
    {
      id: "schemes",
      label: "Schemes",
      href: "/schemes",
      icon: Award,
      badge: schemesCount ?? 3,
      isActive: pathname === "/schemes" || pathname.startsWith("/schemes/"),
    },
    {
      id: "health-score",
      label: "Health",
      href: "/health-score",
      icon: Activity,
      isActive: pathname === "/health-score",
    },
    {
      id: "aa",
      label: "Bank Sync",
      href: "/aa",
      icon: Landmark,
      isActive: pathname === "/aa" || pathname.startsWith("/aa/"),
    },
  ]

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#e5e5e5] backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.04)]"
      style={{
        paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))",
      }}
    >
      <div className="grid grid-cols-5 items-center justify-around px-1 pt-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
                tab.isActive
                  ? "text-black font-semibold"
                  : "text-[#737373] hover:text-black font-normal"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`size-5 transition-transform duration-200 ${
                    tab.isActive ? "scale-110 stroke-[2.2]" : "stroke-[1.7]"
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 flex size-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
              {tab.isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-black" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
