-- SUPER FIX FOR SOCIAL SYSTEM
-- This script combines RLS fixes and Trigger hardening for Notifications and Friends

-- 1. Hardened Notification Triggers
CREATE OR REPLACE FUNCTION notify_on_friend_request()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- Get sender name or fallback to username
    -- Use public schema explicitly
    SELECT COALESCE(name, username, 'Someone') INTO sender_name FROM public.users WHERE id = NEW.from_id;
    
    -- Insert notification for the receiver
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        NEW.to_id,
        'New Friend Request',
        COALESCE(sender_name, 'Someone') || ' sent you a friend request!',
        'info'
    )
    ON CONFLICT DO NOTHING; -- Prevent any weird unique constraint failures
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevent trigger failure from blocking the friend request
    RAISE WARNING 'Notification trigger failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION notify_on_friendship_accepted()
RETURNS TRIGGER AS $$
DECLARE
    receiver_name TEXT;
BEGIN
    -- Get receiver name or fallback to username
    SELECT COALESCE(name, username, 'Someone') INTO receiver_name FROM public.users WHERE id = NEW.to_id;
    
    -- Insert notification for the sender
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        NEW.from_id,
        'Friend Request Accepted',
        COALESCE(receiver_name, 'Someone') || ' accepted your friend request! You are now friends.',
        'success'
    )
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Notification acceptance trigger failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Ensure RLS Policies are Robust
-- Notifications
DROP POLICY IF EXISTS "Anyone can create notifications" ON notifications;
CREATE POLICY "Anyone can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can see their own notifications" ON notifications;
CREATE POLICY "Users can see their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Friend Requests
DROP POLICY IF EXISTS "Users can send friend requests" ON friend_requests;
CREATE POLICY "Users can send friend requests" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = from_id);

DROP POLICY IF EXISTS "Users can manage their own friend requests" ON friend_requests;
CREATE POLICY "Users can manage their own friend requests" ON friend_requests
  FOR ALL USING (auth.uid() = from_id OR auth.uid() = to_id);

-- 3. Re-create Triggers
DROP TRIGGER IF EXISTS tr_notify_on_friend_request ON friend_requests;
CREATE TRIGGER tr_notify_on_friend_request
AFTER INSERT ON friend_requests
FOR EACH ROW EXECUTE FUNCTION notify_on_friend_request();

DROP TRIGGER IF EXISTS tr_notify_on_friendship_accepted ON friend_requests;
CREATE TRIGGER tr_notify_on_friendship_accepted
AFTER UPDATE ON friend_requests
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status = 'accepted')
EXECUTE FUNCTION notify_on_friendship_accepted();
