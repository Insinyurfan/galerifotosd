# Galeri Media React, Tailwind, Supabase

Website galeri foto dan video dengan kategori `Kamera`, `iPhone`, dan `Drone`. Data media disimpan di Supabase, sedangkan file media bisa tetap berada di Google Drive.

## Setup Awal

1. Install dependency:

```bash
npm.cmd install
```

2. Buat file `.env` dari contoh:

```bash
cp .env.example .env
```

Isi dengan nilai dari Supabase Project Settings > API:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
VITE_ADMIN_USERNAME=Irfan
VITE_ADMIN_EMAIL=irfan@admin.local
VITE_GOOGLE_DRIVE_API_KEY=your-google-drive-api-key
```

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai di server atau Vercel Environment Variables. Jangan masukkan key ini ke kode frontend.

3. Jalankan query SQL di Supabase SQL Editor:

File query tersedia di `supabase/schema.sql`.

4. Buat akun admin pertama:

Di Supabase Dashboard, buka Authentication > Users, lalu tambahkan user admin dengan email dan password.

Setelah user dibuat, jalankan query ini di SQL Editor untuk membuat username login:

```sql
insert into public.admin_profiles (id, username)
select id, 'admin'
from auth.users
where email = 'email-admin@domain.com';
```

Ganti `admin` dengan username yang diinginkan dan ganti email sesuai email user Auth. Di halaman website, admin cukup login dengan username dan password.

Setelah admin pertama berhasil login, akun admin berikutnya bisa ditambah, diedit, diganti password, atau dihapus dari panel `Kelola Akun Admin` di halaman `/admin`. Fitur ini membutuhkan `SUPABASE_SERVICE_ROLE_KEY` di environment server/deploy.

5. Aktifkan import folder Google Drive:

Buat API key di Google Cloud Console, aktifkan Google Drive API, lalu isi:

```env
VITE_GOOGLE_DRIVE_API_KEY=your-google-drive-api-key
```

Folder dan file Google Drive perlu disetel `Anyone with the link`. Setelah itu buka `/admin`, tempel link folder utama, lalu klik `Import Semua`.

6. Jalankan lokal:

```bash
npm.cmd run dev
```

## Format Link Google Drive

Pastikan file Google Drive bisa diakses publik: `Anyone with the link`.

Jika link asli seperti ini:

```text
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

Format direct link:

```text
https://drive.google.com/uc?export=view&id=FILE_ID
```

Untuk video, website akan otomatis memakai mode preview Google Drive jika menemukan `FILE_ID`.
