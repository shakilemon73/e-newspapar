/**
 * Create Missing Tables for Admin Functions
 * Direct approach using Supabase client
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function createSiteSettingsTable() {
  try {
    console.log('🔧 Creating site_settings table via direct insert...');
    
    // Try to insert settings directly - if table doesn't exist, it will fail
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
      console.error('Failed to create/update settings:', error);
      return false;
    }

    console.log('✅ Site settings created/updated successfully');
    return true;
  } catch (error) {
    console.error('Error in createSiteSettingsTable:', error);
    return false;
  }
}

// Call this function when the admin app loads
export function initializeAdminTables() {
  createSiteSettingsTable();
}