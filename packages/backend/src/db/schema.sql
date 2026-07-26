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
  organization_id uuid references organizations(id) on delete set null,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'super_admin')),
  stripe_customer_id text,
  razorpay_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leads
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
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
  organization_id uuid not null references organizations(id) on delete cascade,
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

-- Clients
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
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
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  value numeric,
  stage text default 'lead' check (stage in ('lead', 'proposal', 'negotiation', 'contract', 'closed_won', 'closed_lost')),
  property_id uuid references properties(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  expected_close_date date,
  notes text,
  assigned_to uuid references profiles(user_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Calendar Events
create table if not exists calendar_events (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  event_type text default 'meeting' check (event_type in ('meeting', 'showing', 'follow_up', 'deadline', 'other')),
  start_time timestamptz not null,
  end_time timestamptz not null,
  location text,
  lead_id uuid references leads(id) on delete set null,
  property_id uuid references properties(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  assigned_to uuid references profiles(user_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subscriptions
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  plan text default 'free' check (plan in ('free', 'starter', 'professional', 'enterprise')),
  status text default 'active' check (status in ('active', 'past_due', 'cancelled', 'pending')),
  stripe_subscription_id text,
  razorpay_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Audit Log
create table if not exists audit_log (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_profiles_user_id on profiles(user_id);
create index if not exists idx_profiles_organization_id on profiles(organization_id);
create index if not exists idx_leads_organization_id on leads(organization_id);
create index if not exists idx_properties_organization_id on properties(organization_id);
create index if not exists idx_clients_organization_id on clients(organization_id);
create index if not exists idx_deals_organization_id on deals(organization_id);
create index if not exists idx_calendar_events_organization_id on calendar_events(organization_id);
create index if not exists idx_calendar_events_time on calendar_events(start_time, end_time);
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);
create index if not exists idx_audit_log_organization_id on audit_log(organization_id);

-- Row Level Security
alter table leads enable row level security;
alter table properties enable row level security;
alter table clients enable row level security;
alter table deals enable row level security;
alter table calendar_events enable row level security;
alter table subscriptions enable row level security;
