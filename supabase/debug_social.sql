-- DEBUG FIX FOR SOCIAL SYSTEM
-- This script adds a RAISE EXCEPTION to help catch where it fails

CREATE OR REPLACE FUNCTION notify_on_friend_request()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- DEBUG: Confirm trigger reached
    -- RAISE EXCEPTION 'DEBUG: notify_on_friend_request called for from=% to=%', NEW.from_id, NEW.to_id;

    SELECT COALESCE(name, username, 'Someone') INTO sender_name FROM public.users WHERE id = NEW.from_id;
    
    -- If sender_name is STILL null, it means the user record was NOT found
    IF sender_name IS NULL THEN
        RAISE EXCEPTION 'DEBUG: User record not found for from_id=%', NEW.from_id;
    END IF;

    -- Insert notification for the receiver
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        NEW.to_id,
        'New Friend Request',
        COALESCE(sender_name, 'Someone') || ' sent you a friend request!',
        'info'
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- If we catch an error, RAISE it so we can see it in the 400 response
    RAISE EXCEPTION 'Social System Error: % (at trigger notify_on_friend_request)', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
