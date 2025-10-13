-- Create function to allow users to delete their own account
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete the user from auth.users (this will cascade to all related tables)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;