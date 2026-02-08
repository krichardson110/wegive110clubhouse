-- Drop the overly permissive token policy
DROP POLICY IF EXISTS "Authenticated users can view invitation by token" ON public.team_invitations;