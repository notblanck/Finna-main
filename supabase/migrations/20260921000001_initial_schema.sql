-- ==============================================================================
-- FINNA Initial Supabase Postgres Migration
-- AI Financial Co-Pilot for Gig Workers
-- Compatible with TRD §2 & §3 specifications
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Identity & Profiles
-- ------------------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text default 'Gig Partner',
  phone text,
  city text default 'Chennai',
  state text default 'Tamil Nadu',
  preferred_language text default 'en',
  date_of_birth date,
  gender text,
  annual_income_estimate numeric default 360000,
  dependents integer default 1,
  has_own_vehicle boolean default true,
  vehicle_type text default 'Two-wheeler',
  aadhaar_linked boolean default false,
  e_shram_id text,
  pan_last4 text,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_platforms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null,
  joined_on date default current_date,
  is_primary boolean default false,
  avg_monthly_earning numeric default 28000,
  active boolean default true,
  linked_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 2. Financial Accounts & Aggregator Consents
-- ------------------------------------------------------------------------------

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text default 'setu',
  consent_ref text,
  consent_handle text,
  consent_id text,
  status text default 'APPROVED',
  purpose_code text default '101',
  fi_types text[] default array['DEPOSIT'],
  data_range_from timestamptz,
  data_range_to timestamptz,
  expires_at timestamptz default (now() + interval '365 days'),
  consent_artifact jsonb,
  created_at timestamptz default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  bank_name text not null,
  account_type text default 'Savings',
  masked_account text not null,
  balance numeric default 0,
  currency text default 'INR',
  fip_id text,
  updated_at timestamptz default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  txn_date date not null,
  amount numeric not null,
  type text not null check (type in ('CREDIT', 'DEBIT', 'credit', 'debit')),
  description text not null,
  category text default 'General',
  platform text,
  balance_after numeric,
  raw jsonb,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 3. Money: Income, Expenses, Budgets, Savings, Liabilities
-- ------------------------------------------------------------------------------

create table if not exists public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null,
  date date not null default current_date,
  gross_amount numeric not null default 0,
  incentive_amount numeric default 0,
  tips_amount numeric default 0,
  fuel_cost numeric default 0,
  trips_count integer default 0,
  hours_worked numeric default 0,
  source text default 'manual',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null default current_date,
  amount numeric not null default 0,
  category text not null,
  is_recurring boolean default false,
  is_business_expense boolean default false,
  source text default 'manual',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  month text not null,
  category text not null,
  allocated_amount numeric not null default 0,
  safe_to_spend_daily numeric default 0,
  created_at timestamptz default now()
);

create table if not exists public.savings_buckets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null default 0,
  current_amount numeric not null default 0,
  target_date date,
  created_at timestamptz default now()
);

create table if not exists public.savings_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  rule_type text not null,
  percentage numeric not null default 10,
  trigger_event text default 'payout',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.liabilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  lender text not null,
  principal numeric not null default 0,
  outstanding numeric not null default 0,
  emi_amount numeric not null default 0,
  interest_rate numeric default 0,
  start_date date,
  tenure_months integer default 12,
  status text default 'active',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 4. ML Predictions & Financial Health Scores
-- ------------------------------------------------------------------------------

create table if not exists public.income_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  horizon text not null,
  low_estimate numeric not null,
  expected_estimate numeric not null,
  high_estimate numeric not null,
  confidence text default 'medium',
  generated_at timestamptz default now()
);

create table if not exists public.health_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  score numeric not null,
  verification_tier text default 'verified',
  factors jsonb,
  band text default 'Good',
  component_scores jsonb,
  recommendations jsonb,
  computed_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 5. Schemes, Marketplace, Privileges, Side Hustles (Reference Tables)
-- ------------------------------------------------------------------------------

create table if not exists public.marketplace_products (
  id uuid primary key default gen_random_uuid(),
  product_type text not null check (product_type in ('insurance', 'loan')),
  name text not null,
  provider text not null,
  relevant_platforms text[] default array['all'],
  min_health_score integer default 0,
  description text not null
);

create table if not exists public.privileges (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('common', 'platform_specific')),
  platform text,
  title text not null,
  description text not null,
  eligibility_criteria text,
  apply_link text
);

create table if not exists public.side_hustle_recommendations (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  job_type text not null,
  estimated_earning_low numeric not null,
  estimated_earning_high numeric not null,
  reason text not null,
  city text default 'Chennai',
  valid_from timestamptz default now(),
  valid_to timestamptz default (now() + interval '14 days')
);

-- ------------------------------------------------------------------------------
-- 6. AI Copilot
-- ------------------------------------------------------------------------------

create table if not exists public.copilot_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text default 'Financial Consultation',
  created_at timestamptz default now(),
  last_message_at timestamptz default now()
);

create table if not exists public.copilot_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.copilot_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tool_calls jsonb,
  created_at timestamptz default now()
);

create table if not exists public.copilot_feedback (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.copilot_messages(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  rating integer check (rating in (-1, 1)),
  comment text,
  created_at timestamptz default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  action text not null,
  entity text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 7. Row Level Security (RLS)
-- ------------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.user_platforms enable row level security;
alter table public.consents enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.income_entries enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_buckets enable row level security;
alter table public.savings_rules enable row level security;
alter table public.liabilities enable row level security;
alter table public.income_predictions enable row level security;
alter table public.health_scores enable row level security;
alter table public.copilot_conversations enable row level security;
alter table public.copilot_messages enable row level security;
alter table public.copilot_feedback enable row level security;
alter table public.audit_log enable row level security;

-- Reference tables: public read, service role write
alter table public.marketplace_products enable row level security;
alter table public.privileges enable row level security;
alter table public.side_hustle_recommendations enable row level security;

create policy "Public read marketplace_products" on public.marketplace_products for select using (true);
create policy "Public read privileges" on public.privileges for select using (true);
create policy "Public read side_hustle_recommendations" on public.side_hustle_recommendations for select using (true);

-- User-scoped policies
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

create policy "Users can manage own platforms" on public.user_platforms for all using (auth.uid() = user_id);
create policy "Users can manage own consents" on public.consents for all using (auth.uid() = user_id);
create policy "Users can manage own accounts" on public.accounts for all using (auth.uid() = user_id);
create policy "Users can manage own transactions" on public.transactions for all using (auth.uid() = user_id);
create policy "Users can manage own income" on public.income_entries for all using (auth.uid() = user_id);
create policy "Users can manage own expenses" on public.expenses for all using (auth.uid() = user_id);
create policy "Users can manage own budgets" on public.budgets for all using (auth.uid() = user_id);
create policy "Users can manage own savings" on public.savings_buckets for all using (auth.uid() = user_id);
create policy "Users can manage own savings rules" on public.savings_rules for all using (auth.uid() = user_id);
create policy "Users can manage own liabilities" on public.liabilities for all using (auth.uid() = user_id);
create policy "Users can view own predictions" on public.income_predictions for all using (auth.uid() = user_id);
create policy "Users can view own health scores" on public.health_scores for all using (auth.uid() = user_id);
create policy "Users can manage own copilot conversations" on public.copilot_conversations for all using (auth.uid() = user_id);
