-- Add author column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author TEXT DEFAULT '';

-- Update existing articles with a default author
UPDATE articles SET author = 'Admin' WHERE author IS NULL OR author = '';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author);