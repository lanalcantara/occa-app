-- Add columns for Public Profile and Membership Type
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS contact_info TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS custom_cards JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS is_social_club BOOLEAN DEFAULT TRUE;

-- Enable Storage for Cover Images and Card Images (if not already enabled)
-- Note: You might need to create a bucket named 'public_assets' or similar in Supabase Dashboard.
-- We can add a policy here just in case, assuming 'public_assets' bucket exists or we use 'avatars'.
-- Let's stick to 'avatars' or a new 'public_files' bucket.
