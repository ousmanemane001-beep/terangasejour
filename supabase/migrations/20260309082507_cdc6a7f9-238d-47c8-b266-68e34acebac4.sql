
-- Create destination category enum
CREATE TYPE public.destination_category AS ENUM (
  'ville', 'aeroport', 'site_historique', 'plage', 'lac', 'restaurant', 'hotel', 'ile', 'parc_naturel'
);

-- Create destinations table
CREATE TABLE public.destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category destination_category NOT NULL,
  region TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_place_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view destinations"
  ON public.destinations FOR SELECT
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage destinations"
  ON public.destinations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create index for search
CREATE INDEX idx_destinations_name ON public.destinations USING gin (to_tsvector('french', name));
CREATE INDEX idx_destinations_category ON public.destinations (category);
CREATE INDEX idx_destinations_region ON public.destinations (region);
