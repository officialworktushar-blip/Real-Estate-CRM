-- 001_org_provisioning equivalent as a proper Supabase migration.
-- Replaces the handle_new_user trigger so that signups automatically
-- provision an organization and link the profile.

-- 1. Replace the trigger function to auto-provision org + profile.
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
  -- If the profile already has an org, do nothing.
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

  insert into public.profiles (id, full_name, email, org_id)
  values (
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

-- 3. Re-create the trigger (drop + create to handle name differences).
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists handle_new_user on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
