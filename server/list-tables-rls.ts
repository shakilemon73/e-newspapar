import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create service role client (bypasses RLS)
const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function listTablesAndRLS() {
  console.log('🔍 CHECKING SUPABASE DATABASE STATUS');
  console.log('====================================');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Service Key: ${serviceRoleKey ? 'CONFIGURED ✅' : 'MISSING ❌'}\n`);

  // List of tables we know should exist
  const expectedTables = [
    'articles', 'categories', 'breaking_news', 'video_content', 
    'audio_articles', 'epapers', 'weather', 'user_profiles',
    'user_settings', 'reading_history', 'user_storage',
    'article_ai_analysis', 'user_likes', 'user_bookmarks'
  ];

  console.log('📋 TESTING TABLE ACCESS AND RLS STATUS:');
  console.log('=======================================\n');

  for (const tableName of expectedTables) {
    console.log(`🔍 Testing table: ${tableName}`);
    
    try {
      // Test if we can access the table
      const { data, error } = await supabaseService
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ ACCESS: FAILED - ${error.message}`);
        console.log(`   🔒 RLS: ${error.code === '42501' ? 'BLOCKING' : 'UNKNOWN'}`);
      } else {
        console.log(`   ✅ ACCESS: OK`);
        console.log(`   📊 DATA: ${data?.length || 0} row(s) found`);
        console.log(`   🔒 RLS: BYPASSED (service role)`);
      }

      // Test anonymous access (simulating frontend)
      const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY!, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { data: anonData, error: anonError } = await anonClient
        .from(tableName)
        .select('*')
        .limit(1);

      if (anonError) {
        console.log(`   ❌ ANON ACCESS: FAILED - ${anonError.message}`);
        if (anonError.code === '42501') {
          console.log(`   🔒 RLS POLICY: REQUIRED (blocking anonymous)`);
        } else if (anonError.code === '42P01') {
          console.log(`   ❌ TABLE: DOES NOT EXIST`);
        }
      } else {
        console.log(`   ✅ ANON ACCESS: OK (${anonData?.length || 0} rows)`);
        console.log(`   🔓 RLS POLICY: ALLOWS ANONYMOUS READ`);
      }

    } catch (error: any) {
      console.log(`   ❌ CRITICAL ERROR: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  // Test specific problematic operations
  console.log('🧪 TESTING SPECIFIC OPERATIONS:');
  console.log('===============================\n');

  // Test weather table write (common issue)
  console.log('🌤️  Testing weather table write access:');
  try {
    const { error } = await supabaseService
      .from('weather')
      .upsert({ 
        city: 'Test', 
        temperature: 25, 
        condition: 'Test',
        icon: 'test',
        forecast: {}
      });

    if (error) {
      console.log(`   ❌ WEATHER WRITE: FAILED - ${error.message}`);
    } else {
      console.log(`   ✅ WEATHER WRITE: OK`);
    }
  } catch (error: any) {
    console.log(`   ❌ WEATHER WRITE ERROR: ${error.message}`);
  }

  // Test user_storage operations
  console.log('\n💾 Testing user_storage operations:');
  try {
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const { error } = await supabaseService
      .from('user_storage')
      .upsert({ 
        user_id: testUserId,
        storage_key: 'test_key',
        storage_value: { test: 'data' }
      });

    if (error) {
      console.log(`   ❌ USER_STORAGE WRITE: FAILED - ${error.message}`);
    } else {
      console.log(`   ✅ USER_STORAGE WRITE: OK`);
    }
  } catch (error: any) {
    console.log(`   ❌ USER_STORAGE ERROR: ${error.message}`);
  }

  // Test reading_history operations
  console.log('\n📚 Testing reading_history operations:');
  try {
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const { error } = await supabaseService
      .from('reading_history')
      .upsert({ 
        user_id: testUserId,
        article_id: 1,
        reading_progress: 50
      });

    if (error) {
      console.log(`   ❌ READING_HISTORY WRITE: FAILED - ${error.message}`);
    } else {
      console.log(`   ✅ READING_HISTORY WRITE: OK`);
    }
  } catch (error: any) {
    console.log(`   ❌ READING_HISTORY ERROR: ${error.message}`);
  }

  console.log('\n✅ DATABASE ANALYSIS COMPLETED!');
  console.log('================================');
  console.log('Next steps:');
  console.log('1. Fix any missing tables by running db/fix-vercel-errors.sql');
  console.log('2. Update RLS policies for tables with access issues');
  console.log('3. Redeploy your Vercel application');
}

// Execute the check
listTablesAndRLS().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});