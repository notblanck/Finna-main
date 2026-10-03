"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogIn, LogOut, Loader2, User, ChevronDown, ShieldCheck, Landmark, Settings, SlidersHorizontal, Edit2, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { finnaApi } from "@/lib/api"

export function UserNav({
  className = "",
  compact = false
}: {
  className?: string
  compact?: boolean
}) {
  const router = useRouter()
  const [user, setUser] = React.useState<any>(null)
  const [guestUser, setGuestUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const checkLocalGuest = React.useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("finna_user")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && (parsed.name || parsed.full_name)) {
            setGuestUser(parsed)
            return
          }
        }
      } catch {}
      setGuestUser(null)
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (isMounted) {
          setUser(user)
          checkLocalGuest()
          setLoading(false)
        }
      } catch {
        if (isMounted) {
          setUser(null)
          checkLocalGuest()
          setLoading(false)
        }
      }
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null)
        checkLocalGuest()
        setLoading(false)
      }
    })

    const handleDataUpdate = () => checkLocalGuest()
    if (typeof window !== "undefined") {
      window.addEventListener("finna_data_updated", handleDataUpdate)
      window.addEventListener("finna_profile_updated", handleDataUpdate)
    }

    return () => {
      isMounted = false
      authListener?.subscription?.unsubscribe()
      if (typeof window !== "undefined") {
        window.removeEventListener("finna_data_updated", handleDataUpdate)
        window.removeEventListener("finna_profile_updated", handleDataUpdate)
      }
    }
  }, [checkLocalGuest])

  // Close menu on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      finnaApi.setAuthToken("")
      if (typeof window !== "undefined") {
        localStorage.removeItem("finna_token")
        localStorage.removeItem("finna_user")
        localStorage.removeItem("finna_estimate_profile")
        localStorage.removeItem("finna_estimate_mode")
        localStorage.removeItem("finna_active_aa_consent")
        localStorage.removeItem("finna_aa_complete")
        document.cookie = "finna_aa_complete=false; path=/; max-age=0"
        document.cookie = "finna_estimate_mode=false; path=/; max-age=0"
        window.location.href = "/login"
      }
    } catch (err) {
      console.error("Sign out error:", err)
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

  const openChangeDetails = () => {
    setIsMenuOpen(false)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("finna_open_edit_details"))
    }
  }

  if (loading) {
    return (
      <div className={`h-8 w-24 rounded-full bg-[#f5f5f5] animate-pulse ${className}`} />
    )
  }

  // Case 1: Guest user who has saved estimate profile details
  if (!user && guestUser && (guestUser.name || guestUser.full_name)) {
    const fullName = guestUser.name || guestUser.full_name
    const firstName = fullName.split(" ")[0]
    const initials = fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    return (
      <div className={`relative ${className}`} ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-[#fafafa] p-1 pr-3 hover:bg-[#f5f5f5] hover:border-black/30 transition-all cursor-pointer focus:outline-hidden"
          aria-label="User profile menu"
          aria-expanded={isMenuOpen}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-black text-white text-[11px] font-bold">
            {initials}
          </span>
          <span className="text-xs font-medium text-black max-w-[100px] truncate hidden sm:inline">
            {firstName}
          </span>
          <ChevronDown className={`size-3 text-[#737373] transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#e5e5e5] bg-white p-2 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95">
            <div className="p-3 border-b border-[#f0f0f0] space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-black text-white text-xs font-bold shrink-0">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-black truncate">{fullName}</p>
                  <p className="text-[11px] text-[#737373] truncate">
                    {guestUser.city ? `${guestUser.city}, ${guestUser.state || "India"}` : "Guest Mode"}
                  </p>
                </div>
              </div>
              <div className="pt-1.5 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  City Estimate Mode
                </span>
              </div>
            </div>

            <div className="py-1 text-xs">
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-black hover:bg-[#f5f5f5] transition"
              >
                <User className="size-3.5 text-[#737373]" />
                <span>Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={openChangeDetails}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-black hover:bg-[#f5f5f5] transition text-left cursor-pointer font-medium"
              >
                <Edit2 className="size-3.5 text-black" />
                <span>Change my details</span>
              </button>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-black hover:bg-[#f5f5f5] transition"
              >
                <LogIn className="size-3.5 text-[#737373]" />
                <span>Login / Save profile</span>
              </Link>
              <button
                type="button"
                onClick={openCookieSettings}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-black hover:bg-[#f5f5f5] transition text-left cursor-pointer"
              >
                <SlidersHorizontal className="size-3.5 text-[#737373]" />
                <span>Cookie Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Case 2: Not logged in and no guest details yet
  if (!user) {
    return (
      <Link
        href="/login"
        className={`inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-[#262626] active:scale-95 transition-all shadow-xs cursor-pointer ${className}`}
      >
        <LogIn className="size-3.5" />
        <span>{compact ? "Login" : "Login / Sign up"}</span>
      </Link>
    )
  }

  // Case 3: User is logged in
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    guestUser?.name ||
    user.email?.split("@")[0] ||
    "User"

  const firstName = fullName.split(" ")[0]
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-[#fafafa] p-1 pr-3 hover:bg-[#f5f5f5] hover:border-black/30 transition-all cursor-pointer focus:outline-hidden"
        aria-label="User profile menu"
        aria-expanded={isMenuOpen}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-black text-white text-[11px] font-bold">
          {initials || <User className="size-3.5" />}
        </span>
        <span className="text-xs font-medium text-black max-w-[100px] truncate hidden sm:inline">
          {firstName}
        </span>
        <ChevronDown className={`size-3 text-[#737373] transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Profile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#e5e5e5] bg-white p-2 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95">
          {/* User info header */}
          <div className="p-3 border-b border-[#f0f0f0] space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-black text-white text-xs font-bold shrink-0">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-black truncate">{fullName}</p>
                <p className="text-[11px] text-[#737373] truncate">{user.email}</p>
              </div>
            </div>
            <div className="pt-1.5 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active Session
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="py-1 text-xs">
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-black hover:bg-[#f5f5f5] transition"
            >
              <User className="size-3.5 text-[#737373]" />
              <span>Dashboard</span>
            </Link>
            <button
              type="button"
              onClick={openChangeDetails}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-black hover:bg-[#f5f5f5] transition text-left cursor-pointer font-medium"
            >
              <Edit2 className="size-3.5 text-black" />
              <span>Change my details</span>
            </button>
            <Link
              href="/aa"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-black hover:bg-[#f5f5f5] transition"
            >
              <Landmark className="size-3.5 text-[#737373]" />
              <span>Bank Sync (AA)</span>
            </Link>
            <button
              type="button"
              onClick={openCookieSettings}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-black hover:bg-[#f5f5f5] transition text-left cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5 text-[#737373]" />
              <span>Cookie Settings</span>
            </button>
          </div>

          {/* Logout footer */}
          <div className="pt-1 border-t border-[#f0f0f0]">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {isLoggingOut ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <LogOut className="size-3.5" />
                )}
                <span>Log out</span>
              </span>
              <span className="text-[10px] text-[#737373] font-mono">FINNA</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
