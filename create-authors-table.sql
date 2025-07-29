-- Create Authors Table for Bengali News Website
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for authors
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_authors_updated_at 
  BEFORE UPDATE ON authors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add author_id foreign key to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES authors(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);
CREATE INDEX IF NOT EXISTS idx_authors_is_active ON authors(is_active);

-- Insert default authors
INSERT INTO authors (name, slug, email, bio, is_active) 
VALUES 
  ('Admin', 'admin', 'admin@bengalinews.com', 'Site Administrator', true),
  ('সংবাদ সম্পাদক', 'news-editor', 'editor@bengalinews.com', 'প্রধান সংবাদ সম্পাদক', true),
  ('প্রতিবেদক', 'reporter', 'reporter@bengalinews.com', 'সাধারণ প্রতিবেদক', true)
ON CONFLICT (slug) DO NOTHING;

-- Set RLS policies for authors table
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active authors
CREATE POLICY "Authors are viewable by everyone" ON authors
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to view all authors
CREATE POLICY "Authenticated users can view all authors" ON authors
  FOR SELECT TO authenticated USING (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role can manage authors" ON authors
  FOR ALL TO service_role USING (true);

-- Allow admin users to manage authors
CREATE POLICY "Admin users can manage authors" ON authors
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

COMMENT ON TABLE authors IS 'Authors and writers for Bengali news articles';
COMMENT ON COLUMN authors.social_links IS 'JSON object containing social media links (facebook, twitter, linkedin, etc.)';