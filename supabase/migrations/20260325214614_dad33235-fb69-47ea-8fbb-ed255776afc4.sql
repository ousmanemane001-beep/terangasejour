
-- Remove sensitive PII columns from bookings table
-- These should only exist in booking_guest_details table
ALTER TABLE public.bookings DROP COLUMN IF EXISTS guest_email;
ALTER TABLE public.bookings DROP COLUMN IF EXISTS guest_phone;
ALTER TABLE public.bookings DROP COLUMN IF EXISTS passport_number;
ALTER TABLE public.bookings DROP COLUMN IF EXISTS nationality;
