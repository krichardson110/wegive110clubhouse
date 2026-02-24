
-- Create a table to store granular permissions for admin users
CREATE TABLE public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  permission text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  granted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all permissions
CREATE POLICY "Super admins can manage permissions"
ON public.admin_permissions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Users can view their own permissions
CREATE POLICY "Users can view own permissions"
ON public.admin_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Create a security definer function to check permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Super admins always have all permissions
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = 'super_admin') THEN true
    WHEN EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = _user_id AND permission = _permission AND enabled = true) THEN true
    ELSE false
  END
$$;
