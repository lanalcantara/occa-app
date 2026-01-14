-- Allow public read access to profiles so Public Profile Pages work for everyone
-- This is necessary for /member/[id] to function for visitors and other members

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );
