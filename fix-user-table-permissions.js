import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixUserTablePermissions() {
  console.log('🔧 Fixing user table permissions and RLS policies...');

  try {
    // Check which user-related tables exist
    const tables = [
      'user_profiles', 'user_settings', 'user_reading_history', 
      'user_interactions', 'user_bookmarks', 'user_likes', 
      'user_shares', 'user_notifications', 'user_achievements',
      'user_activity', 'user_badges', 'user_analytics', 
      'user_storage', 'users'
    ];

    for (const tableName of tables) {
      console.log(`\n📋 Checking table: ${tableName}`);
      
      // Test table access
      const { data, error } = await adminSupabase
        .from(tableName)
        .select('count(*)')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`⚠️ Table '${tableName}' does not exist`);
        } else if (error.code === '42501') {
          console.log(`❌ Permission denied for table '${tableName}': ${error.message}`);
          
          // Try to fix RLS policies for this table
          await fixRLSPolicies(tableName);
        } else {
          console.log(`⚠️ Error accessing '${tableName}': ${error.message}`);
        }
      } else {
        console.log(`✅ Table '${tableName}' accessible`);
      }
    }

    // Check weather table specifically (from error logs)
    console.log(`\n📋 Fixing weather table RLS policies...`);
    await fixWeatherTableRLS();

  } catch (error) {
    console.error('❌ Error fixing user table permissions:', error);
  }
}

async function fixRLSPolicies(tableName) {
  console.log(`🔧 Fixing RLS policies for ${tableName}...`);
  
  try {
    // Common RLS policy fixes using direct PostgreSQL
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();
    
    // Enable RLS if not already enabled
    await client.query(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`);
    
    // Drop existing conflicting policies
    await client.query(`DROP POLICY IF EXISTS "Users can view own ${tableName}" ON ${tableName};`);
    await client.query(`DROP POLICY IF EXISTS "Users can insert own ${tableName}" ON ${tableName};`);
    await client.query(`DROP POLICY IF EXISTS "Users can update own ${tableName}" ON ${tableName};`);
    await client.query(`DROP POLICY IF EXISTS "Service role full access" ON ${tableName};`);
    
    // Create new policies
    if (tableName.startsWith('user_')) {
      // User-specific table policies
      await client.query(`
        CREATE POLICY "Users can manage own data" ON ${tableName}
        FOR ALL TO authenticated 
        USING (auth.uid()::text = user_id::text)
        WITH CHECK (auth.uid()::text = user_id::text);
      `);
    } else {
      // General table policies
      await client.query(`
        CREATE POLICY "Public read access" ON ${tableName}
        FOR SELECT USING (true);
      `);
    }
    
    // Service role always has full access
    await client.query(`
      CREATE POLICY "Service role full access" ON ${tableName}
      FOR ALL TO service_role USING (true);
    `);
    
    await client.release();
    await pool.end();
    
    console.log(`✅ Fixed RLS policies for ${tableName}`);
    
  } catch (error) {
    console.log(`⚠️ Could not fix RLS policies for ${tableName}: ${error.message}`);
  }
}

async function fixWeatherTableRLS() {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();
    
    // Fix weather table RLS policies
    await client.query(`
      DROP POLICY IF EXISTS "Weather is viewable by everyone" ON weather;
      DROP POLICY IF EXISTS "Service role can manage weather" ON weather;
      
      CREATE POLICY "Weather is viewable by everyone" ON weather
      FOR SELECT USING (true);
      
      CREATE POLICY "Service role can manage weather" ON weather
      FOR ALL TO service_role USING (true);
      
      CREATE POLICY "Authenticated users can update weather" ON weather
      FOR INSERT TO authenticated USING (true);
      
      CREATE POLICY "System can update weather" ON weather
      FOR UPDATE USING (true);
    `);
    
    await client.release();
    await pool.end();
    
    console.log('✅ Fixed weather table RLS policies');
    
  } catch (error) {
    console.log(`⚠️ Could not fix weather table RLS: ${error.message}`);
  }
}

fixUserTablePermissions().then(() => {
  console.log('🎉 User table permissions fix completed');
  process.exit(0);
}).catch(err => {
  console.error('💥 Process failed:', err);
  process.exit(1);
});