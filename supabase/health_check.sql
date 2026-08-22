-- ==============================================================================
-- SUPABASE HEALTH CHECK & KEEP-ALIVE SQL DEFINITION
-- ==============================================================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
--
-- This creates a lightweight RPC function that can be called via REST API:
-- GET /rest/v1/rpc/health_check
-- or supabase.rpc('health_check')

-- 1. Create the health_check stored function
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  user_count int := 0;
BEGIN
  -- Perform a fast index check to ensure Postgres worker processes are warm
  SELECT count(*) INTO user_count FROM (SELECT id FROM public.users LIMIT 5) AS sub;

  result := json_build_object(
    'status', 'healthy',
    'message', 'Supabase PostgreSQL database is online and active',
    'timestamp', now(),
    'db_version', version(),
    'sample_user_records_checked', user_count
  );

  RETURN result;
END;
$$;

-- 2. Grant execution permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.health_check() TO anon;
GRANT EXECUTE ON FUNCTION public.health_check() TO authenticated;
GRANT EXECUTE ON FUNCTION public.health_check() TO service_role;

-- ==============================================================================
-- OPTIONAL: INTERNAL DB CRON (If pg_cron extension is enabled on Supabase)
-- ==============================================================================
-- If your Supabase plan has pg_cron enabled in Database -> Extensions:
--
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
--
-- -- Schedule a keepalive ping every 15 minutes
-- SELECT cron.schedule(
--   'keepalive-every-15-min',
--   '*/15 * * * *',
--   $$ SELECT public.health_check(); $$
-- );
-- ==============================================================================
