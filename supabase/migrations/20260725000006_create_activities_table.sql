-- Create activities table (backs the dashboard calendar)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'meeting',
  due_date TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_to_id UUID,
  related_to_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_activities_performed_by ON activities(performed_by);
CREATE INDEX idx_activities_due_date ON activities(due_date);
CREATE INDEX idx_activities_organization ON activities(org_id);
