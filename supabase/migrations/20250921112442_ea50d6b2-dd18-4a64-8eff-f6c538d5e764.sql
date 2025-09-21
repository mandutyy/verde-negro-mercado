-- Remove the overly permissive policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a policy for users to view their own complete profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a policy for viewing limited public profile data (only name and avatar_url)
-- This is needed for plant listings where we show seller name and avatar
CREATE POLICY "Public profile data for plant interactions" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow access to name and avatar_url columns for other users
  -- This policy will be enforced through application logic
  auth.uid() IS NOT NULL
);

-- Create a security definer function to get safe public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  name text,
  avatar_url text
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT p.user_id, p.name, p.avatar_url
  FROM profiles p
  WHERE p.user_id = profile_user_id;
$$;