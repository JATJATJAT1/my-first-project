-- Firecrawl "Dealership Website Analyzer" — scan history table.
-- Each row is one analysis of a dealership website, owned by the dealer who ran it.

create table if not exists public.dealer_scans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  url             text not null,
  dealership_name text,
  brands          text[]      not null default '{}',
  city            text,
  state           text,
  phone           text,
  features        jsonb       not null default '{}'::jsonb,
  score           int         not null default 0,
  gaps            text[]      not null default '{}',
  favicon_url     text,
  created_at      timestamptz not null default now()
);

create index if not exists dealer_scans_user_created_idx
  on public.dealer_scans (user_id, created_at desc);

-- Row Level Security: a dealer can only read/write their own scans.
alter table public.dealer_scans enable row level security;

drop policy if exists dealer_scans_select_own on public.dealer_scans;
create policy dealer_scans_select_own on public.dealer_scans
  for select using (auth.uid() = user_id);

drop policy if exists dealer_scans_insert_own on public.dealer_scans;
create policy dealer_scans_insert_own on public.dealer_scans
  for insert with check (auth.uid() = user_id);

drop policy if exists dealer_scans_delete_own on public.dealer_scans;
create policy dealer_scans_delete_own on public.dealer_scans
  for delete using (auth.uid() = user_id);
