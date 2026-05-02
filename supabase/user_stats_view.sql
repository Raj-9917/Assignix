-- ==========================================
-- Dynamic XP & Stats Calculation (View)
-- ==========================================

-- This view dynamically calculates XP and Solve Counts based on the relational solved_problems table.
-- It ensures that stats are always accurate, even if problems are deleted or modified.
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.name,
    COUNT(sp.problem_id) as calculated_problems_solved,
    COALESCE(SUM(
        CASE p.difficulty
            WHEN 'Easy' THEN 10
            WHEN 'Medium' THEN 25
            WHEN 'Hard' THEN 50
            ELSE 10
        END
    ), 0) as calculated_xp,
    ARRAY_AGG(sp.problem_id) FILTER (WHERE sp.problem_id IS NOT NULL) as calculated_solved_array
FROM 
    public.users u
LEFT JOIN 
    public.solved_problems sp ON u.id = sp.user_id
LEFT JOIN 
    public.problems p ON sp.problem_id = p.id
GROUP BY 
    u.id, u.username, u.name;

-- Grant access
GRANT SELECT ON user_stats TO authenticated;
GRANT SELECT ON user_stats TO anon;
