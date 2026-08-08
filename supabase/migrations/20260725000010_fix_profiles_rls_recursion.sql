-- Fix RLS infinite recursion on profiles (SQLSTATE 42P17)
--
-- The policy "Super admins can manage all profiles" self-referenced the
-- profiles table inside its USING clause:
--
--   USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin'))
--
-- PostgreSQL re-applies RLS to that inner SELECT, which re-evaluates the
-- same policy, which queries profiles again, and so on. Every SELECT from
-- profiles (including the frontend role lookup after login) failed with:
--
--   infinite recursion detected in policy for relation "profiles"
--
-- Fix: move the super-admin check into a SECURITY DEFINER function that runs
-- as the table owner (bypassing RLS for that one read), then call it from the
-- policy instead of self-referencing the table.

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = (SELECT auth.uid())
      AND role = 'super_admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;

CREATE POLICY "Super admins can manage all profiles"
  ON profiles FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
