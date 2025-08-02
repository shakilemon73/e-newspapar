/**
 * Add branding settings columns to site_settings table
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY!;

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function addBrandingSettings() {
  console.log('🎨 Adding branding settings to site_settings table...');

  try {
    // Add branding settings
    const brandingSettings = [
      { key: 'theme', value: 'traditional-red', description: 'Selected color theme ID' },
      { key: 'headlineFont', value: 'noto-sans-bengali', description: 'Font for headlines' },
      { key: 'bodyFont', value: 'siyam-rupali', description: 'Font for body text' },
      { key: 'displayFont', value: 'kalpurush', description: 'Font for display elements' },
      { key: 'primaryColor', value: '#ec1f27', description: 'Primary brand color' },
      { key: 'secondaryColor', value: '#509478', description: 'Secondary brand color' },
      { key: 'accentColor', value: '#fbcc44', description: 'Accent brand color' }
    ];

    for (const setting of brandingSettings) {
      const { data, error } = await adminSupabase
        .from('site_settings')
        .upsert(setting, { onConflict: 'key' })
        .select();

      if (error) {
        console.error(`❌ Error adding ${setting.key}:`, error);
      } else {
        console.log(`✅ Added branding setting: ${setting.key} = ${setting.value}`);
      }
    }

    // Test reading all settings
    const { data: allSettings, error: fetchError } = await adminSupabase
      .from('site_settings')
      .select('*')
      .order('key');

    if (fetchError) {
      console.error('❌ Error fetching settings:', fetchError);
    } else {
      console.log('\n📊 All site settings:');
      allSettings?.forEach(setting => {
        console.log(`  ${setting.key}: ${setting.value}`);
      });
    }

    console.log('\n✅ Branding settings added successfully!');
    return true;

  } catch (error) {
    console.error('💥 Error:', error);
    return false;
  }
}

addBrandingSettings().then(success => {
  process.exit(success ? 0 : 1);
});