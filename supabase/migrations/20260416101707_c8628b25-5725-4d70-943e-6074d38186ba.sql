
CREATE TABLE public.saved_suburbs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  suburb TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, suburb)
);

ALTER TABLE public.saved_suburbs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved suburbs"
ON public.saved_suburbs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save suburbs"
ON public.saved_suburbs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave suburbs"
ON public.saved_suburbs FOR DELETE
USING (auth.uid() = user_id);
