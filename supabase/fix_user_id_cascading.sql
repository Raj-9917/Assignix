-- ==========================================
-- FIX: USER ID CASCADING
-- This script adds ON UPDATE CASCADE to all foreign keys referencing users(id).
-- This allows the handle_new_user trigger to update the ID of a pre-existing 
-- profile when a user finally signs up via Supabase Auth.
-- ==========================================

DO $$ 
BEGIN
    -- 1. friendships
    ALTER TABLE friendships DROP CONSTRAINT IF EXISTS friendships_user_id_fkey;
    ALTER TABLE friendships ADD CONSTRAINT friendships_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    
    ALTER TABLE friendships DROP CONSTRAINT IF EXISTS friendships_friend_id_fkey;
    ALTER TABLE friendships ADD CONSTRAINT friendships_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    -- 1.5. Ensure users.id has a default (for admin provisioning)
    ALTER TABLE users ALTER COLUMN id SET DEFAULT uuid_generate_v4();

    -- 2. friend_requests
    ALTER TABLE friend_requests DROP CONSTRAINT IF EXISTS friend_requests_from_id_fkey;
    ALTER TABLE friend_requests ADD CONSTRAINT friend_requests_from_id_fkey FOREIGN KEY (from_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    
    ALTER TABLE friend_requests DROP CONSTRAINT IF EXISTS friend_requests_to_id_fkey;
    ALTER TABLE friend_requests ADD CONSTRAINT friend_requests_to_id_fkey FOREIGN KEY (to_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    -- 3. notifications
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
    ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    -- 4. courses
    ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_instructor_id_fkey;
    ALTER TABLE courses ADD CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

    -- 5. problems
    ALTER TABLE problems DROP CONSTRAINT IF EXISTS problems_creator_id_fkey;
    ALTER TABLE problems ADD CONSTRAINT problems_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

    -- 6. solved_problems
    ALTER TABLE solved_problems DROP CONSTRAINT IF EXISTS solved_problems_user_id_fkey;
    ALTER TABLE solved_problems ADD CONSTRAINT solved_problems_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    -- 7. classrooms
    ALTER TABLE classrooms DROP CONSTRAINT IF EXISTS classrooms_teacher_id_fkey;
    ALTER TABLE classrooms ADD CONSTRAINT classrooms_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    -- 8. classroom_students
    ALTER TABLE classroom_students DROP CONSTRAINT IF EXISTS classroom_students_student_id_fkey;
    ALTER TABLE classroom_students ADD CONSTRAINT classroom_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    -- 9. submissions
    ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_user_id_fkey;
    ALTER TABLE submissions ADD CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    -- 10. challenges
    ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_created_by_fkey;
    ALTER TABLE challenges ADD CONSTRAINT challenges_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    -- 11. challenge_participants
    ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS challenge_participants_user_id_fkey;
    ALTER TABLE challenge_participants ADD CONSTRAINT challenge_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    -- 12. arena_registrations
    ALTER TABLE arena_registrations DROP CONSTRAINT IF EXISTS arena_registrations_user_id_fkey;
    ALTER TABLE arena_registrations ADD CONSTRAINT arena_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

END $$;
