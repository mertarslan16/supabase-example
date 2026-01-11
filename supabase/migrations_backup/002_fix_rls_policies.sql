-- Önce mevcut policy'leri kaldır
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Admins and owners can add members" ON workspace_members;
DROP POLICY IF EXISTS "Admins and owners can update members" ON workspace_members;
DROP POLICY IF EXISTS "Admins and owners can delete members" ON workspace_members;

DROP POLICY IF EXISTS "Users can view invites for their workspaces" ON workspace_invites;
DROP POLICY IF EXISTS "Admins can create invites" ON workspace_invites;

DROP POLICY IF EXISTS "Users can view meetings in their workspaces" ON meetings;
DROP POLICY IF EXISTS "Users can create meetings in their workspaces" ON meetings;

DROP POLICY IF EXISTS "Users can view participants of meetings in their workspaces" ON meeting_participants;
DROP POLICY IF EXISTS "Meeting creators can add participants" ON meeting_participants;

DROP POLICY IF EXISTS "Users can view templates in their workspaces" ON email_templates;
DROP POLICY IF EXISTS "Users can create templates in their workspaces" ON email_templates;

-- Workspace members için güvenli RLS policies
CREATE POLICY "Users can view members of their workspaces"
  ON workspace_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    workspace_id IN (
      SELECT wm.workspace_id
      FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and owners can add members"
  ON workspace_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins and owners can update members"
  ON workspace_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins and owners can delete members"
  ON workspace_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Workspace invites için düzeltilmiş policies
CREATE POLICY "Users can view invites for their workspaces"
  ON workspace_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_invites.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create invites"
  ON workspace_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_invites.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Meetings için düzeltilmiş policies
CREATE POLICY "Users can view meetings in their workspaces"
  ON meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = meetings.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create meetings in their workspaces"
  ON meetings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = meetings.workspace_id
      AND wm.user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

-- Meeting participants için düzeltilmiş policies
CREATE POLICY "Users can view participants of meetings in their workspaces"
  ON meeting_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings m
      JOIN workspace_members wm ON wm.workspace_id = m.workspace_id
      WHERE m.id = meeting_participants.meeting_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Meeting creators can add participants"
  ON meeting_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_participants.meeting_id
      AND m.created_by = auth.uid()
    )
  );

-- Email templates için düzeltilmiş policies
CREATE POLICY "Users can view templates in their workspaces"
  ON email_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = email_templates.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates in their workspaces"
  ON email_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = email_templates.workspace_id
      AND wm.user_id = auth.uid()
    ) AND created_by = auth.uid()
  );
