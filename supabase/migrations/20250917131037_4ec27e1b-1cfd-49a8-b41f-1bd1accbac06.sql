-- Fix security issue: Restrict profiles table access to authenticated users only

-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create a new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- This ensures that:
-- 1. Only authenticated users can view profiles
-- 2. Unauthenticated/public users cannot access any profile data
-- 3. Existing functionality for authenticated users remains intact