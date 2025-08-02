/**
 * Create site_settings table - Run this script to set up settings functionality
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSiteSettingsTable() {
  console.log('🔧 Creating site_settings table...');

  try {
    // First, let's check if the table exists
    const { error: checkError } = await adminSupabase
      .from('site_settings')
      .select('*')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('❌ Table does not exist, will need manual creation');
      console.log('\n📋 Please run this SQL in your Supabase SQL Editor:');
      console.log('='.repeat(60));
      console.log(`
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

-- Allow admin write access
CREATE POLICY "Allow admin write access" ON site_settings
  FOR ALL USING (true);

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES 
  ('siteName', 'Bengali News', 'The name of the website'),
  ('siteDescription', 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম', 'Website description in Bengali'),
  ('siteUrl', 'https://your-bengali-news-site.com', 'The primary URL of the website'),
  ('logoUrl', '', 'URL to the website logo'),
  ('defaultLanguage', 'bn', 'Default language code (bn for Bengali, en for English)')
ON CONFLICT (key) DO NOTHING;

-- Grant permissions
GRANT ALL ON TABLE site_settings TO service_role;
GRANT SELECT ON TABLE site_settings TO anon;
GRANT SELECT ON TABLE site_settings TO authenticated;
      `);
      console.log('='.repeat(60));
      console.log('\n⚠️  After running the SQL, restart this script to insert default settings.');
      return false;
    } else if (checkError) {
      console.error('❌ Unexpected error:', checkError);
      return false;
    } else {
      console.log('✅ Table already exists');
    }

    // Insert default settings if table is empty
    const { data: existingSettings, error: fetchError } = await adminSupabase
      .from('site_settings')
      .select('key')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error checking existing settings:', fetchError);
      return false;
    }

    if (!existingSettings || existingSettings.length === 0) {
      console.log('📝 Inserting default settings...');
      
      const defaultSettings = [
        { key: 'siteName', value: 'Bengali News', description: 'The name of the website' },
        { key: 'siteDescription', value: 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম', description: 'Website description in Bengali' },
        { key: 'siteUrl', value: '', description: 'The primary URL of the website' },
        { key: 'logoUrl', value: '', description: 'URL to the website logo' },
        { key: 'defaultLanguage', value: 'bn', description: 'Default language code (bn for Bengali, en for English)' }
      ];

      const { data: insertedData, error: insertError } = await adminSupabase
        .from('site_settings')
        .insert(defaultSettings)
        .select();

      if (insertError) {
        console.error('❌ Error inserting default settings:', insertError);
        return false;
      }

      console.log('✅ Default settings inserted:', insertedData?.length, 'records');
    } else {
      console.log('✅ Settings already exist');
    }

    // Test the settings API
    console.log('🧪 Testing settings retrieval...');
    const { data: allSettings, error: testError } = await adminSupabase
      .from('site_settings')
      .select('*')
      .order('key');

    if (testError) {
      console.error('❌ Error testing settings:', testError);
      return false;
    }

    console.log('✅ Current settings:');
    allSettings?.forEach(setting => {
      console.log(`  ${setting.key}: ${setting.value}`);
    });

    return true;

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return false;
  }
}

// Run the setup
createSiteSettingsTable().then(success => {
  if (success) {
    console.log('\n✅ Site settings table setup completed successfully!');
    console.log('🚀 You can now use the admin settings page to manage site configuration.');
  } else {
    console.log('\n❌ Setup failed. Please check the errors above.');
  }
  process.exit(success ? 0 : 1);
});