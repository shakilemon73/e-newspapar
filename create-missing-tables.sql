-- Create missing user_saved_articles table
CREATE TABLE IF NOT EXISTS user_saved_articles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    folder_name TEXT DEFAULT 'default',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Enable Row Level Security
ALTER TABLE user_saved_articles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_saved_articles
CREATE POLICY "Users can view their own saved articles" ON user_saved_articles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved articles" ON user_saved_articles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved articles" ON user_saved_articles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved articles" ON user_saved_articles
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_user_id ON user_saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_article_id ON user_saved_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_folder ON user_saved_articles(user_id, folder_name);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_saved_articles_updated_at 
    BEFORE UPDATE ON user_saved_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();