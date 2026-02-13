-- Drop the existing overly-permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create policy: users can view their own full profile
CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy: admins can view all full profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_super_admin() OR is_admin());

-- Grant SELECT on the profiles_public view (which excludes sensitive fields) for viewing other users
-- The profiles_public view already excludes force_password_change and temp_password_set_at
-- Other users should query profiles_public view or use explicit column selection
