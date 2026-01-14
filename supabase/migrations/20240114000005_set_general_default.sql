-- Make 'General Member' (is_social_club = FALSE) the default for new signups
ALTER TABLE public.profiles ALTER COLUMN is_social_club SET DEFAULT FALSE;
