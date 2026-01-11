-- ÖNCELİKLE TÜM POLİCY'LERİ KALDIR
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owners can update their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owners can delete their workspaces" ON workspaces;

DROP POLICY IF EXISTS "Users can view members of their workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Admins and owners can add members" ON workspace_members;
DROP POLICY IF EXISTS "Admins and owners can update members" ON workspace_members;
DROP POLICY IF EXISTS "Admins and owners can delete members" ON workspace_members;

DROP POLICY IF EXISTS "Users can view invites for their workspaces" ON workspace_invites;
DROP POLICY IF EXISTS "Admins can create invites" ON workspace_invites;

DROP POLICY IF EXISTS "Users can view meetings in their workspaces" ON meetings;
DROP POLICY IF EXISTS "Users can create meetings in their workspaces" ON meetings;
DROP POLICY IF EXISTS "Creators can update their meetings" ON meetings;
DROP POLICY IF EXISTS "Creators can delete their meetings" ON meetings;

DROP POLICY IF EXISTS "Users can view participants of meetings in their workspaces" ON meeting_participants;
DROP POLICY IF EXISTS "Meeting creators can add participants" ON meeting_participants;
DROP POLICY IF EXISTS "Users can update their own participation status" ON meeting_participants;

DROP POLICY IF EXISTS "Users can view templates in their workspaces" ON email_templates;
DROP POLICY IF EXISTS "Users can create templates in their workspaces" ON email_templates;
DROP POLICY IF EXISTS "Creators can update their templates" ON email_templates;
DROP POLICY IF EXISTS "Creators can delete their templates" ON email_templates;

-- RLS'yi kapat
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;

-- RLS'yi tekrar aç
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- WORKSPACE_MEMBERS POLİCY'LERİ (ÖNCELİKLE BU - TEMEL TABLO)
CREATE POLICY "workspace_members_select"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "workspace_members_insert"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members existing
      WHERE existing.workspace_id = workspace_members.workspace_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "workspace_members_update"
  ON workspace_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members existing
      WHERE existing.workspace_id = workspace_members.workspace_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "workspace_members_delete"
  ON workspace_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members existing
      WHERE existing.workspace_id = workspace_members.workspace_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    )
  );

-- WORKSPACES POLİCY'LERİ
CREATE POLICY "workspaces_select"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "workspaces_insert"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete"
  ON workspaces FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- WORKSPACE_INVITES POLİCY'LERİ
CREATE POLICY "workspace_invites_select"
  ON workspace_invites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_invites.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "workspace_invites_insert"
  ON workspace_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_invites.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- MEETINGS POLİCY'LERİ
CREATE POLICY "meetings_select"
  ON meetings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = meetings.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "meetings_insert"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = meetings.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "meetings_update"
  ON meetings FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "meetings_delete"
  ON meetings FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- MEETING_PARTICIPANTS POLİCY'LERİ
CREATE POLICY "meeting_participants_select"
  ON meeting_participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM meetings
      JOIN workspace_members ON workspace_members.workspace_id = meetings.workspace_id
      WHERE meetings.id = meeting_participants.meeting_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "meeting_participants_insert"
  ON meeting_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_participants.meeting_id
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "meeting_participants_update"
  ON meeting_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- EMAIL_TEMPLATES POLİCY'LERİ
CREATE POLICY "email_templates_select"
  ON email_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = email_templates.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "email_templates_insert"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = email_templates.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "email_templates_update"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "email_templates_delete"
  ON email_templates FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
