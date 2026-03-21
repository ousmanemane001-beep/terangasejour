
-- 1. Fix messages UPDATE policy: only allow updating own messages (for read status)
DROP POLICY IF EXISTS "Participants can update messages" ON public.messages;
CREATE POLICY "Participants can mark own received messages as read"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.guest_id = auth.uid() OR c.host_id = auth.uid())
  )
  AND sender_id != auth.uid()
);

-- 2. Restrict profile SELECT: conversation participants use safe_profiles view, direct access only for self/admin
DROP POLICY IF EXISTS "Authenticated can view relevant profiles" ON public.profiles;

-- Self access
CREATE POLICY "Users can view own profile v2"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admin access  
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop redundant policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
