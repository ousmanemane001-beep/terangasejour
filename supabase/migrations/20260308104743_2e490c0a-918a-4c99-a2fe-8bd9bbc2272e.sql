
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'wave';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';
