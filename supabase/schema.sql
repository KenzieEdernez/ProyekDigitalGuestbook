create table if not exists public.guests (
  id text primary key,
  invitation_barcode text unique,
  name text not null,
  address text,
  phone text,
  email text,
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
create unique index if not exists idx_guests_angpao_unique
  on public.guests(angpao_number)
  where angpao_number is not null;

create table if not exists public.envelope_counters (
  section text primary key check (section in ('A', 'B')),
  last_number integer not null default 0
);

insert into public.envelope_counters (section, last_number)
values ('A', 0), ('B', 0)
on conflict (section) do nothing;

-- Safe on empty DB (no rows matched). Keeps counters in sync if check-ins already exist.
insert into public.envelope_counters (section, last_number)
select
  split_part(angpao_number, '-', 1),
  max(cast(split_part(angpao_number, '-', 2) as integer))
from public.guests
where angpao_number ~ '^[AB]-[0-9]+$'
group by 1
on conflict (section) do update
set last_number = greatest(envelope_counters.last_number, excluded.last_number);

create or replace function public.next_angpao_number(p_section text)
returns text
language plpgsql
as $$
declare
  next_number integer;
begin
  if p_section not in ('A', 'B') then
    raise exception 'Envelope section must be A or B.';
  end if;

  update public.envelope_counters
  set last_number = last_number + 1
  where section = p_section
  returning last_number into next_number;

  return p_section || '-' || lpad(next_number::text, 3, '0');
end;
$$;

create table if not exists public.event_settings (
  id text primary key default 'default',
  name text not null default '',
  date text not null default '',
  time text not null default '',
  time_from text,
  location text not null default '',
  address text not null default '',
  dress_ladies text,
  dress_gentlemen text,
  hero_image text,
  hero_image_portrait text,
  hero_image_card text,
  dress_code_image text,
  logo_image text,
  bird_image text,
  wedding_content jsonb,
  updated_at timestamptz not null default now()
);

alter table public.event_settings
  add column if not exists hero_image_portrait text;

alter table public.event_settings
  add column if not exists hero_image_card text;

alter table public.event_settings
  add column if not exists dress_code_image text;

alter table public.event_settings
  add column if not exists logo_image text;

alter table public.event_settings
  add column if not exists bird_image text;

alter table public.event_settings
  add column if not exists bird_count integer default 6;

alter table public.event_settings
  add column if not exists bird_image_ios text;

alter table public.event_settings
  add column if not exists bird_frames jsonb default '[]'::jsonb;

alter table public.event_settings
  add column if not exists dress_ladies text;

alter table public.event_settings
  add column if not exists dress_gentlemen text;

alter table public.event_settings
  add column if not exists hero_image text;

alter table public.event_settings
  add column if not exists time_from text;

alter table public.event_settings
  add column if not exists wedding_content jsonb;

alter table public.guests
add column if not exists email text;

create table if not exists public.wishes (
  id text primary key,
  guest_name text not null,
  message text not null,
  attendance text,
  created_at timestamptz not null default now()
);

create index if not exists idx_wishes_created on public.wishes(created_at desc);

alter table public.wishes enable row level security;

create policy "Service role manages wishes"
on public.wishes
for all
to service_role
using (true)
with check (true);

alter table public.guests enable row level security;
alter table public.event_settings enable row level security;
alter table public.envelope_counters enable row level security;

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

create policy "Service role manages envelope counters"
on public.envelope_counters
for all
to service_role
using (true)
with check (true);
