
-- Re-apply columns (idempotent) since previous migration partially failed
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guest_name text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guest_phone text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS passport_number text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS nationality text;

-- Create function to auto-expire bookings
CREATE OR REPLACE FUNCTION public.expire_pending_bookings()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.bookings
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at < now();
$$;
