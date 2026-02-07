-- Add force_password_change flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false;

-- Add temp_password_set_at to track when coach set the password
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS temp_password_set_at TIMESTAMP WITH TIME ZONE;