-- Fix Hacker Arena Schema & RLS
-- Run this in the Supabase SQL Editor

-- 1. Add missing columns to challenges (as fallbacks)
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'arena';

-- 2. Add id column to challenge_participants for easier PostgREST handling
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();

-- 3. Update RLS for challenge_participants
DROP POLICY IF EXISTS "Users can join challenges" ON challenge_participants;
CREATE POLICY "Users can join challenges" ON challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Participants are viewable by everyone" ON challenge_participants;
CREATE POLICY "Participants are viewable by everyone" ON challenge_participants
  FOR SELECT USING (true);

-- 4. Fix potential Course policy collision
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
CREATE POLICY "Courses are viewable by everyone" ON courses FOR SELECT USING (true);
