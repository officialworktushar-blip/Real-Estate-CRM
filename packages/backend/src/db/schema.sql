create extension if not exists "uuid-ossp";

-- Organizations
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Profiles
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  org_id uuid references organizations(id) on delete set null,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'owner', 'super_admin')),
  phone text,
  company text,
  license_number text,
  bio text,
  timezone text default 'America/New_York',
  country text,
  stripe_customer_id text,
  razorpay_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leads
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  source text,
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
  budget numeric,
  notes text,
  assigned_to uuid references profiles(user_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Properties
create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  address text,
  city text,
  state text,
  zip_code text,
  country text default 'US',
  property_type text default 'residential' check (property_type in ('residential', 'commercial', 'land', 'industrial')),
  status text default 'available' check (status in ('available', 'sold', 'rented', 'pending', 'off_market')),
  price numeric,
  bedrooms integer,
  bathrooms numeric,
  area_sqft numeric,
  description text,
  images text[] default '{}',
  assigned_to uuid references profiles(user_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contacts
create table if not exists contacts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  type text default 'buyer' check (type in ('buyer', 'seller', 'tenant', 'landlord', 'investor')),
  notes text,
  assigned_to uuid references profiles(user_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Deals
create table if not exists deals (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  value numeric,
  stage text default 'lead' check (stage in ('lead', 'proposal', 'negotiation', 'contract', 'closed_won', 'closed_lost')),
  property_id uuid references properties(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  expected_close_date date,
  notes text,
  assigned_to uuid references profiles(user_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activities (dashboard calendar)
create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  type text default 'meeting',
  due_date timestamptz,
  completed boolean default false,
  performed_by uuid,
  related_to_id uuid,
  related_to_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subscriptions
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid unique references organizations(id) on delete cascade,
  plan text default 'free' check (plan in ('free', 'starter', 'growth', 'agency')),
  status text default 'active' check (status in ('active', 'trialing', 'past_due', 'canceled', 'cancelled', 'pending')),
  billing_provider text default 'razorpay',
  amount integer,
  currency text default 'INR',
  stripe_subscription_id text,
  razorpay_subscription_id text,
  current_period_start timestamptz default now(),
  current_period_end timestamptz default now() + interval '30 days',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Payments ledger (Razorpay orders / payment attempts; amounts in paise)
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  plan text not null check (plan in ('starter', 'growth', 'agency')),
  amount integer not null,
  currency text not null default 'INR',
  billing_provider text not null default 'razorpay',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text not null default 'created' check (status in ('created', 'pending', 'succeeded', 'failed', 'refunded')),
  created_at timestamptz default now(),
  paid_at timestamptz,
  updated_at timestamptz default now()
);

-- Admin Log
create table if not exists admin_logs (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  admin_id uuid,
  action text not null,
  target_type text,
  target_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_profiles_user_id on profiles(user_id);
create index if not exists idx_profiles_org_id on profiles(org_id);
create index if not exists idx_leads_org_id on leads(org_id);
create index if not exists idx_properties_org_id on properties(org_id);
create index if not exists idx_contacts_org_id on contacts(org_id);
create index if not exists idx_deals_org_id on deals(org_id);
create index if not exists idx_activities_org_id on activities(org_id);
create index if not exists idx_activities_due_date on activities(due_date);
create index if not exists idx_subscriptions_org_id on subscriptions(org_id);
create index if not exists idx_admin_logs_org_id on admin_logs(org_id);

-- Row Level Security
alter table leads enable row level security;
alter table properties enable row level security;
alter table contacts enable row level security;
alter table deals enable row level security;
alter table activities enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;

-- On new auth user: provision an organization and link the profile to it.
-- Idempotent so re-running (or legacy triggers) never create duplicate orgs.
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
