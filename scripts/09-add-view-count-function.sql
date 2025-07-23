-- Add view count increment function
CREATE OR REPLACE FUNCTION increment_thread_views(thread_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE threads 
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = NOW()
  WHERE id = thread_id_param;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_threads_view_count ON threads(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_threads_forum_created ON threads(forum_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_thread_created ON posts(thread_id, created_at DESC);

-- Add member count tracking (mock implementation)
ALTER TABLE forums ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

-- Update existing forums with random member counts for demo
UPDATE forums SET member_count = floor(random() * 100 + 10) WHERE member_count = 0;
