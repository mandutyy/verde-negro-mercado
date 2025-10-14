-- Fix critical security issues in profiles and plants_public

-- 1. Remove the overly permissive public profiles RLS policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 2. Add a new policy requiring authentication for viewing profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 3. Drop the plants_public view to enforce proper RLS
-- Direct queries to plants table will use existing RLS policies
DROP VIEW IF EXISTS public.plants_public;