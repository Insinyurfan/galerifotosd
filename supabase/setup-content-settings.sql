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

create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  updated_at timestamptz not null default now(),
  site_title text not null,
  logo_url text not null default '',
  dashboard_badge text not null,
  dashboard_title text not null,
  dashboard_description text not null,
  school_name text not null,
  school_instagram_url text not null default '',
  school_tiktok_url text not null default '',
  developer_name text not null,
  developer_photo_url text not null default '',
  developer_role text not null,
  developer_intro text not null,
  developer_university text not null,
  developer_instagram_url text not null default '',
  developer_tiktok_url text not null default '',
  developer_facebook_url text not null default ''
);

insert into public.site_settings (
  id,
  site_title,
  dashboard_badge,
  dashboard_title,
  dashboard_description,
  school_name,
  school_instagram_url,
  school_tiktok_url,
  developer_name,
  developer_role,
  developer_intro,
  developer_university,
  developer_instagram_url,
  developer_tiktok_url,
  developer_facebook_url
)
values (
  1,
  'Perpisahan Kelas 6 2026 SDN WANASARI 15',
  'Album Kenangan 2026',
  'Selamat datang di ruang kenangan perpisahan kelas 6.',
  'Setiap foto dan video di sini menyimpan cerita tentang kebersamaan, tawa, dan langkah baru keluarga besar SDN Wanasari 15. Mari melihat kembali momen indah yang akan selalu menjadi bagian dari perjalanan kita.',
  'SDN Wanasari 15',
  'https://www.instagram.com/sdnwanasari15/',
  'https://www.tiktok.com/@sdnwanasari15',
  'Irfan',
  'Developer Website',
  'Halo, saya Irfan, developer di balik website dokumentasi perpisahan ini. Saya juga seorang mahasiswa di Universitas Bani Saleh Bekasi yang senang mengembangkan pengalaman digital agar momen berharga dapat disimpan, ditemukan, dan dikenang dengan lebih mudah.',
  'Universitas Bani Saleh Bekasi',
  'https://www.instagram.com/',
  'https://www.tiktok.com/',
  'https://www.facebook.com/'
)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
using (true);

drop policy if exists "Authenticated users can insert site settings" on public.site_settings;
create policy "Authenticated users can insert site settings"
on public.site_settings
for insert
to authenticated
with check (id = 1);

drop policy if exists "Authenticated users can update site settings" on public.site_settings;
create policy "Authenticated users can update site settings"
on public.site_settings
for update
to authenticated
using (id = 1)
with check (id = 1);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read site assets" on storage.objects;
create policy "Public can read site assets"
on storage.objects
for select
using (bucket_id = 'site-assets');

drop policy if exists "Authenticated users can upload site assets" on storage.objects;
create policy "Authenticated users can upload site assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'site-assets');

drop policy if exists "Authenticated users can update site assets" on storage.objects;
create policy "Authenticated users can update site assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'site-assets')
with check (bucket_id = 'site-assets');

drop policy if exists "Authenticated users can delete site assets" on storage.objects;
create policy "Authenticated users can delete site assets"
on storage.objects
for delete
to authenticated
using (bucket_id = 'site-assets');

notify pgrst, 'reload schema';
