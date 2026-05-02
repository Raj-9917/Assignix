-- Fix Friends and Notifications logic
-- This script adds triggers to automatically create notifications for friend requests

-- 1. Function to create notification on friend request
CREATE OR REPLACE FUNCTION notify_on_friend_request()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- Get sender name or fallback to username
    SELECT COALESCE(name, username) INTO sender_name FROM users WHERE id = NEW.from_id;
    
    -- Insert notification for the receiver
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        NEW.to_id,
        'New Friend Request',
        COALESCE(sender_name, 'Someone') || ' sent you a friend request!',
        'info'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for friend request
DROP TRIGGER IF EXISTS tr_notify_on_friend_request ON friend_requests;
CREATE TRIGGER tr_notify_on_friend_request
AFTER INSERT ON friend_requests
FOR EACH ROW EXECUTE FUNCTION notify_on_friend_request();

-- 3. Function to create notification on friendship acceptance
CREATE OR REPLACE FUNCTION notify_on_friendship_accepted()
RETURNS TRIGGER AS $$
DECLARE
    receiver_name TEXT;
BEGIN
    -- Get receiver name (the one who accepted) or fallback to username
    SELECT COALESCE(name, username) INTO receiver_name FROM users WHERE id = NEW.to_id;
    
    -- Insert notification for the sender
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        NEW.from_id,
        'Friend Request Accepted',
        COALESCE(receiver_name, 'Someone') || ' accepted your friend request! You are now friends.',
        'success'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for friend request acceptance
-- Note: We check if status changed from 'pending' to 'accepted'
DROP TRIGGER IF EXISTS tr_notify_on_friendship_accepted ON friend_requests;
CREATE TRIGGER tr_notify_on_friendship_accepted
AFTER UPDATE ON friend_requests
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status = 'accepted')
EXECUTE FUNCTION notify_on_friendship_accepted();

-- 5. Redundancy Fix: Ensure friendships table is updated when request is accepted
-- Actually, it's better to do this in the database to ensure consistency
CREATE OR REPLACE FUNCTION handle_friend_request_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' THEN
        -- Insert into friendships (both ways)
        INSERT INTO friendships (user_id, friend_id)
        VALUES (NEW.from_id, NEW.to_id), (NEW.to_id, NEW.from_id)
        ON CONFLICT DO NOTHING;
        
        -- Delete the request after handling (or keep it as accepted, but deleting is cleaner)
        -- DELETE FROM friend_requests WHERE id = NEW.id; 
        -- Actually, keeping it as 'accepted' is fine if we want to track history, 
        -- but the trigger above is AFTER UPDATE, so if we delete here it might be weird.
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_handle_friend_request_acceptance ON friend_requests;
CREATE TRIGGER tr_handle_friend_request_acceptance
AFTER UPDATE ON friend_requests
FOR EACH ROW
WHEN (NEW.status = 'accepted')
EXECUTE FUNCTION handle_friend_request_acceptance();
