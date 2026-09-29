"use client"

import * as React from "react"
import Link from "next/link"
import { LogIn, LogOut, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { finnaApi } from "@/lib/api"

export function UserNav({ className = "" }: { className?: string }) {
  const [user, setUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (isMounted) {
          setUser(user)
          setLoading(false)
        }
      } catch {
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      authListener?.subscription?.unsubscribe()
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
        window.location.href = "/login"
      }
    } catch (err) {
      console.error("Sign out error:", err)
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div className={`h-8 w-20 rounded-full bg-[#f5f5f5] animate-pulse ${className}`} />
    )
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={`inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white hover:bg-[#262626] active:scale-95 transition-all shadow-xs cursor-pointer ${className}`}
      >
        <LogIn className="size-3.5" />
        <span>Log In</span>
      </Link>
    )
  }

  const displayName =
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.user_metadata?.name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "Account"

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3.5 py-1.5 text-xs font-medium text-black">
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="max-w-[120px] truncate">{displayName}</span>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        title="Log out of FINNA"
        className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-xs font-medium text-[#737373] hover:text-black hover:bg-[#f5f5f5] hover:border-black/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        {isLoggingOut ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <LogOut className="size-3.5" />
        )}
        <span>Log Out</span>
      </button>
    </div>
  )
}
