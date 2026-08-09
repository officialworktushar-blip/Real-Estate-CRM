-- 001_org_provisioning.sql
-- Run against the DEPLOYED Supabase database (SQL editor) to:
--   1) add organizations.owner_id
--   2) replace handle_new_user so signups provision an organization + linked profile
-- Idempotent: safe to run more than once.

alter table organizations add column if not exists owner_id uuid references auth.users(id) on delete set null;

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

  insert into public.organizations (name, slug, owner_id)
  values (
    org_name,
    lower(regexp_replace(org_name, '[^a-z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 8),
    new.id
  )
  returning id into new_org_id;

  insert into public.profiles (id, user_id, full_name, email, org_id)
  values (
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    new_org_id
  )
  on conflict (id) do update
    set org_id = excluded.org_id, email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists handle_new_user on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
