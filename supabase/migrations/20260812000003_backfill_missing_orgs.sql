-- 002_backfill_missing_orgs.sql
-- Run against the DEPLOYED Supabase database to backfill organizations
-- for all existing users whose profiles have org_id = null.
-- Idempotent: safe to run more than once.
-- NOTE: profiles.id IS the auth user UUID (no separate user_id column).

DO $$
DECLARE
  rec RECORD;
  org_name text;
  new_org_id uuid;
BEGIN
  FOR rec IN
    SELECT p.id AS profile_id, p.full_name, p.email
    FROM profiles p
    WHERE p.org_id IS NULL
  LOOP
    org_name := coalesce(
      nullif(rec.full_name, ''),
      split_part(coalesce(rec.email, 'user_' || rec.profile_id::text), '@', 1),
      'My Organization'
    );

    INSERT INTO organizations (name, slug)
    VALUES (
      org_name,
      lower(regexp_replace(org_name, '[^a-z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 8)
    )
    RETURNING id INTO new_org_id;

    UPDATE profiles
    SET org_id = new_org_id,
        updated_at = now()
    WHERE profiles.id = rec.profile_id;
  END LOOP;
END $$;
