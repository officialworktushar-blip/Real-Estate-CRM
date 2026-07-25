-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'contacted', 'meeting', 'proposal', 'negotiation', 'under_contract', 'closing', 'closed_won', 'closed_lost')),
  value NUMERIC NOT NULL DEFAULT 0 CHECK (value >= 0),
  commission_rate NUMERIC CHECK (commission_rate >= 0 AND commission_rate <= 100),
  commission_amount NUMERIC CHECK (commission_amount >= 0),
  expected_close_date DATE,
  actual_close_date DATE,
  notes TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_deals_organization ON deals(organization_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_client ON deals(client_id);
CREATE INDEX idx_deals_assigned ON deals(assigned_to);
