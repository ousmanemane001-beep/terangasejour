CREATE POLICY "Admins can delete all listings"
ON public.listings
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));