
-- 1. Fix notifications: restrict INSERT so users can only insert notifications where they are NOT the target
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id != auth.uid());

-- 2. Fix user_roles: add explicit separate policies instead of ALL
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Restrict the broad profile SELECT policy to only conversation participants + self + admins
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Authenticated can view relevant profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM conversations c
    WHERE (c.guest_id = profiles.id OR c.host_id = profiles.id)
    AND (c.guest_id = auth.uid() OR c.host_id = auth.uid())
  )
);
