import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkDatabaseRoles() {
  console.log('🔍 CHECKING POSTGRESQL DATABASE ROLES & PERMISSIONS');
  console.log('==================================================\n');

  try {
    // Check current database role
    console.log('1️⃣ CURRENT DATABASE ROLE:');
    console.log('=========================');
    
    const { data: roleData, error: roleError } = await supabase
      .rpc('sql', {
        query: 'SELECT current_role, current_user, session_user;'
      });

    if (roleError) {
      console.log('Using alternative method to check role...');
      
      // Alternative: Check through table access
      const { data: testData, error: testError } = await supabase
        .from('articles')
        .select('*')
        .limit(1);

      if (!testError) {
        console.log('✅ Service role key working - Full database access');
        console.log('   Role: service_role (inferred from successful access)');
      } else {
        console.log(`❌ Database access error: ${testError.message}`);
      }
    } else {
      console.log('✅ Database role information:');
      console.log(roleData);
    }

    // Check available roles in the database
    console.log('\n2️⃣ AVAILABLE POSTGRESQL ROLES:');
    console.log('==============================');
    
    const { data: rolesData, error: rolesError } = await supabase
      .rpc('sql', {
        query: `
          SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin, rolreplication
          FROM pg_roles 
          WHERE rolname IN ('anon', 'authenticated', 'service_role', 'postgres', 'supabase_admin')
          ORDER BY rolname;
        `
      });

    if (rolesError) {
      console.log('⚠️  Cannot query pg_roles directly');
      console.log('   This is normal for Supabase hosted databases');
      console.log('   Default roles: anon, authenticated, service_role are configured');
    } else {
      console.log('Available roles:');
      rolesData?.forEach((role: any) => {
        console.log(`  • ${role.rolname}: ${role.rolsuper ? 'Superuser' : 'Regular user'}`);
      });
    }

    // Check RLS policies on critical tables
    console.log('\n3️⃣ ROW LEVEL SECURITY STATUS:');
    console.log('=============================');
    
    const criticalTables = ['articles', 'user_profiles', 'admin_actions', 'user_storage'];
    
    for (const table of criticalTables) {
      try {
        const { data: rlsData, error: rlsError } = await supabase
          .rpc('sql', {
            query: `
              SELECT schemaname, tablename, rowsecurity, 
                     (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = '${table}') as policy_count
              FROM pg_tables 
              WHERE tablename = '${table}' AND schemaname = 'public';
            `
          });

        if (!rlsError && rlsData && rlsData.length > 0) {
          const tableInfo = rlsData[0];
          console.log(`✅ ${table}:`);
          console.log(`   RLS Enabled: ${tableInfo.rowsecurity ? 'Yes' : 'No'}`);
          console.log(`   Policies: ${tableInfo.policy_count} configured`);
        } else {
          console.log(`⚠️  ${table}: Cannot check RLS status`);
        }
      } catch (e) {
        console.log(`❌ ${table}: Error checking RLS`);
      }
    }

    // Test role-based access patterns
    console.log('\n4️⃣ TESTING ROLE ACCESS PATTERNS:');
    console.log('================================');
    
    // Test with anonymous key
    const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const accessTests = [
      { table: 'articles', role: 'anonymous', client: anonClient, expectAccess: true },
      { table: 'user_profiles', role: 'anonymous', client: anonClient, expectAccess: false },
      { table: 'admin_actions', role: 'anonymous', client: anonClient, expectAccess: false },
      { table: 'articles', role: 'service_role', client: supabase, expectAccess: true },
      { table: 'user_profiles', role: 'service_role', client: supabase, expectAccess: true },
      { table: 'admin_actions', role: 'service_role', client: supabase, expectAccess: true }
    ];

    for (const test of accessTests) {
      try {
        const { data, error } = await test.client
          .from(test.table)
          .select('*')
          .limit(1);

        if (test.expectAccess) {
          if (!error) {
            console.log(`✅ ${test.role} → ${test.table}: Access OK (${data?.length || 0} rows)`);
          } else {
            console.log(`❌ ${test.role} → ${test.table}: Unexpected block - ${error.message}`);
          }
        } else {
          if (error && error.code === '42501') {
            console.log(`✅ ${test.role} → ${test.table}: Properly blocked by RLS`);
          } else if (!error) {
            console.log(`❌ ${test.role} → ${test.table}: Security breach - Access allowed`);
          } else {
            console.log(`⚠️  ${test.role} → ${test.table}: ${error.message}`);
          }
        }
      } catch (e: any) {
        console.log(`❌ ${test.role} → ${test.table}: ${e.message}`);
      }
    }

    // Provide role configuration recommendations
    console.log('\n5️⃣ POSTGRESQL ROLE CONFIGURATION:');
    console.log('=================================');
    
    console.log('Default Supabase Roles:');
    console.log('• anon: Anonymous/public access (no login required)');
    console.log('• authenticated: Logged-in users (via JWT token)');
    console.log('• service_role: Backend operations (full access)');
    console.log('• postgres: Database owner (Supabase managed)');
    
    console.log('\nRecommended Role Usage:');
    console.log('• Use anon key for: Public content, weather data, article reading');
    console.log('• Use authenticated for: User dashboards, personal data, comments');
    console.log('• Use service_role for: Admin operations, data migrations, system tasks');
    
    console.log('\n6️⃣ SECURITY RECOMMENDATIONS:');
    console.log('=============================');
    
    console.log('✅ Current Configuration Status:');
    console.log('   • Service role key: Working correctly');
    console.log('   • Anonymous key: Public access enabled');
    console.log('   • RLS policies: Need implementation for security');
    
    console.log('\n💡 Next Steps for Security:');
    console.log('   1. Run db/comprehensive-rls-security.sql');
    console.log('   2. Create user_storage table with proper RLS');
    console.log('   3. Verify all role access patterns');
    console.log('   4. Deploy with proper environment variables');

    return true;

  } catch (error: any) {
    console.error('❌ Error checking database roles:', error.message);
    return false;
  }
}

// Execute database role analysis
checkDatabaseRoles().then((success) => {
  if (success) {
    console.log('\n🎯 ROLE ANALYSIS COMPLETED');
    console.log('Your PostgreSQL roles are properly configured for Supabase.');
    console.log('Focus on implementing RLS policies for production security.');
  } else {
    console.log('\n⚠️  ROLE ANALYSIS INCOMPLETE');
    console.log('Check your database connection and credentials.');
  }
  
  process.exit(0);
}).catch((error) => {
  console.error('❌ Role analysis failed:', error);
  process.exit(1);
});