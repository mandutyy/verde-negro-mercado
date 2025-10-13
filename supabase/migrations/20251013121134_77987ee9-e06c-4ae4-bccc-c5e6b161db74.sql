-- Improve delete_user function with logging and transaction wrapper
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_deleted_at timestamp;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  v_deleted_at := now();
  
  -- Validate user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to delete account';
  END IF;
  
  -- Log the deletion attempt (before deletion for audit trail)
  RAISE LOG 'User account deletion initiated: user_id=%, timestamp=%', v_user_id, v_deleted_at;
  
  -- Delete the user from auth.users (CASCADE will handle related tables)
  -- This is wrapped in an implicit transaction by the function
  DELETE FROM auth.users WHERE id = v_user_id;
  
  -- Log successful deletion
  RAISE LOG 'User account deleted successfully: user_id=%, timestamp=%', v_user_id, v_deleted_at;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    RAISE LOG 'User account deletion failed: user_id=%, error=%, timestamp=%', v_user_id, SQLERRM, v_deleted_at;
    -- Re-raise the exception
    RAISE;
END;
$$;

-- Create a view for public plant listings that hides user_id
CREATE OR REPLACE VIEW public.plants_public AS
SELECT 
  id,
  title,
  description,
  price,
  category,
  sale_type,
  exchange_for,
  location,
  images,
  status,
  views_count,
  favorites_count,
  created_at,
  updated_at
FROM public.plants
WHERE status IN ('active', 'reserved');

-- Grant select permission on the view to anonymous users
GRANT SELECT ON public.plants_public TO anon;
GRANT SELECT ON public.plants_public TO authenticated;

COMMENT ON VIEW public.plants_public IS 'Public view of plant listings that excludes user_id to prevent tracking sellers';
COMMENT ON FUNCTION public.delete_user() IS 'Allows authenticated users to delete their own account with audit logging. Relies on CASCADE constraints for data cleanup.';