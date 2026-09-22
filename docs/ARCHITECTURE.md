# FINNA — Architecture Discovery (Phase 0)

> Generated during Phase 0 repo discovery, before any backend/database work.

---

## 1. Framework & Versions

| Layer | Technology | Version |
|---|---|---|
| **Frontend framework** | Next.js (App Router) | 16.0.10 |
| **React** | React 19.2.0 | 19.2.0 |
| **Language** | TypeScript | ^5 |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/postcss`) + `tw-animate-css` | ^4.1.9 |
| **Component library** | shadcn/ui (New York style, RSC enabled) | — |
| **Animation** | Framer Motion | ^13.2.0 |
| **Charts** | Recharts | 2.15.4 |
| **3D** | Three.js / @react-three/fiber | 0.183.2 / 9.5.0 |
| **Form handling** | React Hook Form + Zod + @hookform/resolvers | ^7.60.0 / 3.25.76 |
| **Icons** | Lucide React | ^0.454.0 |
| **Analytics** | @vercel/analytics | 1.3.1 |
| **Backend server** | Express.js (separate `server/` directory, runs on port 4000) | ^4.21.0 |
| **ML service** | Python FastAPI (separate `ml_service/` directory, port 8000) | — |
| **Database client** | @supabase/supabase-js (in Express server only) | ^2.45.0 |
| **Email** | Nodemailer (OTP emails) | ^10.0.10 |
| **Build** | Vercel-deployed Next.js | — |

---

## 2. Router Type

**Next.js App Router** — all routes under `app/`.

However, the actual in-app navigation uses a **manual client-side SPA router** inside `FinnaApp` — `window.history.pushState` + `popstate` listener, with a `useState(path)` driving conditional rendering. Next.js file-system routing is only used for:

- `/` and `/dashboard` and `/insights` — all render the same `<ConsentProvider><FinnaApp /></ConsentProvider>`
- `/login` — renders `<Auth />` directly
- `/api/v1/*` — Next.js API routes (mock data endpoints)

The client-side "router" in `finna-app.tsx` handles: `/consent`, `/login`, `/mock-aa/authorize`, `/mock-aa/retrieving`, `/dashboard`, `/insights`.

---

## 3. Styling

- **Tailwind CSS v4** with PostCSS (`@tailwindcss/postcss`)
- CSS variables defined in `app/globals.css` using OKLCH colour space
- `tw-animate-css` plugin for animation utilities
- Custom utility classes: `.font-display`, `.text-stroke`, `.marquee`, `.hover-lift`, `.noise-overlay`, `.border-sketch`
- Google Fonts via `next/font/google`: **Instrument Sans** (sans), **Instrument Serif** (display), **JetBrains Mono** (mono)
- The design language is earthy/organic: cream backgrounds (`#f8f9f5`), olive greens (`#17211b`, `#d7f36a`, `#657067`), soft borders, large rounded corners (2rem), subtle shadows

---

## 4. State Management

**No external state management library.** All state is local React `useState`/`useEffect` plus one small Context:

| State | Location |
|---|---|
| Consent data | `ConsentProvider` (React Context) in `components/finna/consent-provider.tsx` |
| Auth token/user | `localStorage` (`finna_token`, `finna_user`) — set in `auth-form-1.tsx` |
| Page path (SPA) | `useState(path)` in `finna-app.tsx` |
| Dashboard data | `useState` in `DashboardPage` (fetches from mock API) |
| Cashflow data | `useState` in `CashflowCalendar` (fetches from API / client-side fallback) |
| Predictive insights | `useState` in `PredictiveInsights` (fetches from API / client-side fallback) |

---

## 5. Folder Structure

```
Finna-main/
├── app/                          # Next.js App Router
│   ├── api/v1/                   # API routes (mock data)
│   │   ├── accounts/route.ts          ← hardcoded 2 accounts
│   │   ├── auth/otp/request/route.ts  ← email OTP request
│   │   ├── auth/otp/verify/route.ts   ← email OTP verify
│   │   ├── cashflow/calendar/route.ts ← generated 90-day forecast
│   │   ├── consent/route.ts           ← mock consent create
│   │   ├── consent/[id]/route.ts      ← mock consent status
│   │   ├── health/route.ts            ← health check
│   │   ├── predictions/income/route.ts← mock income prediction
│   │   ├── safe-to-spend/route.ts     ← mock safe-to-spend
│   │   └── transactions/route.ts      ← hardcoded 5 transactions
│   ├── dashboard/page.tsx         # → FinnaApp
│   ├── insights/page.tsx          # → FinnaApp
│   ├── login/page.tsx             # → Auth component
│   ├── globals.css
│   ├── layout.tsx                 # Root layout (fonts, analytics)
│   └── page.tsx                   # → FinnaApp (home/consent)
│
├── components/
│   ├── auth/auth-1.tsx            # Re-export of auth-form-1
│   ├── auth-1.tsx                 # Re-export of auth-form-1
│   ├── finna/
│   │   ├── finna-app.tsx          # Main SPA shell + manual router
│   │   ├── consent-provider.tsx   # Consent React Context
│   │   ├── cashflow-calendar.tsx  # 90-day cashflow calendar + timeline
│   │   └── predictive-insights.tsx# 7d/30d income prediction cards
│   ├── landing/                   # 16 landing page components (marketing)
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── pricing-section.tsx
│   │   └── ... (12 more)
│   ├── ui/                        # 58 shadcn/ui components
│   │   ├── auth-form-1.tsx        # Auth form (sign in/up/reset)
│   │   ├── button.tsx, card.tsx, dialog.tsx, ...
│   │   └── ...
│   └── theme-provider.tsx
│
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── lib/
│   ├── api.ts                     # FinnaApiClient class (typed fetch wrapper)
│   ├── mock-aa-data.ts            # ★ Primary mock data source
│   ├── email.ts                   # Nodemailer OTP email sender
│   ├── otpStore.ts                # In-memory OTP store with TTL
│   └── utils.ts                   # cn() utility
│
├── server/                        # Standalone Express backend (port 4000)
│   ├── .env                       # Supabase + Setu AA credentials
│   ├── package.json
│   ├── src/
│   │   ├── index.ts               # Express app entry
│   │   ├── middleware/auth.ts     # Bearer token auth middleware
│   │   ├── routes/                # 13 route files
│   │   │   ├── accounts.ts, auth.ts, cashflow.ts, consent.ts,
│   │   │   ├── marketplace.ts, predictions.ts, privileges.ts,
│   │   │   ├── profile.ts, recommendations.ts, safe-to-spend.ts,
│   │   │   ├── savings.ts, transactions.ts, webhooks.ts
│   │   └── services/
│   │       ├── supabase.ts        # Supabase client (anon + service role)
│   │       ├── email.ts           # Duplicate email service
│   │       ├── otpStore.ts        # Duplicate OTP store
│   │       └── aa/
│   │           ├── interface.ts   # AccountAggregatorService interface
│   │           ├── index.ts       # Mock/Setu AA switcher
│   │           ├── mock-aa.ts     # Mock AA provider
│   │           └── setu-aa.ts     # Setu AA sandbox integration
│
├── ml_service/                    # Python FastAPI ML service
│   ├── main.py                    # Income prediction + health score endpoints
│   ├── model.py                   # XGBoost-style computation
│   ├── generate_synthetic_data.py
│   ├── synthetic_transactions.json
│   └── requirements.txt
│
├── public/                        # Static assets (icons, placeholders)
├── styles/globals.css             # Duplicate/unused globals
├── components.json                # shadcn/ui config
├── next.config.mjs                # TS errors ignored, images unoptimized
├── tsconfig.json                  # Strict, bundler resolution, @/* paths
├── package.json                   # Root dependencies
└── .env.local                     # NEXT_PUBLIC_API_URL, SMTP config, Vercel OIDC
```

---

## 6. Files Holding Mock/Hardcoded Data

| File | What's mocked |
|---|---|
| `lib/mock-aa-data.ts` | Default consent object, `defaultAccount` (Arun Kumar, SBI, ₹42,680.50), `defaultTransactions` (4 transactions). Functions try API first, fall back to these. |
| `app/api/v1/accounts/route.ts` | Hardcoded 2 bank accounts (SBI ₹42,680.50, HDFC ₹14,250) |
| `app/api/v1/transactions/route.ts` | Hardcoded 5 transactions (Swiggy, UPI, Airtel, Amazon, Uber) |
| `app/api/v1/cashflow/calendar/route.ts` | Deterministic 90-day cashflow forecast (not real data) |
| `app/api/v1/predictions/income/route.ts` | Mock income predictions |
| `app/api/v1/safe-to-spend/route.ts` | Mock safe-to-spend calculation |
| `components/finna/finna-app.tsx` | Hardcoded: "Good morning, Arun", financial health score "72/100 Good", savings suggestion "₹3,200" |
| `components/finna/cashflow-calendar.tsx` | Client-side 90-day fallback generator with hardcoded earning/expense patterns |
| `components/finna/predictive-insights.tsx` | `fallbackForecast()` function computes mock predictions from mock transactions |
| `components/ui/auth-form-1.tsx` | `handleDemoSignIn` creates fake user "Aakash Verma", Google button triggers demo login |
| `server/src/services/aa/mock-aa.ts` | Mock AA provider with synthetic transactions |
| `ml_service/synthetic_transactions.json` | 49KB of synthetic transaction data |
| All 16 `components/landing/*.tsx` files | Marketing content (testimonials, pricing, features) — these are **marketing copy, not user data**, and should remain static. |

---

## 7. Components Consuming Mock Data

| Component | Data consumed | Source |
|---|---|---|
| `DashboardPage` (in `finna-app.tsx`) | Account balance, transactions, health score, savings suggestion | `getAccount()`, `getTransactions()` from `mock-aa-data.ts` → falls back to hardcoded |
| `CashflowCalendar` | 90-day cashflow days | Fetches `/api/v1/cashflow/calendar` → falls back to client-side generated data |
| `PredictiveInsights` | Income/expense forecast | `finnaApi.getIncomePrediction()` → falls back to `fallbackForecast()` using mock transactions |
| `ConsentPage` / `AuthorizePage` | Consent details | `ConsentProvider` context → `defaultConsent` from `mock-aa-data.ts` |
| `Auth` (auth-form-1.tsx) | User identity | Direct Supabase Auth REST API calls + demo user fallback |

---

## 8. Existing Supabase Integration

The project already connects to Supabase project `hszljstojfizjehqkhzk`:

- **Auth form** calls Supabase Auth REST API directly (sign up, sign in, password reset)
- **Server** uses `@supabase/supabase-js` with anon + service role keys
- **No database schema exists yet** — only Supabase Auth is used
- **Setu AA sandbox** credentials are configured in `server/.env`
- The Supabase URL and anon key are **hardcoded** in both `auth-form-1.tsx` and `server/src/services/supabase.ts`

---

## 9. Existing Auth Flow

1. Email + password sign-in/sign-up via direct Supabase REST calls
2. Password reset via Supabase `/auth/v1/recover`
3. Email OTP 2FA (via custom Nodemailer implementation, **not** Supabase MFA)
4. "Demo sign-in" button that bypasses auth entirely
5. Google OAuth button exists but triggers demo sign-in instead
6. Token stored in `localStorage` as `finna_token`
7. No session management, no middleware guards, no refresh token handling

---

## 10. Architecture Observations

### What exists and works
- Beautiful, polished UI with consistent design language
- Smooth Framer Motion animations throughout
- shadcn/ui component library properly configured
- Supabase Auth (email/password) partially working
- Express server with Setu AA integration scaffolded
- Python ML service for income prediction scaffolded
- TypeScript types defined in `lib/api.ts`

### What needs to be built
- **No database tables exist** — Supabase is used only for Auth
- **No RLS policies** — nothing to enforce
- **All data is mock** — every API route returns hardcoded arrays
- **No Google OAuth** — button exists but does demo sign-in
- **No real 2FA** — custom email OTP, not Supabase TOTP MFA
- **No route protection** — any path is accessible without auth
- **No onboarding flow** — user goes straight to dashboard
- **No schemes/insurance/loans module** — doesn't exist
- **No financial health score calculation** — hardcoded "72/100 Good"
- **No AI copilot** — doesn't exist
- **No real AA integration in the frontend** — mock consent flow only
- **Dual architecture problem**: Express server on :4000 AND Next.js API routes — need to consolidate
- **Duplicated code**: email.ts and otpStore.ts exist in both `lib/` and `server/src/services/`
