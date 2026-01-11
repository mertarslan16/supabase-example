-- Fix infinite recursion in workspace_members policies
-- The issue: SELECT policy only allows seeing own memberships,
-- but INSERT/UPDATE/DELETE policies need to check other members' roles

-- Drop the problematic SELECT policy
DROP POLICY IF EXISTS "workspace_members_select" ON workspace_members;

-- Create a new SELECT policy that allows seeing all members in workspaces you belong to
CREATE POLICY "workspace_members_select"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (
    -- Allow seeing your own memberships
    user_id = auth.uid()
    OR
    -- Allow seeing other members in workspaces where you are a member
    workspace_id IN (
      SELECT wm.workspace_id
      FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  );
