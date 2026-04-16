
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload rental photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for rental photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view rental photos" ON storage.objects;

-- SELECT: public read access (photos need to be viewable)
CREATE POLICY "Public read rental photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'rental-photos');

-- INSERT: only to own folder
CREATE POLICY "Users upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rental-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: only own folder
CREATE POLICY "Users update own rental photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'rental-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: only own folder
CREATE POLICY "Users delete own rental photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'rental-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
