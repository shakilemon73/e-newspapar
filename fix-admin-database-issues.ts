/**
 * Fix Admin Database Issues Script
 * Creates missing tables and resolves admin functionality
 */
import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback from .env
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSiteSettingsTable() {
  console.log('🔧 Creating site_settings table...');
  
  try {
    // Create the table using RPC function
    const { data, error } = await adminSupabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.site_settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert default settings
        INSERT INTO public.site_settings (key, value, description) VALUES
        ('siteName', 'Bengali News', 'Website name'),
        ('siteDescription', 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম', 'Website description'),
        ('siteUrl', '', 'Website URL'),
        ('logoUrl', '', 'Logo URL'),
        ('defaultLanguage', 'bn', 'Default language')
        ON CONFLICT (key) DO NOTHING;
      `
    });

    if (error) {
      console.error('Error creating site_settings table:', error);
      throw error;
    }

    console.log('✅ site_settings table created successfully');
    return true;
  } catch (error) {
    console.error('Failed to create site_settings table:', error);
    
    // Alternative: Try direct insert/upsert
    try {
      console.log('🔄 Trying alternative approach...');
      
      const settingsData = [
        { key: 'siteName', value: 'Bengali News', description: 'Website name' },
        { key: 'siteDescription', value: 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম', description: 'Website description' },
        { key: 'siteUrl', value: '', description: 'Website URL' },
        { key: 'logoUrl', value: '', description: 'Logo URL' },
        { key: 'defaultLanguage', value: 'bn', description: 'Default language' }
      ];

      const { data, error } = await adminSupabase
        .from('site_settings')
        .upsert(settingsData, { onConflict: 'key' });

      if (error) {
        console.error('Alternative approach also failed:', error);
        return false;
      }

      console.log('✅ Settings data inserted successfully via alternative method');
      return true;
    } catch (altError) {
      console.error('Both approaches failed:', altError);
      return false;
    }
  }
}

async function checkTablesExist() {
  console.log('🔍 Checking existing tables...');
  
  try {
    // Check articles table
    const { data: articlesData, error: articlesError } = await adminSupabase
      .from('articles')
      .select('count(*)')
      .limit(1);

    console.log('Articles table:', articlesError ? 'Missing/Error' : 'Exists');
    
    // Check categories table
    const { data: categoriesData, error: categoriesError } = await adminSupabase
      .from('categories')
      .select('count(*)')
      .limit(1);

    console.log('Categories table:', categoriesError ? 'Missing/Error' : 'Exists');

    // Check site_settings table
    const { data: settingsData, error: settingsError } = await adminSupabase
      .from('site_settings')
      .select('count(*)')
      .limit(1);

    console.log('Site settings table:', settingsError ? 'Missing/Error' : 'Exists');
    
    return {
      articles: !articlesError,
      categories: !categoriesError,
      settings: !settingsError
    };
  } catch (error) {
    console.error('Error checking tables:', error);
    return { articles: false, categories: false, settings: false };
  }
}

async function main() {
  console.log('🚀 Starting database fix script...');
  
  const tablesStatus = await checkTablesExist();
  console.log('Tables status:', tablesStatus);
  
  if (!tablesStatus.settings) {
    await createSiteSettingsTable();
  } else {
    console.log('✅ site_settings table already exists');
  }
  
  console.log('🎉 Database fix script completed');
}

// Run the script
main().catch(console.error);