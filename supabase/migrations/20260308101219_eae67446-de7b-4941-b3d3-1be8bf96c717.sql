-- Allow authenticated users to view any profile (needed for reviews, booking display)
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);