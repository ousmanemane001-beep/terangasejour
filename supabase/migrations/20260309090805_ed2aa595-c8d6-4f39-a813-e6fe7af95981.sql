ALTER TABLE public.destinations 
  ADD COLUMN IF NOT EXISTS image1 text,
  ADD COLUMN IF NOT EXISTS image2 text,
  ADD COLUMN IF NOT EXISTS image3 text,
  ADD COLUMN IF NOT EXISTS image4 text;