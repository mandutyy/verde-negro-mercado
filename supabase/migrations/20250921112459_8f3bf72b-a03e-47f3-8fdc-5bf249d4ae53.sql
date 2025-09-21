-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;