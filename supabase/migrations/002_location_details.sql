create table if not exists public.location_details (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  opening_hours jsonb not null default '{}'::jsonb,
  images jsonb not null default '{}'::jsonb,
  citation_data jsonb not null default '{}'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.location_details enable row level security;

drop policy if exists "Allow location details read" on public.location_details;
create policy "Allow location details read"
  on public.location_details
  for select
  using (true);

drop policy if exists "Allow location details write" on public.location_details;
create policy "Allow location details write"
  on public.location_details
  for all
  using (true)
  with check (true);
