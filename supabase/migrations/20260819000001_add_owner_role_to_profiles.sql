-- Add 'owner' to the allowed roles so ensure-org can assign it.
-- The original CHECK only allowed ('user', 'super_admin').

ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'owner', 'super_admin'));
