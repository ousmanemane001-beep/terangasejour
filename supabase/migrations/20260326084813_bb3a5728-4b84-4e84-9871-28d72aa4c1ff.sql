-- Fix: Allow hosts to SELECT guest details for their own listings' bookings
CREATE POLICY "Hosts can view guest details for own bookings"
ON public.booking_guest_details
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM bookings b
    JOIN listings l ON l.id = b.listing_id
    WHERE b.id = booking_guest_details.booking_id
      AND l.user_id = auth.uid()
  )
);

-- Fix: Replace permissive dispute_evidence INSERT policy with participant-only check
DROP POLICY IF EXISTS "Users can upload evidence" ON public.dispute_evidence;

CREATE POLICY "Participants can upload evidence"
ON public.dispute_evidence
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = uploaded_by
  AND EXISTS (
    SELECT 1
    FROM disputes d
    WHERE d.id = dispute_evidence.dispute_id
      AND (d.reporter_id = auth.uid() OR d.host_id = auth.uid())
  )
);