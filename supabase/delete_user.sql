-- Implementation of administrative user deletion
-- This function deletes a user from both auth.users and public.users (via cascade)
-- Run this in the Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.delete_user_v2(user_id UUID)
RETURNS void AS $$
DECLARE
  caller_id UUID;
  caller_role TEXT;
BEGIN
  -- Get the ID of the user calling this function
  caller_id := auth.uid();
  
  -- Check if the caller is an admin
  SELECT role INTO caller_role FROM public.users WHERE id = caller_id;
  
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;

  -- Prevent admin from deleting themselves (optional safety check)
  IF caller_id = user_id THEN
    RAISE EXCEPTION 'Self-deletion is not allowed via this function';
  END IF;

  -- Delete from auth.users. 
  -- This will cascade to public.users if the foreign key is set to ON DELETE CASCADE.
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users (RLS check is inside the function)
GRANT EXECUTE ON FUNCTION public.delete_user_v2(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_v2(UUID) TO service_role;
