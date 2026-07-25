-- Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  client_type TEXT NOT NULL DEFAULT 'buyer' CHECK (client_type IN ('buyer', 'seller', 'tenant', 'landlord', 'investor')),
  notes TEXT,
  referred_by UUID REFERENCES clients(id) ON DELETE SET NULL,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  lifetime_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_clients_organization ON clients(organization_id);
CREATE INDEX idx_clients_email ON clients(email);
