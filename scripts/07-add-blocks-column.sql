-- Add blocks column to forums table
ALTER TABLE forums ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb;

-- Add blocks column to threads table  
ALTER TABLE threads ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb;

-- Add blocks column to replies table (if it exists)
ALTER TABLE replies ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb;

-- Create indexes for better performance on JSONB columns
CREATE INDEX IF NOT EXISTS idx_forums_blocks ON forums USING GIN (blocks);
CREATE INDEX IF NOT EXISTS idx_threads_blocks ON threads USING GIN (blocks);
CREATE INDEX IF NOT EXISTS idx_replies_blocks ON replies USING GIN (blocks);

-- Add view_count column to threads if it doesn't exist
ALTER TABLE threads ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create index for view_count
CREATE INDEX IF NOT EXISTS idx_threads_view_count ON threads (view_count);
