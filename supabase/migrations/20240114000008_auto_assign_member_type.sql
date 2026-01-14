-- Create or Replace the function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_social BOOLEAN;
  user_role public.user_role; 
  -- Assuming user_role enum exists (admin, user). If it fails, we fall back to text.
  -- But we know 'user' and 'admin' are valid.
BEGIN
  -- 1. Determine Social Club Status based on Email Domain
  IF new.email LIKE '%@occa.com' THEN
    is_social := TRUE;
  ELSIF new.email LIKE '%@membro.com' THEN
    is_social := FALSE;
  ELSE
    -- Default for others (e.g. gmail)
    -- Per previous migration, default is FALSE (General Member)
    is_social := FALSE;
  END IF;

  -- 2. Insert into profiles
  -- We prioritize metadata role if present (for manual admin creation), otherwise default to 'user'
  INSERT INTO public.profiles (id, full_name, avatar_url, role, is_social_club, points, category)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
    is_social,
    0, -- Default points
    'Membro OCCA' -- Default Category
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger to ensure it uses the updating function (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RETROACTIVE FIX: Update existing users based on email
-- This ensures test@membro.com (already created) gets fixed immediately
UPDATE public.profiles
SET is_social_club = FALSE
WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@membro.com'
);

UPDATE public.profiles
SET is_social_club = TRUE
WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@occa.com'
);
