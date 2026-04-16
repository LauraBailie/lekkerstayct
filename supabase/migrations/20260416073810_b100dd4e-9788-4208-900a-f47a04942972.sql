
DROP POLICY "Anyone can view rental photos" ON storage.objects;
CREATE POLICY "Anyone can view rental photos by path" ON storage.objects FOR SELECT USING (bucket_id = 'rental-photos');
