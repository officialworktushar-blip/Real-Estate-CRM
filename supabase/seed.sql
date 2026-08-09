-- Oryntal Estate CRM - Seed Data
-- Run with: supabase db seed

-- Note: Users must be created through Supabase Auth first.
-- This seed creates organization and profile data for demo purposes.

INSERT INTO organizations (id, name, slug, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Realty', 'demo-realty', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO subscriptions (org_id, plan, status, current_period_start, current_period_end) VALUES
  ('00000000-0000-0000-0000-000000000001', 'professional', 'active', now(), now() + interval '30 days')
ON CONFLICT (org_id) DO NOTHING;
