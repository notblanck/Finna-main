import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { Auth } from "@/components/ui/auth-form-1"

export const metadata = {
  title: "Login / Sign up | FINNA — Financial Intelligence for India",
  description: "Sign in or create your FINNA account to access your financial dashboard, income predictions, and account aggregation.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; next?: string; error?: string }>
}) {
  const params = await searchParams
  const redirectTo = params?.redirectTo || params?.next || "/dashboard"
  const error = params?.error || null

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 bg-[#fafafa] text-black selection:bg-primary/20">
      {/* Top back navigation */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-black transition"
        >
          <ArrowLeft className="size-4" /> Back to FINNA Home
        </Link>
        <span className="inline-flex items-center gap-1 text-[11px] text-[#737373]">
          <ShieldCheck className="size-3.5 text-black" /> 256-bit Encrypted
        </span>
      </div>

      {/* Centered Auth Card */}
      <div className="w-full max-w-md mx-auto my-6 sm:my-8">
        <Auth redirectTo={redirectTo} initialError={error} />
      </div>

      {/* Footer legal links */}
      <footer className="max-w-md w-full mx-auto text-center text-xs text-[#737373] pb-4 space-y-2">
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/terms" className="hover:text-black transition">Terms of Service</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-black transition">Privacy Policy</Link>
          <span>·</span>
          <Link href="/cookies" className="hover:text-black transition">Cookies</Link>
        </div>
        <p className="text-[11px] text-[#a3a3a3]">
          FINNA · Personal Finance &amp; Welfare Platform for India
        </p>
      </footer>
    </div>
  )
}
