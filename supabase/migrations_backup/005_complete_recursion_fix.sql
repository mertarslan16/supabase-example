-- Complete fix for infinite recursion in workspace_members policies
-- Problem: INSERT/UPDATE/DELETE policies query workspace_members, triggering SELECT policy = recursion
-- Solution: Use a security definer function that bypasses RLS

-- Create a function to check if user is admin/owner (bypasses RLS)
CREATE OR REPLACE FUNCTION is_workspace_admin(workspace_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = user_uuid
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "workspace_members_select" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_update" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON workspace_members;

-- Recreate policies using the security definer function
CREATE POLICY "workspace_members_select"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    is_workspace_admin(workspace_id, auth.uid())
  );

CREATE POLICY "workspace_members_insert"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    is_workspace_admin(workspace_id, auth.uid())
  );

CREATE POLICY "workspace_members_update"
  ON workspace_members FOR UPDATE
  TO authenticated
  USING (
    is_workspace_admin(workspace_id, auth.uid())
  );

CREATE POLICY "workspace_members_delete"
  ON workspace_members FOR DELETE
  TO authenticated
  USING (
    is_workspace_admin(workspace_id, auth.uid())
  );
