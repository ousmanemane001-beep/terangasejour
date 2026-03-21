
-- Create a separate table for sensitive guest PII, accessible only by the guest and admins
CREATE TABLE public.booking_guest_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE,
  guest_email text,
  guest_phone text,
  passport_number text,
  nationality text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_guest_details ENABLE ROW LEVEL SECURITY;

-- Only the guest who made the booking can see their own details
CREATE POLICY "Guests can view own booking details"
ON public.booking_guest_details
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = booking_guest_details.booking_id
    AND b.guest_id = auth.uid()
  )
);

-- Only the guest can insert their own details
CREATE POLICY "Guests can insert own booking details"
ON public.booking_guest_details
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = booking_guest_details.booking_id
    AND b.guest_id = auth.uid()
  )
);

-- Admins can view all
CREATE POLICY "Admins can view all booking details"
ON public.booking_guest_details
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing data
INSERT INTO public.booking_guest_details (booking_id, guest_email, guest_phone, passport_number, nationality)
SELECT id, guest_email, guest_phone, passport_number, nationality
FROM public.bookings
WHERE guest_email IS NOT NULL OR guest_phone IS NOT NULL OR passport_number IS NOT NULL;

-- Clear sensitive data from bookings table
UPDATE public.bookings
SET guest_email = NULL, guest_phone = NULL, passport_number = NULL, nationality = NULL;
