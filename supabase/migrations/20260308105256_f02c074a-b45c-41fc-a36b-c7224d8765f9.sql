
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS longitude double precision;
