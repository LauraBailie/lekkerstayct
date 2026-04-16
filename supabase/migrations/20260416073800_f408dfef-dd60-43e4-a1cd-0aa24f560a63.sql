
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create rentals table
CREATE TABLE public.rentals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suburb TEXT NOT NULL,
  monthly_rent INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  move_in_date DATE,
  notes TEXT,
  braai_friendly BOOLEAN DEFAULT false,
  near_myciti BOOLEAN DEFAULT false,
  loadshedding_friendly BOOLEAN DEFAULT false,
  near_taxi_rank BOOLEAN DEFAULT false,
  good_schools BOOLEAN DEFAULT false,
  walking_distance_shops BOOLEAN DEFAULT false,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rentals viewable by all" ON public.rentals FOR SELECT USING (true);
CREATE POLICY "Auth users insert rentals" ON public.rentals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own rentals" ON public.rentals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own rentals" ON public.rentals FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_rentals_suburb ON public.rentals(suburb);
CREATE INDEX idx_rentals_created ON public.rentals(created_at DESC);

-- Create pulse_reports table
CREATE TABLE public.pulse_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suburb TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('Traffic', 'Safety', 'Power', 'Other')),
  description TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pulse_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pulse reports viewable by all" ON public.pulse_reports FOR SELECT USING (true);
CREATE POLICY "Auth users insert pulse" ON public.pulse_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_pulse_suburb ON public.pulse_reports(suburb);
CREATE INDEX idx_pulse_created ON public.pulse_reports(created_at DESC);

-- Storage bucket for rental photos
INSERT INTO storage.buckets (id, name, public) VALUES ('rental-photos', 'rental-photos', true);

CREATE POLICY "Anyone can view rental photos" ON storage.objects FOR SELECT USING (bucket_id = 'rental-photos');
CREATE POLICY "Auth users upload rental photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'rental-photos' AND auth.uid() IS NOT NULL);
