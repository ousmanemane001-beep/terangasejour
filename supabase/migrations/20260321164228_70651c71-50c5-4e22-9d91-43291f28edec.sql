
-- 1. Add explicit RESTRICTIVE policy on user_roles to prevent non-admin INSERT
CREATE POLICY "Deny non-admin role insertion"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Create a secure function for hosts to view bookings without sensitive PII
CREATE OR REPLACE FUNCTION public.get_host_bookings(_host_user_id uuid)
RETURNS TABLE(
  id uuid,
  listing_id uuid,
  guest_id uuid,
  check_in date,
  check_out date,
  guests integer,
  nights integer,
  price_per_night integer,
  service_fee integer,
  total_price integer,
  status text,
  payment_status text,
  payment_method text,
  guest_name text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    b.id, b.listing_id, b.guest_id,
    b.check_in, b.check_out, b.guests, b.nights,
    b.price_per_night, b.service_fee, b.total_price,
    b.status, b.payment_status, b.payment_method,
    b.guest_name, b.created_at, b.updated_at
  FROM bookings b
  JOIN listings l ON l.id = b.listing_id
  WHERE l.user_id = _host_user_id;
$$;
