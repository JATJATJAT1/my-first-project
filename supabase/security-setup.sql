-- ═══════════════════════════════════════════════════════════════════════════════
-- ShiftAI — Security Setup
-- Run this entire file in Supabase SQL Editor once.
-- Order matters — run top to bottom.
-- ═══════════════════════════════════════════════════════════════════════════════


-- ── 1. ENABLE VAULT EXTENSION ─────────────────────────────────────────────────
-- Vault encrypts secrets with pgsodium (AES-256-GCM) inside the database.
-- Credentials stored here never leave the DB in plaintext.
create extension if not exists supabase_vault schema vault;


-- ── 2. VAULT RPC FUNCTIONS ────────────────────────────────────────────────────
-- These are called by the API via supabaseService.rpc(...).
-- security definer = runs with the role that owns the function (postgres),
-- not the caller's role, so the vault.secrets table stays locked down.

create or replace function upsert_vault_secret(
  p_name        text,
  p_secret      text,
  p_description text default ''
)
returns uuid
language plpgsql
security definer
set search_path = vault, public
as $$
declare
  v_existing_id uuid;
  v_new_id      uuid;
begin
  -- Check if a secret with this name already exists
  select id into v_existing_id
  from vault.secrets
  where name = p_name
  limit 1;

  if v_existing_id is not null then
    -- Update in place — preserves the same UUID
    perform vault.update_secret(v_existing_id, p_secret, p_name, p_description);
    return v_existing_id;
  else
    -- Create new secret
    select vault.create_secret(p_secret, p_name, p_description) into v_new_id;
    return v_new_id;
  end if;
end;
$$;

create or replace function read_vault_secret(p_secret_id uuid)
returns text
language plpgsql
security definer
set search_path = vault, public
as $$
declare
  v_decrypted text;
begin
  select decrypted_secret into v_decrypted
  from vault.decrypted_secrets
  where id = p_secret_id;

  if v_decrypted is null then
    raise exception 'Vault secret not found: %', p_secret_id;
  end if;

  return v_decrypted;
end;
$$;

create or replace function delete_vault_secret(p_secret_id uuid)
returns void
language plpgsql
security definer
set search_path = vault, public
as $$
begin
  delete from vault.secrets where id = p_secret_id;
end;
$$;

-- Grant execute only to service_role (used by server-side API).
-- anon and authenticated roles cannot call these functions.
revoke all on function upsert_vault_secret(text, text, text) from public, anon, authenticated;
revoke all on function read_vault_secret(uuid)                from public, anon, authenticated;
revoke all on function delete_vault_secret(uuid)              from public, anon, authenticated;
grant  execute on function upsert_vault_secret(text, text, text) to service_role;
grant  execute on function read_vault_secret(uuid)               to service_role;
grant  execute on function delete_vault_secret(uuid)             to service_role;


-- ── 3. DEALERS TABLE ──────────────────────────────────────────────────────────
create table if not exists dealers (
  id                  uuid primary key default gen_random_uuid(),
  auth_user_id        uuid unique references auth.users(id) on delete cascade,
  email               text not null,
  name                text,
  dealership_name     text,
  plan                text not null default 'starter',
  plan_status         text not null default 'active',
  is_admin            boolean not null default false,
  onboarding_complete boolean not null default false,
  ai_name             text default 'Alex',
  ai_tone             text default 'friendly',
  dealer_mode         text default 'standard',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table dealers enable row level security;

drop policy if exists "Dealer reads own row"    on dealers;
drop policy if exists "Dealer updates own row"  on dealers;
drop policy if exists "Admins read all dealers" on dealers;

-- Dealers can only read and update their own row
create policy "Dealer reads own row"
  on dealers for select
  using (auth_user_id = auth.uid());

create policy "Dealer updates own row"
  on dealers for update
  using (auth_user_id = auth.uid());

-- Admins (is_admin = true) can read all dealer rows
create policy "Admins read all dealers"
  on dealers for select
  using (
    exists (
      select 1 from dealers d
      where d.auth_user_id = auth.uid()
        and d.is_admin = true
    )
  );


-- ── 4. DEALER INTEGRATIONS TABLE ──────────────────────────────────────────────
-- vault_secret_id references the Vault secret that holds the encrypted credentials.
-- The raw credentials column is intentionally absent — nothing sensitive here.
create table if not exists dealer_integrations (
  id               uuid primary key default gen_random_uuid(),
  dealer_id        uuid not null references auth.users(id) on delete cascade,
  partner_id       text not null,
  status           text not null default 'connected',
  vault_secret_id  uuid,                   -- points to vault.secrets
  connected_at     timestamptz,
  last_synced_at   timestamptz,
  unique (dealer_id, partner_id)
);

alter table dealer_integrations enable row level security;

drop policy if exists "Dealer sees own integrations"   on dealer_integrations;
drop policy if exists "Dealer manages own integrations" on dealer_integrations;

-- Dealers can only see their own integrations
create policy "Dealer sees own integrations"
  on dealer_integrations for select
  using (dealer_id = auth.uid());

-- Dealers can insert, update, and delete their own integrations
create policy "Dealer manages own integrations"
  on dealer_integrations for all
  using (dealer_id = auth.uid());


-- ── 5. AUDIT LOG TABLE ────────────────────────────────────────────────────────
-- Records every connect/disconnect event for compliance and debugging.
create table if not exists integration_audit_log (
  id           uuid primary key default gen_random_uuid(),
  dealer_id    uuid not null references auth.users(id) on delete cascade,
  partner_id   text not null,
  action       text not null,      -- 'connected' | 'disconnected' | 'error'
  ip_address   text,
  user_agent   text,
  created_at   timestamptz not null default now()
);

alter table integration_audit_log enable row level security;

-- Dealers can read their own audit log; only service_role can write to it.
create policy "Dealer reads own audit log"
  on integration_audit_log for select
  using (dealer_id = auth.uid());

-- No insert/update/delete policy for authenticated role — only service_role writes.


-- ── 6. UPDATED_AT TRIGGER FOR DEALERS ────────────────────────────────────────
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists dealers_updated_at on dealers;
create trigger dealers_updated_at
  before update on dealers
  for each row execute function touch_updated_at();


-- ── 7. LOCK DOWN VAULT TABLES FROM APPLICATION ROLES ─────────────────────────
-- The vault schema is already private, but make this explicit.
revoke all on schema vault from public, anon, authenticated;
revoke all on all tables in schema vault from public, anon, authenticated;
