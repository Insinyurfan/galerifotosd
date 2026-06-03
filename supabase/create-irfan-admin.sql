insert into public.admin_profiles (id, username)
select id, 'Irfan'
from auth.users
where email = 'irfan@admin.local'
on conflict (id) do update
set username = excluded.username;
