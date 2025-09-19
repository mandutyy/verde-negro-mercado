-- Drop the existing policy that only allows viewing active plants
DROP POLICY IF EXISTS "Anyone can view active plants" ON public.plants;

-- Create new policy that allows viewing both active and reserved plants
CREATE POLICY "Anyone can view active and reserved plants" 
ON public.plants 
FOR SELECT 
USING (status IN ('active', 'reserved'));