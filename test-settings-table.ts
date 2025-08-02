/**
 * Test script to verify site_settings table exists and functionality
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testSettingsTable() {
  console.log('🔍 Testing site_settings table...');
  
  try {
    // Test 1: Check if table exists by trying to select from it
    const { data, error } = await adminSupabase
      .from('site_settings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Table check error:', error);
      
      if (error.code === 'PGRST116') {
        console.log('🔧 Creating site_settings table...');
        await createSettingsTable();
      }
    } else {
      console.log('✅ site_settings table exists:', data);
    }

    // Test 2: Try to fetch settings using the API structure
    const settingsData = await adminSupabase
      .from('site_settings')
      .select('*')
      .order('key');

    console.log('📊 Current settings:', settingsData);

    // Test 3: Try inserting test data if table is empty
    if (settingsData.data && settingsData.data.length === 0) {
      console.log('📝 Inserting default settings...');
      await insertDefaultSettings();
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

async function createSettingsTable() {
  // We can't create tables with the client, this would need to be done in Supabase dashboard
  console.log('⚠️ Table creation needs to be done in Supabase dashboard');
  console.log('SQL to run:');
  console.log(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
    
    -- Allow public read access
    CREATE POLICY "Allow public read access" ON site_settings
      FOR SELECT USING (true);
    
    -- Allow admin write access  
    CREATE POLICY "Allow admin write access" ON site_settings
      FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
  `);
}

async function insertDefaultSettings() {
  const defaultSettings = [
    { key: 'siteName', value: 'Bengali News' },
    { key: 'siteDescription', value: 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম' },
    { key: 'siteUrl', value: '' },
    { key: 'logoUrl', value: '' },
    { key: 'defaultLanguage', value: 'bn' }
  ];

  try {
    const { data, error } = await adminSupabase
      .from('site_settings')
      .insert(defaultSettings)
      .select();

    if (error) {
      console.error('❌ Error inserting default settings:', error);
    } else {
      console.log('✅ Default settings inserted:', data);
    }
  } catch (error) {
    console.error('💥 Failed to insert default settings:', error);
  }
}

// Run the test
testSettingsTable();