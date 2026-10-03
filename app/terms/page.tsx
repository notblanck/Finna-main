import React from "react"
import Link from "next/link"
import { ArrowLeft, ShieldCheck, Scale, AlertTriangle, Mail, Building, FileText } from "lucide-react"
import { FinnaLogo } from "@/components/finna/logo"
import { UserNav } from "@/components/finna/user-nav"

export const metadata = {
  title: "Terms of Service | FINNA — Financial Intelligence for India",
  description: "Terms and conditions governing the use of FINNA, the Account Aggregator integration, and financial analytics.",
}

export default function TermsPage() {
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
            <Scale className="size-3.5" /> Legal Terms & Governance
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-medium tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-[#737373]">
            Last Updated: October 2026 · Effective Date: October 2026
          </p>
        </div>

        {/* Regulatory Disclaimer Callout */}
        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 sm:p-6 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sm text-amber-950">
            <AlertTriangle className="size-4 text-amber-700" />
            <span>Important Regulatory Disclaimer: Financial Insights, Not Regulated Advice</span>
          </div>
          <p className="leading-relaxed">
            FINNA (operated by <strong>[Company Name]</strong>) provides technology-based financial intelligence, cashflow forecasting, and automated government welfare scheme eligibility matching. <strong>FINNA is NOT a SEBI-registered Investment Adviser (RIA), Research Analyst, Portfolio Manager, or RBI-regulated banking institution.</strong> The insights, calculations (such as Safe-to-Spend and Health Score), and AI Copilot responses do not constitute binding investment, credit, legal, or tax advice. You are advised to exercise independent judgment or consult an authorized financial advisor before making monetary decisions.
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-[#404040]">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the FINNA web application (accessible at <a href="https://www.finnastudio.me" className="underline font-medium text-black">https://www.finnastudio.me</a>) or our mobile application wrappers (collectively, the &ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and our Privacy Policy. If you do not agree to these Terms, you must immediately discontinue use of the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">2. Eligibility & Account Creation</h2>
            <p>
              To use FINNA, you must be a resident of the Republic of India and at least 18 years of age. You agree to provide accurate, true, and complete information during registration (via email/password or email OTP verification) and to keep your credentials confidential. You are solely responsible for all activities occurring under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">3. Account Aggregator (AA) Framework Integration</h2>
            <p>
              FINNA integrates with India&apos;s Reserve Bank of India (RBI) regulated Account Aggregator ecosystem to retrieve consented financial data from Financial Information Providers (FIPs, such as banks including SBI, HDFC, ICICI, Axis).
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Data Gateway:</strong> We use the RBI-licensed Account Aggregator gateway operated by <strong>Setu (Setu AA / Cookiejar Technologies / licensed NBFC-AA partners)</strong>.</li>
              <li><strong>Read-Only Access:</strong> All access through the AA ecosystem is strictly read-only. FINNA cannot initiate funds transfers, debits, payments, or modify your banking records in any way.</li>
              <li><strong>Explicit Consent:</strong> Data is fetched only upon your explicit two-factor authentication (including mobile verification and bank OTP authorization).</li>
              <li><strong>Scope of Data:</strong> The data requested is strictly limited to Profile information, Deposit Account Summaries, and Transaction History (Credits &amp; Debits) for personal finance management and gig earnings reconciliation.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">4. Revocation of Consent</h2>
            <p>
              Under RBI Master Direction DNBR.030, you possess the unconditional right to revoke your Account Aggregator consent at any time. You can trigger revocation directly within the FINNA application under <Link href="/aa" className="underline font-medium text-black">Bank Sync (AA)</Link> or through your respective Account Aggregator consumer portal. Upon revocation, all scheduled automated statement fetches terminate immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">5. User Conduct & Security</h2>
            <p>
              You agree not to reverse-engineer, decompile, or tamper with the security protocols of the Platform, attempt unauthorized access to another user&apos;s data, or submit fraudulent or forged data. All communication between your device and FINNA is encrypted using Transport Layer Security (TLS 1.3).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable Indian law, [Company Name] and its affiliates shall not be liable for any indirect, incidental, or consequential damages, loss of profits, or data corruption arising from your use of the Platform or delays/failures of third-party banking APIs, FIP bank networks, or Setu gateway downtime.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">7. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in [City / State, e.g., Chennai, Tamil Nadu, India].
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">8. Grievance Redressal & Contact Information</h2>
            <p>
              In accordance with the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023, the details of our designated Grievance Officer are provided below:
            </p>
            <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 space-y-1.5 text-xs font-mono">
              <p><strong>Entity:</strong> [Company Name]</p>
              <p><strong>Grievance Officer:</strong> [Grievance Officer Name / Legal Team]</p>
              <p><strong>Email:</strong> [Contact Email] (e.g. support@finnastudio.me)</p>
              <p><strong>Address:</strong> [Address, e.g., FINNA Tech Studio, Chennai, Tamil Nadu, PIN 600001, India]</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-5xl border-t border-[#e5e5e5] px-5 py-8 text-center text-xs text-[#737373] space-y-2">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/terms" className="text-black font-semibold">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-black">Cookie Policy</Link>
          <Link href="/aa" className="hover:text-black">Account Aggregator</Link>
        </div>
        <p>© 2026 [Company Name]. All rights reserved.</p>
      </footer>
    </div>
  )
}
