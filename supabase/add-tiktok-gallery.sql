create extension if not exists "pgcrypto";

create table if not exists public.tiktok_gallery (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  description text,
  tiktok_url text not null,
  constraint tiktok_gallery_url_format check (tiktok_url ~ '^https?://([A-Za-z0-9-]+\.)*tiktok\.com/')
);

alter table public.tiktok_gallery enable row level security;

drop policy if exists "Public can read tiktok gallery" on public.tiktok_gallery;
create policy "Public can read tiktok gallery"
on public.tiktok_gallery
for select
using (true);

drop policy if exists "Authenticated users can insert tiktok gallery" on public.tiktok_gallery;
create policy "Authenticated users can insert tiktok gallery"
on public.tiktok_gallery
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update tiktok gallery" on public.tiktok_gallery;
create policy "Authenticated users can update tiktok gallery"
on public.tiktok_gallery
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete tiktok gallery" on public.tiktok_gallery;
create policy "Authenticated users can delete tiktok gallery"
on public.tiktok_gallery
for delete
to authenticated
using (true);
