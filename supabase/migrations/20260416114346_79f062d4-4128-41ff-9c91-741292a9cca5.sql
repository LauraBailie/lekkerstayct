
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Profiles viewable by all" ON public.profiles;

-- Allow authenticated users to read all profiles (needed for display names)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Sanitize existing display_name values that contain email addresses
UPDATE public.profiles
SET display_name = split_part(display_name, '@', 1)
WHERE display_name LIKE '%@%';

-- Update the trigger to never store full email addresses
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;
