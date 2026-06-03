create extension if not exists "pgcrypto";

create table if not exists public.media_gallery (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  description text,
  type text not null check (type in ('image', 'video')),
  folder_category text not null default 'Kamera' check (folder_category in ('Kamera', 'iPhone', 'Drone')),
  drive_url text not null
);

alter table public.media_gallery enable row level security;

drop policy if exists "Public can read media gallery" on public.media_gallery;
create policy "Public can read media gallery"
on public.media_gallery
for select
using (true);

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  username text not null unique,
  constraint admin_profiles_username_format check (username ~ '^[A-Za-z0-9._-]{3,32}$')
);

create unique index if not exists admin_profiles_username_lower_idx
on public.admin_profiles (lower(username));

alter table public.admin_profiles enable row level security;

drop policy if exists "Admins can read own profile" on public.admin_profiles;
create policy "Admins can read own profile"
on public.admin_profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Admins can update own profile" on public.admin_profiles;
create policy "Admins can update own profile"
on public.admin_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.get_admin_login_email(input_username text)
returns text
language sql
security definer
set search_path = public, auth
as $$
  select users.email
  from public.admin_profiles profiles
  join auth.users users on users.id = profiles.id
  where lower(profiles.username) = lower(trim(input_username))
  limit 1;
$$;

revoke all on function public.get_admin_login_email(text) from public;
grant execute on function public.get_admin_login_email(text) to anon, authenticated;

-- Setelah membuat user admin di Authentication > Users, jalankan contoh ini
-- dengan mengganti email dan username:
-- insert into public.admin_profiles (id, username)
-- select id, 'admin'
-- from auth.users
-- where email = 'email-admin@domain.com';

drop policy if exists "Authenticated users can insert media gallery" on public.media_gallery;
create policy "Authenticated users can insert media gallery"
on public.media_gallery
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update media gallery" on public.media_gallery;
create policy "Authenticated users can update media gallery"
on public.media_gallery
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete media gallery" on public.media_gallery;
create policy "Authenticated users can delete media gallery"
on public.media_gallery
for delete
to authenticated
using (true);
