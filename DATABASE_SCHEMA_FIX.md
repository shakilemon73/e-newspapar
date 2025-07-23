
## Manual Database Update Required

The articles table in Supabase is missing the 'author' column. To fix this:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor 
3. Run this SQL command:

```sql
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author TEXT DEFAULT '';
UPDATE articles SET author = 'Admin' WHERE author IS NULL OR author = '';
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author);
```

Current columns in articles table:
- id, title, slug, content, excerpt, image_url
- category_id, is_featured, view_count, published_at  
- created_at, updated_at

Missing: author column

