"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { finnaApi } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { FinnaLogo } from "@/components/finna/logo"

type AuthView = "sign-in" | "sign-up" | "forgot-password" | "reset-success"

interface AuthProps {
  className?: string
  redirectTo?: string
  onSuccess?: (user: any, token: string) => void
  initialError?: string | null
}

export function Auth({
  className,
  redirectTo = "/dashboard",
  onSuccess,
  initialError,
}: AuthProps) {
  const [view, setView] = React.useState<AuthView>("sign-in")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [name, setName] = React.useState("")
  const [agreedToTerms, setAgreedToTerms] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(initialError || null)
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null)
  const [isWebView, setIsWebView] = React.useState(false)

  // Detect Android WebView / Capacitor
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase()
      const isWv =
        ua.includes("; wv") ||
        ua.includes("version/4.0 chrome") ||
        (window as any).Capacitor !== undefined ||
        (window as any).Android !== undefined
      setIsWebView(isWv)
    }
  }, [])

  const handleAuthSuccess = (user: any, token: string) => {
    finnaApi.setAuthToken(token)
    if (typeof window !== "undefined") {
      localStorage.setItem("finna_token", token)
      localStorage.setItem("finna_user", JSON.stringify(user))
      document.cookie = `finna_token=${token}; path=/; max-age=2592000; SameSite=Lax`
    }

    if (onSuccess) {
      onSuccess(user, token)
    } else if (typeof window !== "undefined") {
      // Brief pause to allow cookies to settle, then redirect
      setTimeout(() => {
        window.location.href = redirectTo
      }, 300)
    }
  }

  // 1. SIGN IN SUBMIT
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const cleanEmail = email.trim().toLowerCase()

      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

      if (signInError) {
        throw signInError
      }

      if (!authData.user || !authData.session) {
        throw new Error("Unable to establish session. Please verify your credentials.")
      }

      const user = {
        id: authData.user.id,
        email: authData.user.email || cleanEmail,
        full_name:
          authData.user.user_metadata?.full_name || cleanEmail.split("@")[0],
        preferred_language:
          authData.user.user_metadata?.preferred_language || "en",
      }

      handleAuthSuccess(user, authData.session.access_token)
    } catch (err: any) {
      console.error("[Sign In Error]:", err)
      const msg = err.message || "Invalid email or password"
      if (msg.toLowerCase().includes("invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials or click 'Fast Demo Sign-in' below.")
      } else {
        setError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 2. SIGN UP SUBMIT
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).")
      return
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const cleanEmail = email.trim().toLowerCase()

      const { data: authData, error: signUpErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
            preferred_language: "en",
          },
        },
      })

      if (signUpErr) {
        throw signUpErr
      }

      if (!authData.user) {
        throw new Error("Could not create account. Please try again.")
      }

      const user = {
        id: authData.user.id,
        email: authData.user.email || cleanEmail,
        full_name: name.trim(),
        preferred_language: "en",
      }

      if (authData.session) {
        handleAuthSuccess(user, authData.session.access_token)
      } else {
        setSuccessNotice(
          "Account created successfully! Please check your email to confirm your account, then sign in."
        )
        setView("sign-in")
      }
    } catch (err: any) {
      console.error("[Sign Up Error]:", err)
      setError(err.message || "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // 3. FORGOT PASSWORD SUBMIT
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const origin = typeof window !== "undefined" ? window.location.origin : "https://www.finnastudio.me"
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${origin}/auth/callback?next=/dashboard`,
        }
      )

      if (resetErr) {
        throw resetErr
      }

      setView("reset-success")
    } catch (err: any) {
      console.error("[Forgot Password Error]:", err)
      setError(err.message || "Could not send reset link. Please verify your email.")
    } finally {
      setIsLoading(false)
    }
  }

  // 4. GOOGLE OAUTH
  const handleGoogleSignIn = async () => {
    if (isWebView) {
      setError(
        "Google sign-in is blocked by Google policy inside Android mobile WebViews ('disallowed_useragent'). Please use Email and Password or Fast Demo Sign-in."
      )
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const supabase = createClient()
      const origin = typeof window !== "undefined" ? window.location.origin : "https://www.finnastudio.me"
      const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`

      const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (oauthError) {
        throw oauthError
      }

      if (oauthData?.url) {
        window.location.href = oauthData.url
      }
    } catch (err: any) {
      console.error("[OAuth Error]:", err)
      let msg = err.message || "Failed to start Google sign in"
      if (
        msg.toLowerCase().includes("unsupported provider") ||
        msg.toLowerCase().includes("provider is not enabled")
      ) {
        msg =
          "Google Sign-in is not enabled in your Supabase project. Please use Email and Password or enable Google under Authentication > Providers in Supabase."
      }
      setError(msg)
      setIsLoading(false)
    }
  }

  // 5. DEMO FAST SIGN-IN
  const handleDemoSignIn = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const supabase = createClient()
      const demoEmail = "rider.demo@finna.ai"
      const demoPass = "FinnaDemo2026!"

      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPass,
        })

      if (!signInError && authData?.user && authData?.session) {
        const user = {
          id: authData.user.id,
          email: authData.user.email,
          full_name:
            authData.user.user_metadata?.full_name || "Aakash Verma (Gig Partner)",
          preferred_language: "en",
        }
        if (typeof document !== "undefined") {
          document.cookie = "finna_aa_complete=true; path=/; max-age=31536000; SameSite=Lax"
          localStorage.setItem("finna_aa_complete", "true")
        }
        handleAuthSuccess(user, authData.session.access_token)
        return
      }

      // Local fallback for guest/offline preview
      const fallbackUser = {
        id: "demo-rider-001",
        email: demoEmail,
        full_name: "Aakash Verma (Gig Partner)",
        preferred_language: "en",
      }
      if (typeof document !== "undefined") {
        document.cookie = "finna_aa_complete=true; path=/; max-age=31536000; SameSite=Lax"
        localStorage.setItem("finna_aa_complete", "true")
      }
      handleAuthSuccess(fallbackUser, "finna-demo-token-12345")
    } catch (err: any) {
      console.warn("Demo sign-in fallback:", err)
      const fallbackUser = {
        id: "demo-rider-001",
        email: "rider.demo@finna.ai",
        full_name: "Aakash Verma (Gig Partner)",
        preferred_language: "en",
      }
      if (typeof document !== "undefined") {
        document.cookie = "finna_aa_complete=true; path=/; max-age=31536000; SameSite=Lax"
        localStorage.setItem("finna_aa_complete", "true")
      }
      handleAuthSuccess(fallbackUser, "finna-demo-token-12345")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-xl relative text-black">
        {/* FINNA Logo Branding */}
        <div className="text-center flex flex-col items-center mb-6">
          <FinnaLogo href="/" size="md" className="justify-center mb-3" />
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in-50"
          >
            <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Global Success Banner */}
        {successNotice && (
          <div
            role="status"
            className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in-50"
          >
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successNotice}</div>
          </div>
        )}

        {/* VIEW 1: SIGN IN */}
        {view === "sign-in" && (
          <motion.div
            key="sign-in"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-black">Welcome back</h1>
              <p className="mt-1 text-xs text-[#737373]">
                Sign in to access your financial dashboard &amp; bank sync
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email" className="text-xs font-semibold text-black">
                  Email Address
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isLoading}
                  required
                  className="h-11 rounded-xl bg-[#fafafa] border-[#e5e5e5] text-sm focus-visible:ring-black"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password" className="text-xs font-semibold text-black">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setView("forgot-password")
                    }}
                    className="text-xs font-medium text-[#737373] hover:text-black underline underline-offset-2 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                    className="h-11 rounded-xl bg-[#fafafa] border-[#e5e5e5] text-sm pr-10 focus-visible:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-3 text-[#737373] hover:text-black transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-black text-white hover:bg-[#262626] font-semibold text-sm cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Separator */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e5e5e5]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono">
                <span className="bg-white px-2 text-[#737373]">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth & Demo Buttons */}
            <div className="space-y-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-11 rounded-xl border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5] text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </Button>

              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={isLoading}
                className="w-full h-10 rounded-xl border border-[#e5e5e5] bg-[#fafafa] hover:bg-[#f0f0f0] text-black text-xs font-mono font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="size-3.5 text-amber-500 fill-amber-500" />
                <span>Fast Demo Sign-in (Aakash Verma)</span>
              </button>
            </div>

            {/* Switch to Sign Up */}
            <p className="mt-6 text-center text-xs text-[#737373]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setView("sign-up")
                }}
                className="font-bold text-black hover:underline cursor-pointer"
              >
                Create one
              </button>
            </p>
          </motion.div>
        )}

        {/* VIEW 2: SIGN UP */}
        {view === "sign-up" && (
          <motion.div
            key="sign-up"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-black">Create your account</h1>
              <p className="mt-1 text-xs text-[#737373]">
                Start organizing your gig income, cashflow &amp; welfare
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signup-name" className="text-xs font-semibold text-black">
                  Full Name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arun Kumar"
                  disabled={isLoading}
                  required
                  className="h-11 rounded-xl bg-[#fafafa] border-[#e5e5e5] text-sm focus-visible:ring-black"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-xs font-semibold text-black">
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isLoading}
                  required
                  className="h-11 rounded-xl bg-[#fafafa] border-[#e5e5e5] text-sm focus-visible:ring-black"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-xs font-semibold text-black">
                  Password (min 6 characters)
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                    className="h-11 rounded-xl bg-[#fafafa] border-[#e5e5e5] text-sm pr-10 focus-visible:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-3 text-[#737373] hover:text-black transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Terms of Service & Privacy Policy Checkbox */}
              <div className="flex items-start space-x-2.5 pt-1">
                <Checkbox
                  id="terms-checkbox"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="terms-checkbox"
                  className="text-xs text-[#525252] leading-relaxed cursor-pointer font-normal"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-semibold text-black underline underline-offset-2 hover:text-[#262626]"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-semibold text-black underline underline-offset-2 hover:text-[#262626]"
                  >
                    Privacy Policy
                  </Link>
                  .
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-black text-white hover:bg-[#262626] font-semibold text-sm cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            {/* Separator */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e5e5e5]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono">
                <span className="bg-white px-2 text-[#737373]">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-11 rounded-xl border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5] text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            {/* Switch to Sign In */}
            <p className="mt-6 text-center text-xs text-[#737373]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setView("sign-in")
                }}
                className="font-bold text-black hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </motion.div>
        )}

        {/* VIEW 3: FORGOT PASSWORD */}
        {view === "forgot-password" && (
          <motion.div
            key="forgot-password"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={() => {
                setError(null)
                setView("sign-in")
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-black mb-4 cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> Back to sign in
            </button>

            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-black">Reset password</h1>
              <p className="mt-1 text-xs text-[#737373]">
                Enter your registered email address to receive a password reset link.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs font-semibold text-black">
                  Email Address
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isLoading}
                  required
                  className="h-11 rounded-xl bg-[#fafafa] border-[#e5e5e5] text-sm focus-visible:ring-black"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-black text-white hover:bg-[#262626] font-semibold text-sm cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* VIEW 4: RESET SUCCESS */}
        {view === "reset-success" && (
          <motion.div
            key="reset-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-4"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
              <MailCheck className="size-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">Check your inbox</h2>
              <p className="mt-1.5 text-xs text-[#737373] leading-relaxed max-w-xs mx-auto">
                We sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setView("sign-in")}
              className="rounded-xl border-[#e5e5e5] text-xs h-10 px-6 cursor-pointer"
            >
              Back to Sign in
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
