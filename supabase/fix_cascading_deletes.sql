-- Fix Cascading Deletes for Hacker Arena
-- This script ensures that deleting a problem also removes its associated records.

-- 1. SOLVED_PROBLEMS
-- First, drop the existing constraint if it exists (might need to check the name, but usually it's problem_id_fkey)
ALTER TABLE solved_problems
DROP CONSTRAINT IF EXISTS solved_problems_problem_id_fkey;

ALTER TABLE solved_problems
ADD CONSTRAINT solved_problems_problem_id_fkey
FOREIGN KEY (problem_id)
REFERENCES problems(id)
ON DELETE CASCADE;

-- 2. SUBMISSIONS
ALTER TABLE submissions
DROP CONSTRAINT IF EXISTS submissions_problem_id_fkey;

ALTER TABLE submissions
ADD CONSTRAINT submissions_problem_id_fkey
FOREIGN KEY (problem_id)
REFERENCES problems(id)
ON DELETE CASCADE;

-- 3. ASSIGNMENTS & CHALLENGES (Array Cleanup)
-- We use a trigger to cleanup problem_ids arrays when a problem is deleted.
-- This is implemented in fix_arrays_cleanup.sql

-- 4. CHALLENGE_PARTICIPANTS (solved_problems is JSONB, no FK there)
-- For challenge_participants, we should ideally also cleanup the JSONB solved_problems array.

CREATE OR REPLACE FUNCTION public.cleanup_challenge_solved_problems()
RETURNS TRIGGER AS $$
BEGIN
  -- Cleanup JSONB array in challenge_participants
  -- Note: This is more complex for JSONB, but we can filter the array
  UPDATE challenge_participants
  SET solved_problems = (
    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
    FROM jsonb_array_elements(COALESCE(solved_problems, '[]'::jsonb)) AS elem
    WHERE (elem->>'problemId')::uuid != OLD.id
  )
  WHERE solved_problems @> jsonb_build_array(jsonb_build_object('problemId', OLD.id));

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_cleanup_challenge_solved ON problems;
CREATE TRIGGER trigger_cleanup_challenge_solved
BEFORE DELETE ON problems
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_challenge_solved_problems();
