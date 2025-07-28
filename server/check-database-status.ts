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

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status with service role key...\n');

  try {
    // 1. List all tables in public schema using SQL query
    console.log('📋 LISTING ALL TABLES IN PUBLIC SCHEMA:');
    console.log('=====================================');
    
    const { data: tables, error: tablesError } = await supabaseService
      .rpc('exec_sql', {
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      });

    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError);
      return;
    }

    const tableNames = tables?.map((t: any) => t.table_name) || [];
    console.log(`Found ${tableNames.length} tables:`);
    tableNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });

    console.log('\n🔒 CHECKING RLS POLICY STATUS:');
    console.log('==============================');

    // 2. Check RLS status for each table
    for (const tableName of tableNames) {
      try {
        // Check if RLS is enabled
        const { data: rlsStatus } = await supabaseService.rpc('exec_sql', {
          sql: `SELECT relrowsecurity FROM pg_class WHERE relname = '${tableName}';`
        });

        // Get policies for this table
        const { data: policies } = await supabaseService.rpc('exec_sql', {
          sql: `
            SELECT policyname, permissive, roles, cmd, qual 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = '${tableName}'
            ORDER BY policyname;
          `
        });

        const hasRLS = rlsStatus?.[0]?.relrowsecurity || false;
        const policyCount = policies?.length || 0;

        console.log(`\n📋 Table: ${tableName}`);
        console.log(`   RLS Enabled: ${hasRLS ? '✅ YES' : '❌ NO'}`);
        console.log(`   Policies: ${policyCount}`);
        
        if (policyCount > 0) {
          policies?.forEach((policy: any, index: number) => {
            console.log(`     ${index + 1}. ${policy.policyname} (${policy.cmd})`);
          });
        }

      } catch (error) {
        console.log(`   ❌ Error checking ${tableName}:`, error);
      }
    }

    console.log('\n🔍 CHECKING SPECIFIC PROBLEMATIC TABLES:');
    console.log('=========================================');

    const problematicTables = ['user_settings', 'reading_history', 'user_storage', 'weather'];
    
    for (const tableName of problematicTables) {
      console.log(`\n🔍 Checking ${tableName}:`);
      
      try {
        // Check if table exists
        const { data: tableExists } = await supabaseService
          .from(tableName)
          .select('*')
          .limit(1);

        console.log(`   ✅ Table exists: YES`);
        console.log(`   📊 Sample data count: ${tableExists?.length || 0}`);

        // Test read access
        const { data: readTest, error: readError } = await supabaseService
          .from(tableName)
          .select('*')
          .limit(5);

        if (readError) {
          console.log(`   ❌ Read access: FAILED - ${readError.message}`);
        } else {
          console.log(`   ✅ Read access: OK (${readTest?.length || 0} rows)`);
        }

        // Test write access (safe insert)
        if (tableName === 'weather') {
          const { error: writeError } = await supabaseService
            .from(tableName)
            .upsert({ 
              city: 'Test City', 
              temperature: 25, 
              condition: 'Test',
              icon: 'test',
              forecast: {}
            });
          
          if (writeError) {
            console.log(`   ❌ Write access: FAILED - ${writeError.message}`);
          } else {
            console.log(`   ✅ Write access: OK`);
          }
        }

      } catch (error: any) {
        console.log(`   ❌ Table missing or inaccessible: ${error.message}`);
      }
    }

    console.log('\n📊 DATABASE SUMMARY:');
    console.log('====================');
    console.log(`Total tables: ${tableNames.length}`);
    console.log(`Service role key: ${serviceRoleKey ? 'CONFIGURED' : 'MISSING'}`);
    console.log(`Supabase URL: ${supabaseUrl}`);

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

// Execute the check
checkDatabaseStatus().then(() => {
  console.log('\n✅ Database status check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});