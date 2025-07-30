-- Add status column to articles table if it doesn't exist
-- This fixes the missing "অবস্থা" column issue

-- First, add the status column
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' 
CHECK (status IN ('draft', 'published', 'review', 'scheduled'));

-- Update existing articles based on is_published column
UPDATE articles 
SET status = CASE 
  WHEN is_published = true THEN 'published'
  ELSE 'draft'
END
WHERE status IS NULL OR status = 'draft';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);

-- Add comment for documentation
COMMENT ON COLUMN articles.status IS 'Article publication status: draft, published, review, scheduled';

-- Check the results
SELECT 
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN is_published = true THEN 1 END) as published_count
FROM articles 
GROUP BY status
ORDER BY status;