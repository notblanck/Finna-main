import React from "react"
import Link from "next/link"
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, RefreshCw, UserCheck, AlertTriangle } from "lucide-react"
import { FinnaLogo } from "@/components/finna/logo"
import { UserNav } from "@/components/finna/user-nav"

export const metadata = {
  title: "Privacy Policy | FINNA — Financial Intelligence for India",
  description: "Privacy policy complying with India's DPDP Act 2023 and the RBI Account Aggregator framework.",
}

export default function PrivacyPage() {
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
            <ShieldCheck className="size-3.5" /> DPDP Act 2023 & RBI AA Compliant
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-medium tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#737373]">
            Last Updated: October 2026 · Effective Date: October 2026
          </p>
        </div>

        {/* Highlight Summary Card */}
        <div className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-black flex items-center gap-2">
            <Lock className="size-4 text-black" /> Your Privacy at a Glance
          </h3>
          <p className="text-xs text-[#525252] leading-relaxed">
            FINNA is built for Indian gig workers, freelancers, and everyday earners. We believe your financial data belongs exclusively to you. We access your banking information <strong>solely with your explicit consent</strong> via the RBI-regulated Account Aggregator (AA) framework, never sell your personal information to loan sharks or marketers, and enable you to revoke consent or purge your data at any time.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-2xl border border-[#e5e5e5] bg-white p-3.5 text-xs">
              <span className="font-bold text-black block mb-1">100% Read-Only</span>
              <span className="text-[#737373]">No debit, transfer, or money withdrawal capability ever.</span>
            </div>
            <div className="rounded-2xl border border-[#e5e5e5] bg-white p-3.5 text-xs">
              <span className="font-bold text-black block mb-1">End-to-End Encrypted</span>
              <span className="text-[#737373]">Data is encrypted in transit and protected by Supabase RLS.</span>
            </div>
            <div className="rounded-2xl border border-[#e5e5e5] bg-white p-3.5 text-xs">
              <span className="font-bold text-black block mb-1">Unconditional Revocation</span>
              <span className="text-[#737373]">Stop scheduled background data syncs whenever you want.</span>
            </div>
          </div>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-[#404040]">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">1. Who We Are & Regulatory Scope</h2>
            <p>
              This Privacy Policy explains how <strong>[Company Name]</strong> (&ldquo;FINNA&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, stores, and protects your personal and financial data when you use <a href="https://www.finnastudio.me" className="underline font-medium text-black">https://www.finnastudio.me</a> and associated applications.
            </p>
            <p>
              Under India&apos;s <strong>Digital Personal Data Protection Act, 2023 (DPDP Act 2023)</strong>, FINNA operates as a <strong>Data Fiduciary</strong>, and you are the <strong>Data Principal</strong>. Under the Reserve Bank of India&apos;s Account Aggregator framework, FINNA acts as a registered <strong>Financial Information User (FIU)</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">2. Information We Collect</h2>
            <p>We only collect data strictly necessary to deliver personalized financial health insights:</p>
            <div className="space-y-3 pl-2">
              <div className="border-l-2 border-black pl-4">
                <h4 className="font-bold text-black text-xs uppercase tracking-wider">A. Identity & Registration Data</h4>
                <p className="text-xs text-[#737373] mt-1">
                  Your name, email address, password hash (salted and encrypted via Supabase Auth), optional phone number, operating city/state (e.g. Chennai, Tamil Nadu), and gig platforms worked (e.g. Swiggy, Zomato, Uber, Zepto).
                </p>
              </div>

              <div className="border-l-2 border-black pl-4">
                <h4 className="font-bold text-black text-xs uppercase tracking-wider">B. Consented Account Aggregator (AA) Banking Data</h4>
                <p className="text-xs text-[#737373] mt-1">
                  Retrieved exclusively with your permission through the <strong>Setu AA Gateway</strong> (an RBI-regulated NBFC-AA):
                </p>
                <ul className="list-disc pl-5 mt-1 text-xs text-[#737373] space-y-1">
                  <li><strong>Profile & Account Information:</strong> Account holder name, account type (savings/current), masked account number, and bank IFSC/identifier.</li>
                  <li><strong>Deposit Account Summary:</strong> Current balance and periodic balances.</li>
                  <li><strong>Transaction History:</strong> Line-item credits (gig company weekly settlements) and debits (fuel, EMI, living expenses) over your selected period (e.g. 30, 90, or 180 days).</li>
                </ul>
              </div>

              <div className="border-l-2 border-black pl-4">
                <h4 className="font-bold text-black text-xs uppercase tracking-wider">C. Device & Technical Information</h4>
                <p className="text-xs text-[#737373] mt-1">
                  Browser type, operating system, IP address, and cookie consent preferences. In our Android WebView wrapper, no device hardware identifiers (such as IMEI or MAC address) are gathered.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">3. Why We Collect This Data (Purpose of Processing)</h2>
            <p>We process your data strictly for legitimate, user-requested services:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Safe-to-Spend Calculation:</strong> Computing real-time daily discretionary spending allowances after reserving for rent, loan EMIs, and vehicle petrol expenses.</li>
              <li><strong>Predictive Cashflow Calendar:</strong> Modeling future cash balances based on gig earnings cycles and upcoming recurring debits.</li>
              <li><strong>Government Welfare & Scheme Matching:</strong> Evaluating eligibility for state and central government gig worker programs (such as the Tamil Nadu Gig Welfare Board, PM-SYM pension, e-Shram, and PMJJBY).</li>
              <li><strong>Financial Health Score:</strong> Providing an objective 0–100 financial health benchmark.</li>
              <li><strong>FINNA Copilot Advisory:</strong> Powering our AI co-pilot to answer your specific financial queries grounded in your verified figures.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">4. Data Retention & Purging Schedule</h2>
            <p>
              Your banking records obtained via Account Aggregator are retained for a maximum duration corresponding to your consent artefact (default <strong>90 days to 1 year</strong> in your encrypted client vault). If you delete your account or revoke consent, your decrypted banking transactions and statements are marked for immediate purging and permanently expunged within 30 days, except where retention is strictly mandated under Indian law.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">5. Data Principal Rights under India&apos;s DPDP Act, 2023</h2>
            <p>Under the DPDP Act 2023, you enjoy the following statutory rights:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Right to Access Information:</strong> Request a summary of your personal data being processed and third parties with whom it has been shared.</li>
              <li><strong>Right to Correction &amp; Updating:</strong> Rectify inaccurate, misleading, or outdated personal information.</li>
              <li><strong>Right to Erasure &amp; Withdrawal of Consent:</strong> Withdraw your consent at any time and request erasure of your data without detriment.</li>
              <li><strong>Right to Grievance Redressal:</strong> Submit a grievance to our Data Protection Officer regarding data handling.</li>
              <li><strong>Right to Nominate:</strong> Nominate an individual who shall exercise your rights in the event of death or incapacity.</li>
            </ul>
            <p className="text-xs text-[#737373]">
              To exercise any of these rights, email us at <strong>[Contact Email]</strong> with the subject line &ldquo;DPDP Data Principal Request&rdquo;.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">6. Third-Party Service Providers</h2>
            <p>We work with trusted infrastructure providers that adhere to high cybersecurity standards:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Setu (Pine Labs Group):</strong> RBI-licensed Account Aggregator gateway provider for fetching bank statements securely.</li>
              <li><strong>Supabase:</strong> Database and authentication infrastructure hosted in secure cloud regions with PostgreSQL Row-Level Security.</li>
              <li><strong>Vercel:</strong> Web hosting and edge network with optional privacy-first analytics (only loaded with your explicit cookie consent).</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">7. Security Measures</h2>
            <p>
              We implement comprehensive technical and organizational safeguards including AES-256 encryption at rest, TLS 1.3 encryption in transit, strict database row-level security (RLS) guaranteeing that no user can access another user&apos;s data, and regular security vulnerability scanning.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black tracking-tight">8. Grievance Redressal & Contact Details</h2>
            <p>
              For privacy queries, complaints, or exercising your statutory rights, please contact our designated Grievance Officer:
            </p>
            <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 space-y-1.5 text-xs font-mono">
              <p><strong>Data Fiduciary:</strong> [Company Name]</p>
              <p><strong>Grievance / Privacy Officer:</strong> [Grievance Officer Name / Data Protection Officer]</p>
              <p><strong>Email:</strong> [Contact Email] (e.g. privacy@finnastudio.me)</p>
              <p><strong>Postal Address:</strong> [Address, e.g., FINNA Technologies Pvt Ltd, Chennai, Tamil Nadu, PIN 600001, India]</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-5xl border-t border-[#e5e5e5] px-5 py-8 text-center text-xs text-[#737373] space-y-2">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/terms" className="hover:text-black">Terms of Service</Link>
          <Link href="/privacy" className="text-black font-semibold">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-black">Cookie Policy</Link>
          <Link href="/aa" className="hover:text-black">Account Aggregator</Link>
        </div>
        <p>© 2026 [Company Name]. All rights reserved.</p>
      </footer>
    </div>
  )
}
