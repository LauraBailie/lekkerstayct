
CREATE TABLE public.rental_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (rental_id, user_id)
);

ALTER TABLE public.rental_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
ON public.rental_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit reports"
ON public.rental_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);
