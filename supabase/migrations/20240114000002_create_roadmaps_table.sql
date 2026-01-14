-- Create roadmaps table if it doesn't exist
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Main Roadmap',
    data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Policy for Public Read Access (Authenticated Users)
DROP POLICY IF EXISTS "Public Read Access" ON roadmaps;
CREATE POLICY "Public Read Access"
ON roadmaps FOR SELECT
TO authenticated
USING (true);

-- Policy for Admin Full Access
DROP POLICY IF EXISTS "Admin Full Access" ON roadmaps;
CREATE POLICY "Admin Full Access"
ON roadmaps FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
