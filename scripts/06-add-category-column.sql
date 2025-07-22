-- Add a category column to forums (if it doesn't exist)
ALTER TABLE forums
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
