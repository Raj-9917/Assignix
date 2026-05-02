-- ==========================================
-- Server-Side Unique Code Generation (RPC)
-- ==========================================

-- Function to generate a unique 6-character classroom code
CREATE OR REPLACE FUNCTION generate_unique_classroom_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    exists_already BOOLEAN;
BEGIN
    LOOP
        -- Generate 6-character alphanumeric code using MD5 and RANDOM
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
        
        -- Check if it exists in classrooms
        SELECT EXISTS (SELECT 1 FROM public.classrooms WHERE code = new_code) INTO exists_already;
        
        -- Exit loop if unique
        IF NOT exists_already THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate a unique 6-character challenge room code
CREATE OR REPLACE FUNCTION generate_unique_challenge_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    exists_already BOOLEAN;
BEGIN
    LOOP
        -- Generate 6-character alphanumeric code
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
        
        -- Check if it exists in challenges
        SELECT EXISTS (SELECT 1 FROM public.challenges WHERE room_code = new_code) INTO exists_already;
        
        -- Exit loop if unique
        IF NOT exists_already THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate a unique problem slug from title
CREATE OR REPLACE FUNCTION generate_unique_problem_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- 1. Create base slug
    base_slug := LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := REGEXP_REPLACE(base_slug, '^-|-$', '', 'g');
    
    final_slug := base_slug;

    -- 2. Loop until unique
    LOOP
        IF NOT EXISTS (SELECT 1 FROM public.problems WHERE slug = final_slug) THEN
            RETURN final_slug;
        END IF;
        
        counter := counter + 1;
        -- Use a random-ish suffix or just a counter
        final_slug := base_slug || '-' || counter::TEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access
GRANT EXECUTE ON FUNCTION generate_unique_problem_slug(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_unique_problem_slug(TEXT) TO anon;

