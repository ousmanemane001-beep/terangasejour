ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS owner_reply text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS owner_reply_at timestamp with time zone;