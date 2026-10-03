# FINNA — AI Financial Co-Pilot for Indian Gig Workers

FINNA is an AI financial co-pilot purpose-built for Indian gig delivery and transport partners (Swiggy, Zomato, Uber, Ola, Rapido, Blinkit, Zepto, Urban Company, Amazon Flex). It transforms volatile, daily cashflows into predictable earnings forecasts, automated daily safe-to-spend limits, and access to verified government social security programs.

---

## Key Modules

1. **City-Level Predictive Profiling (Instant Onboarding & "Not now" Flow)**
   - Allows users to explore FINNA immediately without requiring bank logins or Account Aggregator (AA) consent.
   - Powered by a multi-target **XGBoost regressor** blended with city-level dataset averages across 60 cities and all 36 Indian states & UTs.
   - Predicts weekly income intervals (low / expected / high), typical rent, food/utilities, vehicle fuel, loan EMI obligations, safe savings capacity, and daily Safe-to-Spend allowances.
   - Includes real-time inline editing marked as "your input" that deterministically re-syncs the entire financial engine, dashboard cards, and Copilot.

2. **Deterministic Financial Health Score (`/health-score`)**
   - 6-component weighted resilience score (0–100) evaluating Income Stability (25%), Savings Rate (20%), Emergency Buffer (15%), Expense Discipline (15%), Debt/EMI Burden (15%), and Compliance (10%).
   - Actionable drag factor audit and verified downloadable certification.

3. **Schemes & Welfare Benefits (`/schemes`)**
   - Sourced and verified central schemes (e-Shram, PM-SYM, PM-JAY, PM SVANidhi), state gig welfare boards (Tamil Nadu, Karnataka), and platform partner benefits (Swiggy Relief Shield, Zomato Medical Cover, EV Upgrade Loans).
   - Data-driven matching engine evaluating user age, operating state, platform tenure, and vehicle ownership.

4. **AI Financial Copilot (Floating Assistant)**
   - Grounded financial coach providing practical rupee-denominated guidance.
   - Dynamically greets the user by name (`Hey <name>, I'm FINNA.`) and notes when answers are `*(based on estimates for <city>)*` until bank statements are connected.
   - Guardrails prohibiting speculative investments and surfacing distress helplines (RBI Sachet, Cyber Crime 1930).

5. **Account Aggregator (`/aa`)**
   - Regulated read-only bank statement ingestion powered by Setu AA Sandbox and local mock providers.
   - Automated transaction categorization mapping platform payouts into income entries.

6. **90-Day Cashflow Calendar (`/insights`)**
   - Day-by-day projected earnings, expense commitments, and daily safe-to-spend allowances.

---

## Machine Learning Service (`ml_service`)

FINNA incorporates a Python microservice hosting multi-target XGBoost regression models blended with empirical city-level averages.

### Dataset Schema (`ml_service/data/`)

Any CSV placed into `ml_service/data/` is automatically validated, cleaned, and ingested by `ml_service/data_loader.py`. The required schema is:

| Column | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `state` | string | Full Indian State or Union Territory name | `Tamil Nadu` |
| `city` | string | City or District name | `Chennai` |
| `city_tier` | string | `Tier 1`, `Tier 2`, or `Tier 3` | `Tier 1` |
| `avg_gig_weekly_income` | float | Typical weekly net gig earnings in ₹ | `6850.00` |
| `income_std` | float | Standard deviation of weekly income (volatility) | `1120.00` |
| `avg_monthly_rent` | float | Typical 1BHK / shared accommodation rent in ₹ | `7500.00` |
| `avg_monthly_food_utilities`| float | Groceries, electricity, water, cylinder expenses in ₹| `5200.00` |
| `avg_transport_fuel` | float | Fuel, charging, and maintenance costs in ₹ | `3400.00` |
| `avg_emi_burden` | float | Two-wheeler or personal loan EMI burden in ₹ | `2400.00` |
| `cost_of_living_index` | float | Indexed living cost (National baseline = 100) | `118.5` |
| `platform_type` | string | `delivery`, `ride_hailing`, or `freelance` | `delivery` |
| `season_factor` | float | Monthly/seasonal demand multiplier | `1.05` |
| `source` | string | Data source attribution or survey authority | `NSSO / Gig Survey 2026` |
| `year` | int | Year of data collection | `2026` |
| `synthetic` | boolean | `true` if synthetic/illustrative; `false` if real survey data | `false` |

