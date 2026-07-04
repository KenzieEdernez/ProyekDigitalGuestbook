create table if not exists public.guests (
  id text primary key,
  invitation_barcode text unique,
  name text not null,
  address text,
  phone text,
  pax integer not null default 1,
  angpao_number text,
  souvenir_barcode text unique,
  photo_url text,
  checked_in_at timestamptz,
  souvenir_claimed_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'checked_in', 'souvenir_claimed', 'declined')),
  created_at timestamptz not null default now()
);

create index if not exists idx_guests_status on public.guests(status);
create index if not exists idx_guests_invitation on public.guests(invitation_barcode);
create index if not exists idx_guests_souvenir on public.guests(souvenir_barcode);
create index if not exists idx_guests_angpao on public.guests(angpao_number);

create table if not exists public.event_settings (
  id text primary key default 'default',
  name text not null,
  date text not null,
  time text not null,
  location text not null,
  address text not null,
  dress_code text not null,
  dress_note text not null,
  updated_at timestamptz not null default now()
);

alter table public.guests enable row level security;
alter table public.event_settings enable row level security;

create policy "Service role manages guests"
on public.guests
for all
to service_role
using (true)
with check (true);

create policy "Service role manages event settings"
on public.event_settings
for all
to service_role
using (true)
with check (true);
