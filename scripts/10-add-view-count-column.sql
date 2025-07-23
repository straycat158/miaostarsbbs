-- Add view_count column to threads table
ALTER TABLE threads ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_threads_view_count ON threads(view_count);

-- Update existing threads to have 0 view count
UPDATE threads SET view_count = 0 WHERE view_count IS NULL;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_thread_view_count(thread_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE threads 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql;
