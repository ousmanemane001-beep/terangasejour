
-- Fix: Restrict destinations bucket upload to admin only
DROP POLICY IF EXISTS "Auth upload destinations" ON storage.objects;

CREATE POLICY "Admins can upload destinations"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'destinations'
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Add admin-only DELETE policy for destinations bucket
DROP POLICY IF EXISTS "Admins can delete destinations files" ON storage.objects;

CREATE POLICY "Admins can delete destinations files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'destinations'
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );
