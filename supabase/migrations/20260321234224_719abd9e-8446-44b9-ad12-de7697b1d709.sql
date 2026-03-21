
-- Seasonal pricing table
CREATE TABLE public.seasonal_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  season_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  price_per_night integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seasonal_prices ENABLE ROW LEVEL SECURITY;

-- Anyone can view seasonal prices for published listings
CREATE POLICY "Anyone can view seasonal prices"
  ON public.seasonal_prices FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = seasonal_prices.listing_id AND l.status = 'published'
  ));

-- Owners can manage their seasonal prices
CREATE POLICY "Owners can insert seasonal prices"
  ON public.seasonal_prices FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = seasonal_prices.listing_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Owners can update seasonal prices"
  ON public.seasonal_prices FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = seasonal_prices.listing_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Owners can delete seasonal prices"
  ON public.seasonal_prices FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = seasonal_prices.listing_id AND l.user_id = auth.uid()
  ));

-- Admins can manage all
CREATE POLICY "Admins can manage seasonal prices"
  ON public.seasonal_prices FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
