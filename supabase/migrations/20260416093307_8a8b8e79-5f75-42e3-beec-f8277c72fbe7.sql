
CREATE TABLE public.external_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suburb TEXT NOT NULL,
  monthly_rent INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  source_name TEXT NOT NULL DEFAULT 'Property24',
  source_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.external_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "External listings viewable by all"
ON public.external_listings
FOR SELECT
USING (true);
