-- Cleanup broken problem references in assignments and challenges
-- This function removes a problem_id from UUID arrays when that problem is deleted.

CREATE OR REPLACE FUNCTION public.cleanup_problem_references()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove deleted problem_id from assignments.problem_ids
  UPDATE assignments
  SET problem_ids = array_remove(problem_ids, OLD.id)
  WHERE OLD.id = ANY(problem_ids);

  -- Remove deleted problem_id from challenges.problem_ids
  UPDATE challenges
  SET problem_ids = array_remove(problem_ids, OLD.id)
  WHERE OLD.id = ANY(problem_ids);

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the problems table
DROP TRIGGER IF EXISTS trigger_cleanup_problem_refs ON problems;
CREATE TRIGGER trigger_cleanup_problem_refs
BEFORE DELETE ON problems
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_problem_references();
