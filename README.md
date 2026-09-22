# FINNA — AI Financial Co-Pilot for Indian Gig Workers

FINNA is an AI financial co-pilot purpose-built for Indian gig delivery and transport partners (Swiggy, Zomato, Uber, Ola, Rapido, Blinkit, Zepto, Urban Company, Amazon Flex). It transforms volatile, daily cashflows into predictable earnings forecasts, automated daily safe-to-spend limits, and access to verified government social security programs.

---

## Key Modules

1. **Deterministic Financial Health Score (`/health-score`)**
   - 6-component weighted resilience score (0–100) evaluating Income Stability (25%), Savings Rate (20%), Emergency Buffer (15%), Expense Discipline (15%), Debt/EMI Burden (15%), and Compliance (10%).
   - Actionable drag factor audit and verified downloadable certification.

2. **Schemes & Welfare Benefits (`/schemes`)**
   - Sourced and verified central schemes (e-Shram, PM-SYM, PM-JAY, PM SVANidhi), state gig welfare boards (Tamil Nadu, Karnataka), and platform partner benefits (Swiggy Relief Shield, Zomato Medical Cover, EV Upgrade Loans).
   - Data-driven matching engine evaluating user age, operating state, platform tenure, and vehicle ownership.

3. **AI Financial Copilot (Floating Assistant)**
   - Grounded financial coach providing practical rupee-denominated guidance.
   - Guardrails prohibiting speculative investments and surfacing distress helplines (RBI Sachet, Cyber Crime 1930).

4. **Account Aggregator (`/aa`)**
   - Regulated read-only bank statement ingestion powered by Setu AA Sandbox and local mock providers.
   - Automated transaction categorization mapping platform payouts into income entries.

5. **90-Day Cashflow Calendar (`/insights`)**
   - Day-by-day projected earnings, expense commitments, and daily safe-to-spend allowances.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, shadcn/ui.
- **Backend & Database**: Supabase Postgres with Row-Level Security (RLS), Edge Middleware.
- **Auth**: Supabase Auth with Google OAuth, Email/Password, and 2FA TOTP.
- **Account Aggregator**: Setu AA FIU v2 Sandbox Integration.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Documentation
- [Architecture Discovery (Phase 0)](docs/ARCHITECTURE.md)
- [Account Aggregator Integration Guide](docs/ACCOUNT_AGGREGATOR.md)
- [MCP Inventory](docs/MCP.md)
