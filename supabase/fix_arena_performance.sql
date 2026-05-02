-- ==========================================
-- Arena Performance Optimization
-- ==========================================

-- RPC to get submission counts grouped by problem
-- This prevents the client from fetching thousands of rows
CREATE OR REPLACE FUNCTION get_arena_submission_counts()
RETURNS TABLE (
    problem_id UUID,
    submission_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.problem_id,
        COUNT(*)::BIGINT as submission_count
    FROM 
        public.submissions s
    GROUP BY 
        s.problem_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_arena_submission_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_arena_submission_counts() TO anon;
