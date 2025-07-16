-- Create storage bucket for content images
INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', true);

-- Set up RLS policies for content images storage
CREATE POLICY "Content images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'content-images');

CREATE POLICY "Authenticated users can upload content images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'content-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own content images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'content-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own content images" ON storage.objects FOR DELETE USING (
  bucket_id = 'content-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add cover_image column to forums and threads tables
ALTER TABLE forums ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Add images column to store all uploaded images as JSON array
ALTER TABLE forums ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
