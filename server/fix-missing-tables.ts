import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create service role client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixMissingTables() {
  console.log('🔧 Fixing missing tables using service role key...');
  
  try {
    // 1. Check if user_reading_history can replace reading_history
    console.log('\n1️⃣ Testing user_reading_history as replacement for reading_history...');
    
    const { data: readingHistoryData, error: readingHistoryError } = await supabase
      .from('user_reading_history')
      .select('*')
      .limit(5);

    if (!readingHistoryError) {
      console.log('✅ user_reading_history exists and working');
      console.log(`📊 Sample data: ${readingHistoryData?.length || 0} rows`);
      
      // Test if it has the required columns
      if (readingHistoryData && readingHistoryData.length > 0) {
        const columns = Object.keys(readingHistoryData[0]);
        console.log(`📋 Columns: ${columns.join(', ')}`);
        
        const requiredColumns = ['user_id', 'article_id'];
        const hasRequired = requiredColumns.every(col => columns.includes(col));
        
        if (hasRequired) {
          console.log('✅ user_reading_history has required columns - can replace reading_history');
        } else {
          console.log('⚠️ user_reading_history missing some required columns');
        }
      }
    } else {
      console.log(`❌ user_reading_history error: ${readingHistoryError.message}`);
    }

    // 2. Check if user_storage exists, if not create it
    console.log('\n2️⃣ Checking user_storage table...');
    
    const { data: storageData, error: storageError } = await supabase
      .from('user_storage')
      .select('*')
      .limit(1);

    if (storageError && storageError.code === '42P01') {
      console.log('❌ user_storage table missing - creating it...');
      
      // Create user_storage table using SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS user_storage (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          storage_key TEXT NOT NULL,
          storage_value JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, storage_key)
        );

        -- Enable RLS
        ALTER TABLE user_storage ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view own storage" ON user_storage
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert own storage" ON user_storage
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update own storage" ON user_storage
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete own storage" ON user_storage
          FOR DELETE USING (auth.uid() = user_id);

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_user_storage_user_id ON user_storage(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_storage_key ON user_storage(storage_key);
      `;

      // Execute SQL using direct POST request
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: createTableSQL })
      });

      if (response.ok) {
        console.log('✅ user_storage table created successfully');
        
        // Test the new table
        const { data: testData, error: testError } = await supabase
          .from('user_storage')
          .select('*')
          .limit(1);

        if (!testError) {
          console.log('✅ user_storage table is working');
        } else {
          console.log(`⚠️ user_storage test failed: ${testError.message}`);
        }
      } else {
        console.log('❌ Failed to create user_storage table via RPC');
        
        // Alternative: Try manual creation using upsert
        const testUserId = '00000000-0000-0000-0000-000000000000';
        const { error: createError } = await supabase
          .from('user_storage')
          .upsert({
            user_id: testUserId,
            storage_key: 'test_key',
            storage_value: { created: 'by_service_role' }
          });

        if (createError && createError.code === '42P01') {
          console.log('❌ user_storage table does not exist and cannot be created via client');
          console.log('💡 Manual SQL execution required in Supabase dashboard');
        } else if (!createError) {
          console.log('✅ user_storage table exists and working');
        } else {
          console.log(`⚠️ user_storage creation result: ${createError.message}`);
        }
      }
    } else if (!storageError) {
      console.log('✅ user_storage table already exists and working');
      console.log(`📊 Sample data: ${storageData?.length || 0} rows`);
    } else {
      console.log(`⚠️ user_storage error: ${storageError.message}`);
    }

    // 3. Summary and recommendations
    console.log('\n📋 SUMMARY:');
    console.log('===========');
    
    const { data: userReadingCheck } = await supabase.from('user_reading_history').select('*').limit(1);
    const { data: userStorageCheck } = await supabase.from('user_storage').select('*').limit(1);
    
    console.log(`user_reading_history: ${userReadingCheck !== null ? '✅ Available' : '❌ Missing'}`);
    console.log(`user_storage: ${userStorageCheck !== null ? '✅ Available' : '❌ Missing'}`);
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================');
    console.log('1. Use user_reading_history instead of reading_history in your code');
    console.log('2. user_storage should now be available');
    console.log('3. Update your API endpoints to use the correct table names');
    console.log('4. Redeploy your Vercel application');

  } catch (error) {
    console.error('❌ Error fixing tables:', error);
  }
}

// Execute
fixMissingTables().then(() => {
  console.log('\n✅ Table fix process completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});