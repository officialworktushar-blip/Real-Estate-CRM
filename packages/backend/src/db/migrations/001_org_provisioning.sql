-- 001_org_provisioning.sql
-- Run against the DEPLOYED Supabase database (SQL editor) to:
--   replace handle_new_user so signups provision an organization + linked profile
-- Idempotent: safe to run more than once.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org_name text;
  new_org_id uuid;
begin
  if exists (select 1 from public.profiles where id = new.id and org_id is not null) then
    return new;
  end if;

  org_name := coalesce(
    nullif(new.raw_user_meta_data->>'company', ''),
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    split_part(coalesce(new.email, 'user_' || new.id::text), '@', 1)
  );

  insert into public.organizations (name, slug)
  values (
    org_name,
    lower(regexp_replace(org_name, '[^a-z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 8)
  )
  returning id into new_org_id;

  insert into public.profiles (id, full_name, email, org_id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    new_org_id,
    'owner'
  )
  on conflict (id) do update
    set org_id = excluded.org_id,
        email  = excluded.email,
        role   = case when profiles.role in ('user', 'member') then 'owner' else profiles.role end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists handle_new_user on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
