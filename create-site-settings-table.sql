-- Create site_settings table for admin settings management
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site settings
CREATE POLICY "Allow public read access" ON site_settings
  FOR SELECT USING (true);

-- Allow admin write access (using service role key bypasses this anyway)
CREATE POLICY "Allow admin write access" ON site_settings
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role');

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES 
  ('siteName', 'Bengali News', 'The name of the website'),
  ('siteDescription', 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম', 'Website description in Bengali'),
  ('siteUrl', 'https://your-bengali-news-site.com', 'The primary URL of the website'),
  ('logoUrl', '', 'URL to the website logo'),
  ('defaultLanguage', 'bn', 'Default language code (bn for Bengali, en for English)')
ON CONFLICT (key) DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_site_settings_updated_at_trigger ON site_settings;
CREATE TRIGGER update_site_settings_updated_at_trigger
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_site_settings_updated_at();

-- Grant permissions
GRANT ALL ON TABLE site_settings TO service_role;
GRANT SELECT ON TABLE site_settings TO anon;
GRANT SELECT ON TABLE site_settings TO authenticated;