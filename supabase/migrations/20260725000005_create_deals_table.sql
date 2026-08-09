-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'proposal', 'negotiation', 'contract', 'closed_won', 'closed_lost')),
  value NUMERIC NOT NULL DEFAULT 0 CHECK (value >= 0),
  expected_close_date DATE,
  actual_close_date DATE,
  notes TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_deals_organization ON deals(org_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_lead ON deals(lead_id);
CREATE INDEX idx_deals_assigned ON deals(assigned_to);
