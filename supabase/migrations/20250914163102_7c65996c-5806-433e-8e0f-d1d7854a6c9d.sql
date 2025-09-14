-- Add RLS policy to allow users to view their own plants (regardless of status)
CREATE POLICY "Users can view their own plants" 
ON public.plants 
FOR SELECT 
USING (auth.uid() = user_id);