> **Illustrative Sample Data Note**: When real private survey files are absent, FINNA includes `ml_service/data/sample_city_gig_data_synthetic.csv` (marked `synthetic=True`). The UI transparently presents these numbers under an **"Illustrative data"** badge.

### One-Command Retraining & Evaluation

To retrain the XGBoost models and generate the evaluation benchmark report:
```bash
npm run retrain
# or directly:
python ml_service/train.py
```

This outputs a validation metrics table comparing XGBoost with the city-average baseline and saves `ml_service/artifacts/metrics.json` and `xgb_models.joblib`:

```
==========================================================================================
FINNA XGBOOST vs CITY-AVERAGE BASELINE EVALUATION (v1.2.0)
==========================================================================================
Target                       | XGB MAE    | Base MAE   | XGB RMSE   | Base RMSE  | Winner    
------------------------------------------------------------------------------------------
avg_gig_weekly_income        | 132.06     | 1583.41    | 165.89     | 1900.98    | XGBoost   
avg_monthly_rent             | 155.99     | 153.59     | 191.30     | 184.01     | Baseline  
avg_monthly_food_utilities   | 120.23     | 119.88     | 142.16     | 140.76     | Baseline  
avg_transport_fuel           | 95.92      | 1236.45    | 122.04     | 1461.25    | XGBoost   
avg_emi_burden               | 86.37      | 86.14      | 100.84     | 99.92      | Baseline  
safe_savings_capacity        | 369.81     | 3323.25    | 468.36     | 3942.25    | XGBoost   
==========================================================================================
```

If XGBoost fails to beat the city-average baseline on validation data for any target, FINNA prioritizes the baseline estimate for that metric and transparently documents the winner.

### Running `ml_service` Locally

```bash
cd ml_service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- Interactive Swagger API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
- Predict endpoint: `POST http://localhost:8000/predict`

### Deploying `ml_service` (Render / Railway / Hugging Face Spaces)

Because Vercel runs serverless Node.js functions and cannot host heavy Python C-extensions (like XGBoost and NumPy), `ml_service` is designed as an independent container service:

1. **Deploy to Render / Railway**:
   - Create a new **Web Service** pointing to the repository.
   - Set Root Directory to `ml_service`.
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
2. **Wire to Next.js**:
   - In your Next.js environment (e.g. Vercel Project Settings or `.env.local`), configure:
     ```env
     FINNA_ML_SERVICE_URL="https://your-ml-service.onrender.com"
     ```
3. **Zero-Downtime Fallback**:
   - If `FINNA_ML_SERVICE_URL` is unreachable, offline, or takes longer than 3.5 seconds, the Next.js API route (`/api/v1/predict/profile`) seamlessly falls back to the embedded TypeScript regional averages in `lib/data/city-baselines.ts`. The UI displays a small **"City average"** badge so the app never crashes or hangs.

---

## What the Model Is and Is Not

- **What it IS**:
  - A regional predictive intelligence model trained on city-level gig economy statistics.
  - A tool to give gig workers an immediate, realistic baseline of their earning power, living costs, and safe daily spending limits *before* linking their bank accounts.
  - An educational guide that blends machine learning with historical city averages to offer conservative bounds.
- **What it IS NOT**:
  - It is **not** an individual credit scoring or loan underwriting model.
  - It does **not** reflect verified banking statements or actual historical payouts until the user links their accounts through the Account Aggregator flow.
  - Numbers generated with synthetic datasets are explicitly marked with an **"Illustrative data"** badge and should never be cited as official census or NSSO statistics.

---

## Tech Stack

- **Frontend**: Next.js 16 (Turbopack), React 19, Tailwind CSS v4, Framer Motion, Lucide Icons.
- **Backend & Database**: Supabase Postgres with Row-Level Security (RLS), Edge Middleware.
- **ML & Analytics**: Python 3.11+, XGBoost 3.4+, Scikit-Learn, FastAPI, Uvicorn, Joblib.
- **Auth**: Supabase Auth with Google OAuth and Email/Password.
- **Account Aggregator**: RBI-regulated Setu AA FIU v2 Sandbox Integration.

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

### 4. Run Automated Test Suite
```bash
npm test
```
Runs the 8-point automated validation test covering form constraints, state/city mapping, prediction intervals, unknown city fallback, service-down fallback, and financial engine reactivity.

---

## Regulatory Disclaimer

FINNA provides financial insights, educational estimates based on city data, and cashflow intelligence. It does not provide regulated financial, credit, or investment advice.
