-- Add status column to articles table for proper "অবস্থা" display
-- Execute this in Supabase SQL Editor

-- Add the status column
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published' 
CHECK (status IN ('draft', 'published', 'review', 'scheduled'));

-- Add is_published column for compatibility
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Update existing articles to set proper status and is_published values
UPDATE articles 
SET 
  status = 'published',
  is_published = true
WHERE status IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);

-- Add comments for documentation
COMMENT ON COLUMN articles.status IS 'Article publication status: draft, published, review, scheduled';
COMMENT ON COLUMN articles.is_published IS 'Boolean flag indicating if article is published (for compatibility)';

-- Verify the changes
SELECT 
  'Total articles' as metric,
  COUNT(*) as count
FROM articles
UNION ALL
SELECT 
  'Published articles' as metric,
  COUNT(*) as count
FROM articles 
WHERE status = 'published'
UNION ALL
SELECT 
  'Draft articles' as metric,
  COUNT(*) as count
FROM articles 
WHERE status = 'draft';

-- Show sample data
SELECT 
  id, 
  title, 
  status, 
  is_published, 
  created_at
FROM articles 
ORDER BY created_at DESC 
LIMIT 5;