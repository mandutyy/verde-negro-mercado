-- Create a policy for users to view their own complete profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

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