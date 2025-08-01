-- Fix missing columns in video_content and social_media_posts tables

-- Add missing columns to video_content table if they don't exist
DO $$ 
BEGIN 
    -- Add view_count column to video_content if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'video_content' AND column_name = 'view_count') THEN
        ALTER TABLE video_content ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add updated_at column to video_content if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'video_content' AND column_name = 'updated_at') THEN
        ALTER TABLE video_content ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add missing columns to social_media_posts table if they don't exist
DO $$ 
BEGIN 
    -- Add embed_code column to social_media_posts if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'social_media_posts' AND column_name = 'embed_code') THEN
        ALTER TABLE social_media_posts ADD COLUMN embed_code TEXT;
    END IF;
    
    -- Add updated_at column to social_media_posts if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'social_media_posts' AND column_name = 'updated_at') THEN
        ALTER TABLE social_media_posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add author_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'social_media_posts' AND column_name = 'author_name') THEN
        ALTER TABLE social_media_posts ADD COLUMN author_name TEXT;
    END IF;
    
    -- Add author_handle column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'social_media_posts' AND column_name = 'author_handle') THEN
        ALTER TABLE social_media_posts ADD COLUMN author_handle TEXT;
    END IF;
    
    -- Add interaction_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'social_media_posts' AND column_name = 'interaction_count') THEN
        ALTER TABLE social_media_posts ADD COLUMN interaction_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add post_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'social_media_posts' AND column_name = 'post_url') THEN
        ALTER TABLE social_media_posts ADD COLUMN post_url TEXT;
    END IF;
END $$;

-- Update any existing records to have default values for new columns
UPDATE video_content SET view_count = 0 WHERE view_count IS NULL;
UPDATE video_content SET updated_at = created_at WHERE updated_at IS NULL;

UPDATE social_media_posts SET interaction_count = 0 WHERE interaction_count IS NULL;
UPDATE social_media_posts SET updated_at = created_at WHERE updated_at IS NULL;

-- Create triggers to automatically update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for video_content
DROP TRIGGER IF EXISTS update_video_content_updated_at ON video_content;
CREATE TRIGGER update_video_content_updated_at
    BEFORE UPDATE ON video_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for social_media_posts
DROP TRIGGER IF EXISTS update_social_media_posts_updated_at ON social_media_posts;
CREATE TRIGGER update_social_media_posts_updated_at
    BEFORE UPDATE ON social_media_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();