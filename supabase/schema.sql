-- Assignix Supabase PostgreSQL Schema Migration
-- Note: Run this in the Supabase SQL Editor.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE (Extends Supabase Auth)
-- ==========================================
-- Supabase handles auth in `auth.users`, but we need a public profile table.
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  avatar TEXT,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  solved_problems UUID[] DEFAULT '{}',
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "assignments": true, "mentions": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Relationships (Friends & Requests)
CREATE TABLE friendships (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, friend_id)
);

CREATE TABLE friend_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. COURSES & PROBLEMS
-- ==========================================
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL, -- replaces the 'id' string field in mongo
  title TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  thumbnail TEXT DEFAULT 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800',
  color TEXT DEFAULT '#6366f1',
  difficulty TEXT DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  problem_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE problems (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL, -- replaces 'id' string field in mongo
  title TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  category TEXT NOT NULL,
  course TEXT DEFAULT 'General', -- Can be linked to courses.slug
  is_practice BOOLEAN DEFAULT true,
  tags TEXT[], -- array of strings
  description TEXT NOT NULL,
  examples JSONB, -- Array of {input, output, explanation}
  constraints TEXT[], 
  test_cases JSONB, -- Array of {input, expectedOutput, isHidden}
  starter_code JSONB, -- {python, javascript, java, cpp}
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT true,
  is_arena_problem BOOLEAN DEFAULT false,
  hardness_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track Solved Problems
CREATE TABLE solved_problems (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  solved_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, problem_id)
);

-- ==========================================
-- 3. CLASSROOMS
-- ==========================================
CREATE TABLE classrooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE classroom_students (
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (classroom_id, student_id)
);

CREATE TABLE assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_ids UUID[], -- Array of problem UUIDs
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 4. SUBMISSIONS
-- ==========================================
CREATE TABLE submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Accepted', 'Failed', 'Pending', 'Runtime Error', 'Compilation Error')),
  runtime NUMERIC,
  memory NUMERIC,
  test_cases_passed INTEGER DEFAULT 0,
  total_test_cases INTEGER DEFAULT 0,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 5. CHALLENGES (Hacker Arena)
-- ==========================================
CREATE TABLE challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  time_limit INTEGER DEFAULT 60, -- minutes
  problem_ids UUID[], -- Array of problem UUIDs
  status TEXT DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'completed')),
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  room_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE challenge_participants (
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  score INTEGER DEFAULT 0,
  solved_count INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  solved_problems JSONB, -- Array of {problemId, solvedAt, timeTaken}
  PRIMARY KEY (challenge_id, user_id)
);

CREATE TABLE arena_registrations (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, problem_id)
);

-- ==========================================
-- 6. TRIGGERS & RLS (Row Level Security)
-- ==========================================
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_courses_modtime BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_problems_modtime BEFORE UPDATE ON problems FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_classrooms_modtime BEFORE UPDATE ON classrooms FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_challenges_modtime BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
