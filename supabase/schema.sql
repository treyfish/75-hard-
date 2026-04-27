-- 75 Hard cloud schema. Paste the whole file into the Supabase SQL Editor and Run.
-- Safe to re-run: uses if-not-exists / drop-if-exists where appropriate.

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.days (
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int not null check (day_number between 1 and 75),
  water boolean not null default false,
  workout1 boolean not null default false,
  workout2 boolean not null default false,
  outdoor_workout boolean not null default false,
  diet boolean not null default false,
  read boolean not null default false,
  workout_notes text,
  feelings_notes text,
  completed_at timestamptz,
  photo_path text,
  updated_at timestamptz not null default now(),
  primary key (user_id, day_number)
);

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  start_date date not null,
  theme text not null default 'stoic-gold',
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on every change.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists days_touch on public.days;
create trigger days_touch before update on public.days
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Row-level security: each user sees only their own rows.
-- ============================================================

alter table public.days enable row level security;
alter table public.settings enable row level security;

drop policy if exists "own_days" on public.days;
create policy "own_days" on public.days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_settings" on public.settings;
create policy "own_settings" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Storage bucket for progress photos.
-- Photos are stored at "{user_id}/{day_number}.jpg".
-- ============================================================

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

drop policy if exists "own_photos_select" on storage.objects;
create policy "own_photos_select" on storage.objects
  for select using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "own_photos_insert" on storage.objects;
create policy "own_photos_insert" on storage.objects
  for insert with check (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "own_photos_update" on storage.objects;
create policy "own_photos_update" on storage.objects
  for update using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "own_photos_delete" on storage.objects;
create policy "own_photos_delete" on storage.objects
  for delete using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
