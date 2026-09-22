-- ==============================================================================
-- FINNA Migration: Setu Account Aggregator (AA) Real Integration Tables
-- Compatible with Setu AA FIU v2 specifications
-- ==============================================================================

-- 1. aa_consents table
create table if not exists public.aa_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  consent_id text not null,
  status text not null default 'PENDING',
  purpose text default 'Personal Finance Management',
  url text,
  txnid text,
  vpa text,
  raw_response jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast lookup by consent_id and user_id
create index if not exists idx_aa_consents_consent_id on public.aa_consents (consent_id);
create index if not exists idx_aa_consents_user_id on public.aa_consents (user_id);

-- 2. aa_data_sessions table
create table if not exists public.aa_data_sessions (
  id uuid primary key default gen_random_uuid(),
  consent_id text not null,
  session_id text not null,
  status text not null default 'PENDING',
  fetched_at timestamptz,
  user_id uuid references public.users(id) on delete cascade,
  error text,
  raw_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast lookup by session_id and consent_id
create index if not exists idx_aa_data_sessions_session_id on public.aa_data_sessions (session_id);
create index if not exists idx_aa_data_sessions_consent_id on public.aa_data_sessions (consent_id);
create index if not exists idx_aa_data_sessions_user_id on public.aa_data_sessions (user_id);

-- 3. Row Level Security (RLS)
alter table public.aa_consents enable row level security;
alter table public.aa_data_sessions enable row level security;

-- Policies for aa_consents
create policy "Users can view own aa_consents"
  on public.aa_consents for select
  using (auth.uid() = user_id);

create policy "Users can insert own aa_consents"
  on public.aa_consents for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update own aa_consents"
  on public.aa_consents for update
  using (auth.uid() = user_id or user_id is null);

-- Policies for aa_data_sessions
create policy "Users can view own aa_data_sessions"
  on public.aa_data_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own aa_data_sessions"
  on public.aa_data_sessions for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update own aa_data_sessions"
  on public.aa_data_sessions for update
  using (auth.uid() = user_id or user_id is null);
