// Fix RLS policies for articles table to allow admin access
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixArticlesRLS() {
  console.log('🔧 Fixing RLS policies for articles table...');
  
  try {
    // First check current policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
              FROM pg_policies 
              WHERE tablename = 'articles' 
              ORDER BY policyname;`
      });
    
    if (policiesError) {
      console.error('Error checking policies:', policiesError);
    } else {
      console.log('Current articles policies:', policies);
    }

    // Drop existing restrictive policies that might block admin access
    const dropPolicies = [
      "DROP POLICY IF EXISTS \"Enable read access for anon\" ON articles;",
      "DROP POLICY IF EXISTS \"Allow anonymous access\" ON articles;", 
      "DROP POLICY IF EXISTS \"Users can only read published articles\" ON articles;",
      "DROP POLICY IF EXISTS \"Only authenticated users can create\" ON articles;"
    ];

    for (const sql of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log(`Policy drop (expected): ${error.message}`);
      }
    }

    // Create comprehensive articles RLS policies
    const createPolicies = [
      // Public read access for published articles
      `CREATE POLICY "Public read published articles" ON articles
        FOR SELECT 
        USING (published_at IS NOT NULL AND published_at <= NOW());`,
      
      // Admin full access using service role
      `CREATE POLICY "Service role full access" ON articles
        FOR ALL TO service_role
        USING (true)
        WITH CHECK (true);`,
      
      // Admin users full access  
      `CREATE POLICY "Admin users full access" ON articles
        FOR ALL TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
          )
        );`
    ];

    for (const sql of createPolicies) {
      console.log('Creating policy:', sql.split('\n')[0]);
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.error('Error creating policy:', error.message);
      } else {
        console.log('✅ Policy created successfully');
      }
    }

    // Verify RLS is enabled
    const { error: enableRLSError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE articles ENABLE ROW LEVEL SECURITY;"
    });
    
    if (enableRLSError && !enableRLSError.message.includes('already enabled')) {
      console.error('Error enabling RLS:', enableRLSError);
    } else {
      console.log('✅ RLS is enabled on articles table');
    }

    console.log('🎉 Articles RLS policies fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error);
  }
}

// Execute the fix
fixArticlesRLS().then(() => {
  console.log('RLS fix completed');
  process.exit(0);
}).catch(err => {
  console.error('Fix failed:', err);
  process.exit(1);
});