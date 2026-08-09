-- Row Level Security Policies

-- Profiles: users can read/update their own, super_admins can manage all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Leads: organization-scoped access
CREATE POLICY "Users can view own org leads"
  ON leads FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own org leads"
  ON leads FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Properties: organization-scoped access
CREATE POLICY "Users can view own org properties"
  ON properties FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own org properties"
  ON properties FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Contacts: organization-scoped access
CREATE POLICY "Users can view own org contacts"
  ON contacts FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own org contacts"
  ON contacts FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Deals: organization-scoped access
CREATE POLICY "Users can view own org deals"
  ON deals FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own org deals"
  ON deals FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Activities: user-specific + org-scoped
CREATE POLICY "Users can view own org activities"
  ON activities FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own activities"
  ON activities FOR ALL
  USING (performed_by = auth.uid());

-- Subscriptions: org-scoped, admin-only management
CREATE POLICY "Users can view own org subscription"
  ON subscriptions FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage subscriptions"
  ON subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Audit logs: admin-only access
CREATE POLICY "Super admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Organizations: members can view, admins can manage
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage organizations"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );
