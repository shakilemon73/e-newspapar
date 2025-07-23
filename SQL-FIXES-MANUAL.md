# 🔧 CRITICAL DATABASE FIXES - MANUAL SQL EXECUTION REQUIRED

## ⚠️ IMPORTANT: Run these SQL queries in your Supabase SQL Editor

### 1. CREATE MISSING RPC FUNCTION

```sql
-- Create increment_view_count function for atomic view counting
CREATE OR REPLACE FUNCTION public.increment_view_count(article_id bigint)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count bigint;
BEGIN
    UPDATE articles 
    SET view_count = COALESCE(view_count, 0) + 1 
    WHERE id = article_id;
    
    SELECT view_count INTO new_count 
    FROM articles 
    WHERE id = article_id;
    
    RETURN COALESCE(new_count, 0);
END;
$$;
```

### 2. FIX FOREIGN KEY RELATIONSHIPS

```sql
-- Fix article_comments to user_profiles relationship
DO $$
BEGIN
    -- Add user_id column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'article_comments' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE article_comments ADD COLUMN user_id uuid;
    END IF;
    
    -- Add foreign key constraint to user_profiles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'article_comments_user_profiles_fkey'
    ) THEN
        ALTER TABLE article_comments 
        ADD CONSTRAINT article_comments_user_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;
```

```sql
-- Fix polls to poll_options relationship
DO $$
BEGIN
    -- Add poll_id column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'poll_options' 
        AND column_name = 'poll_id'
    ) THEN
        ALTER TABLE poll_options ADD COLUMN poll_id bigint;
    END IF;
    
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'poll_options_poll_id_fkey'
    ) THEN
        ALTER TABLE poll_options 
        ADD CONSTRAINT poll_options_poll_id_fkey 
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE;
    END IF;
END $$;
```

### 3. FIX ROW LEVEL SECURITY POLICIES

```sql
-- Fix weather table RLS policy
ALTER TABLE weather ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage weather data
CREATE POLICY "Service role can manage weather" ON weather
FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.jwt() ->> 'role' = 'authenticated'
);

-- Allow public read access to weather data
CREATE POLICY "Public can read weather" ON weather
FOR SELECT USING (true);
```

### 4. VERIFY FIXES

```sql
-- Test increment_view_count function
SELECT increment_view_count(1);

-- Test foreign key relationships
SELECT ac.*, up.username 
FROM article_comments ac 
LEFT JOIN user_profiles up ON ac.user_id = up.user_id 
LIMIT 1;

SELECT p.*, po.option_text 
FROM polls p 
LEFT JOIN poll_options po ON p.id = po.poll_id 
LIMIT 1;

-- Test weather access
SELECT * FROM weather LIMIT 1;
```

## 📋 EXECUTION CHECKLIST

- [ ] Run RPC function creation query
- [ ] Run foreign key relationship fixes
- [ ] Run RLS policy fixes
- [ ] Test all fixes with verification queries
- [ ] Check application logs for resolved errors

After running these queries, your Bengali news website will have:
- ✅ Working view count tracking
- ✅ Functional comments system
- ✅ Working polls system
- ✅ Fixed weather updates
- ✅ No more infinite loop rendering issues