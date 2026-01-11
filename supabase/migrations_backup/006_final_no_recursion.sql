-- FINAL FIX: Complete elimination of infinite recursion
-- Problem: Multiple policies querying workspace_members create circular dependencies
-- Solution: Use SECURITY DEFINER functions for ALL workspace membership checks

-- Drop all existing workspace-related policies
DROP POLICY IF EXISTS "workspaces_select" ON workspaces;
DROP POLICY IF EXISTS "workspaces_insert" ON workspaces;
DROP POLICY IF EXISTS "workspaces_update" ON workspaces;
DROP POLICY IF EXISTS "workspaces_delete" ON workspaces;

DROP POLICY IF EXISTS "workspace_invites_select" ON workspace_invites;
DROP POLICY IF EXISTS "workspace_invites_insert" ON workspace_invites;

DROP POLICY IF EXISTS "meetings_select" ON meetings;
DROP POLICY IF EXISTS "meetings_insert" ON meetings;
DROP POLICY IF EXISTS "meetings_update" ON meetings;
DROP POLICY IF EXISTS "meetings_delete" ON meetings;

DROP POLICY IF EXISTS "meeting_participants_select" ON meeting_participants;
DROP POLICY IF EXISTS "meeting_participants_insert" ON meeting_participants;
DROP POLICY IF EXISTS "meeting_participants_update" ON meeting_participants;

DROP POLICY IF EXISTS "email_templates_select" ON email_templates;
DROP POLICY IF EXISTS "email_templates_insert" ON email_templates;
DROP POLICY IF EXISTS "email_templates_update" ON email_templates;
DROP POLICY IF EXISTS "email_templates_delete" ON email_templates;

-- Create helper function to check if user is a member of a workspace (bypasses RLS)
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate WORKSPACES policies with security definer function
CREATE POLICY "workspaces_select"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    is_workspace_member(id, auth.uid())
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

-- Recreate WORKSPACE_INVITES policies
CREATE POLICY "workspace_invites_select"
  ON workspace_invites FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "workspace_invites_insert"
  ON workspace_invites FOR INSERT
  TO authenticated
  WITH CHECK (is_workspace_admin(workspace_id, auth.uid()));

-- Recreate MEETINGS policies
CREATE POLICY "meetings_select"
  ON meetings FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "meetings_insert"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "meetings_update"
  ON meetings FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "meetings_delete"
  ON meetings FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Recreate MEETING_PARTICIPANTS policies
CREATE POLICY "meeting_participants_select"
  ON meeting_participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_participants.meeting_id
      AND is_workspace_member(meetings.workspace_id, auth.uid())
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

-- Recreate EMAIL_TEMPLATES policies
CREATE POLICY "email_templates_select"
  ON email_templates FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "email_templates_insert"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "email_templates_update"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "email_templates_delete"
  ON email_templates FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
