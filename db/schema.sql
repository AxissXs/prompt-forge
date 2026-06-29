-- ===========================================================================
-- PromptForge — NeonDB (Postgres) schema
-- Run against your Neon database:  psql "$DATABASE_URL" -f db/schema.sql
-- ===========================================================================

create extension if not exists "pgcrypto";        -- gen_random_uuid()

-- ── Users ──────────────────────────────────────────────────────────────────
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  username      text unique not null,
  password_hash text not null,                      -- bcrypt/scrypt hash
  display_name  text,
  avatar_url    text,
  website_url   text,
  social_links  jsonb default '[]'::jsonb,
  created_at    timestamptz not null default now()
);

-- ── Auth sessions (opaque bearer tokens) ────────────────────────────────────
create table if not exists auth_sessions (
  token       text primary key,                     -- random 256-bit token
  user_id     uuid not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '30 days'
);
create index if not exists idx_auth_sessions_user on auth_sessions(user_id);

-- ── Ideas (sessions) ────────────────────────────────────────────────────────
create table if not exists ideas (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  name         text not null,
  data         jsonb not null,                       -- full FormData snapshot
  is_public    boolean not null default false,
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists idx_ideas_user on ideas(user_id);
create index if not exists idx_ideas_public on ideas(is_public) where is_public;

-- ── Templates ───────────────────────────────────────────────────────────────
create table if not exists templates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  name         text not null,
  content      text not null,
  project_type text not null,
  is_public    boolean not null default false,
  likes        integer not null default 0,
  uses         integer not null default 0,
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists idx_templates_user on templates(user_id);
create index if not exists idx_templates_public on templates(is_public) where is_public;

-- ── Private share links for ideas ───────────────────────────────────────────
create table if not exists share_links (
  token       text primary key,                      -- random url-safe token
  idea_id     uuid not null references ideas(id) on delete cascade,
  owner_id    uuid not null references users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ── Likes (idempotent per user/item) ────────────────────────────────────────
create table if not exists likes (
  user_id   uuid not null references users(id) on delete cascade,
  item_kind text not null check (item_kind in ('template','idea')),
  item_id   uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_kind, item_id)
);
