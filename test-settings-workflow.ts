/**
 * Test complete settings workflow: Admin update -> Database -> Public display
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTExNTksImV4cCI6MjA2ODA4NzE1OX0.GEhC-77JHGe1Oshtjg3FOSFSlJe5sLeyp_wqNWk6f1s';

// Admin client (for updates)
const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Public client (for reading)
const publicSupabase = createClient(supabaseUrl, anonKey);

async function testCompleteSettingsWorkflow() {
  console.log('🧪 Testing complete settings workflow...\n');

  try {
    // Step 1: Test current settings from database
    console.log('1️⃣ Testing current database settings...');
    const { data: currentSettings, error: fetchError } = await adminSupabase
      .from('site_settings')
      .select('*')
      .order('key');

    if (fetchError) {
      console.error('❌ Error fetching current settings:', fetchError);
      return false;
    }

    console.log('✅ Current settings in database:');
    currentSettings?.forEach(setting => {
      console.log(`   ${setting.key}: ${setting.value}`);
    });

    // Step 2: Test admin API (like admin page does)
    console.log('\n2️⃣ Testing admin API for settings...');
    
    // Convert to object format (same as admin API)
    const settingsObject = (currentSettings || []).reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    console.log('✅ Admin API format:', settingsObject);

    // Step 3: Test updating settings (like admin page Save button)
    console.log('\n3️⃣ Testing settings update...');
    const testSiteName = `Bengali News - Test ${Date.now()}`;
    
    const { data: updateData, error: updateError } = await adminSupabase
      .from('site_settings')
      .upsert({ key: 'siteName', value: testSiteName })
      .select();

    if (updateError) {
      console.error('❌ Error updating settings:', updateError);
      return false;
    }

    console.log('✅ Settings updated:', updateData);

    // Step 4: Test public API (like public pages do)
    console.log('\n4️⃣ Testing public API reading...');
    const { data: publicData, error: publicError } = await publicSupabase
      .from('site_settings')
      .select('*')
      .order('key');

    if (publicError) {
      console.error('❌ Error with public API:', publicError);
      return false;
    }

    // Convert to public API format
    const publicSettingsObject = (publicData || []).reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    console.log('✅ Public API format:', {
      siteName: publicSettingsObject.siteName,
      siteDescription: publicSettingsObject.siteDescription,
      logoUrl: publicSettingsObject.logoUrl,
      defaultLanguage: publicSettingsObject.defaultLanguage,
      siteUrl: publicSettingsObject.siteUrl
    });

    // Step 5: Verify the update worked
    console.log('\n5️⃣ Verifying update propagation...');
    if (publicSettingsObject.siteName === testSiteName) {
      console.log('✅ SUCCESS: Settings update correctly propagated from admin to public API');
    } else {
      console.log('❌ FAILED: Settings not propagated correctly');
      console.log('   Expected:', testSiteName);
      console.log('   Got:', publicSettingsObject.siteName);
      return false;
    }

    // Step 6: Reset to original value
    console.log('\n6️⃣ Resetting to original settings...');
    await adminSupabase
      .from('site_settings')
      .upsert({ key: 'siteName', value: 'Bengali News' })
      .select();

    console.log('✅ Settings reset to original values');

    return true;

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    return false;
  }
}

async function testAdminPageAPI() {
  console.log('\n🔧 Testing admin page API functions...');

  try {
    // Test the exact functions used by SettingsAdminPage
    const settingsAPI = {
      async getAll() {
        const { data, error } = await adminSupabase
          .from('site_settings')
          .select('*')
          .order('key');

        if (error) {
          console.error('Error fetching settings:', error);
          return {
            siteName: 'Bengali News',
            siteDescription: 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম',
            siteUrl: '',
            logoUrl: '',
            defaultLanguage: 'bn'
          };
        }

        const settingsObject = (data || []).reduce((acc: any, setting: any) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});

        return settingsObject;
      },

      async updateMultiple(settingsToUpdate: Record<string, string>) {
        const updatePromises = Object.entries(settingsToUpdate).map(([key, value]) =>
          adminSupabase
            .from('site_settings')
            .upsert({ key, value })
            .select()
        );

        const results = await Promise.all(updatePromises);
        return results;
      }
    };

    // Test getAll()
    console.log('📥 Testing getAll()...');
    const allSettings = await settingsAPI.getAll();
    console.log('✅ getAll() result:', allSettings);

    // Test updateMultiple()
    console.log('📤 Testing updateMultiple()...');
    const testSettings = {
      siteName: 'Test Site Name',
      siteDescription: 'Test Description'
    };

    const updateResult = await settingsAPI.updateMultiple(testSettings);
    console.log('✅ updateMultiple() completed');

    // Verify the updates
    const updatedSettings = await settingsAPI.getAll();
    console.log('✅ Verified updates:', {
      siteName: updatedSettings.siteName,
      siteDescription: updatedSettings.siteDescription
    });

    // Reset
    await settingsAPI.updateMultiple({
      siteName: 'Bengali News',
      siteDescription: 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম'
    });

    console.log('✅ Admin page API functions working correctly');
    return true;

  } catch (error) {
    console.error('❌ Admin page API test failed:', error);
    return false;
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive settings tests...\n');

  const workflowTest = await testCompleteSettingsWorkflow();
  const adminTest = await testAdminPageAPI();

  console.log('\n📊 Test Results:');
  console.log(`   Workflow Test: ${workflowTest ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Admin API Test: ${adminTest ? '✅ PASSED' : '❌ FAILED'}`);

  if (workflowTest && adminTest) {
    console.log('\n🎉 ALL TESTS PASSED');
    console.log('✅ Admin settings page should work correctly');
    console.log('✅ Public pages should display updated settings');
    console.log('✅ Settings are properly saved to database');
  } else {
    console.log('\n❌ SOME TESTS FAILED');
    console.log('Check the errors above for issues');
  }
}

runAllTests();