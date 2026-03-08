
-- Fix overly permissive notifications INSERT policy
DROP POLICY "System can insert notifications" ON public.notifications;

-- Allow authenticated users to insert notifications (needed for system triggers)
CREATE POLICY "Authenticated can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
