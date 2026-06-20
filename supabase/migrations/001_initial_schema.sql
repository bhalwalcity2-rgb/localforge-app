create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  address text not null,
  phone text,
  website text,
  email text,
  primary_category text,
  secondary_categories text[],
  short_description text,
  long_description text,
  hours jsonb not null default '{}'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.directories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website_url text,
  submission_url text,
  type text,
  country text,
  is_paid boolean not null default false,
  login_required boolean not null default false,
  verification_type text,
  priority_score int not null default 50,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.citation_tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  directory_id uuid not null references public.directories(id) on delete cascade,
  listing_url text,
  status text not null default 'not_started',
  submitted_at timestamptz,
  live_at timestamptz,
  login_email text,
  verification_notes text,
  issue_notes text,
  proof_file_url text,
  assigned_to uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nap_audits (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  citation_task_id uuid references public.citation_tasks(id) on delete set null,
  found_name text,
  found_address text,
  found_phone text,
  found_website text,
  name_match boolean,
  address_match boolean,
  phone_match boolean,
  website_match boolean,
  score int not null default 0,
  status text not null default 'needs_review',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  report_type text not null default 'citation_progress',
  date_from date,
  date_to date,
  file_url text,
  created_at timestamptz not null default now()
);

create index if not exists businesses_client_id_idx on public.businesses(client_id);
create index if not exists citation_tasks_business_id_idx on public.citation_tasks(business_id);
create index if not exists citation_tasks_directory_id_idx on public.citation_tasks(directory_id);
create index if not exists nap_audits_business_id_idx on public.nap_audits(business_id);
