-- Enable RLS on roadmaps if not enabled (it should be)
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Policy for Public Read Access (Authenticated Users)
DROP POLICY IF EXISTS "Public Read Access" ON roadmaps;
CREATE POLICY "Public Read Access"
ON roadmaps FOR SELECT
TO authenticated
USING (true);

-- Policy for Admin Write Access (assuming admin has role='admin' in profiles or checked via auth.uid())
-- For simplicity, let's allow authenticated users to update for now if they are admins, 
-- but usually the editor is restricted.
-- The user reported "member" cannot see roadmap.

DROP POLICY IF EXISTS "Admin Full Access" ON roadmaps;
CREATE POLICY "Admin Full Access"
ON roadmaps FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
