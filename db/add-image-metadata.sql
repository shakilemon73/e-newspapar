-- Add image_metadata column to articles table
-- This column will store additional information about article images

-- Add JSONB column for image metadata
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS image_metadata JSONB;

-- Create index for better JSON query performance
CREATE INDEX IF NOT EXISTS idx_articles_image_metadata 
ON articles USING GIN (image_metadata);

-- Update existing articles with sample image metadata for demonstration
UPDATE articles 
SET image_metadata = jsonb_build_object(
  'caption', title,
  'place', 'ঢাকা, বাংলাদেশ',
  'date', DATE(published_at)::text,
  'photographer', 'স্টাফ রিপোর্টার',
  'id', 'IMG-' || LPAD(id::text, 4, '0')
)
WHERE image_metadata IS NULL 
AND image_url IS NOT NULL 
AND image_url != '';

-- Add comment for documentation
COMMENT ON COLUMN articles.image_metadata IS 'JSON object containing image metadata like caption, place, date, photographer, and unique ID';