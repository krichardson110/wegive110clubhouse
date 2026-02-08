-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create a new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Additionally, create a view that excludes sensitive fields for general use
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  display_name,
  avatar_url,
  bio,
  posts_count,
  comments_count,
  likes_given_count,
  created_at,
  updated_at
FROM public.profiles;
-- Excludes: force_password_change, temp_password_set_at