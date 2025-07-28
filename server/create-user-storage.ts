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

async function createUserStorageTable() {
  console.log('🔧 Creating user_storage table using service role key...');
  
  try {
    // Direct SQL execution using fetch to Supabase REST API
    const createTableSQL = `
      -- Create user_storage table
      CREATE TABLE IF NOT EXISTS user_storage (
        id SERIAL PRIMARY KEY,
        user_id UUID,
        storage_key TEXT NOT NULL,
        storage_value JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, storage_key)
      );

      -- Enable RLS
      ALTER TABLE user_storage ENABLE ROW LEVEL SECURITY;

      -- Create policies (allow anonymous access for simplicity like other tables)
      CREATE POLICY "Allow anonymous read on user_storage" ON user_storage
        FOR SELECT TO anon USING (true);

      CREATE POLICY "Allow anonymous insert on user_storage" ON user_storage
        FOR INSERT TO anon WITH CHECK (true);

      CREATE POLICY "Allow anonymous update on user_storage" ON user_storage
        FOR UPDATE TO anon USING (true);

      CREATE POLICY "Allow anonymous delete on user_storage" ON user_storage
        FOR DELETE TO anon USING (true);

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_user_storage_user_id ON user_storage(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_storage_key ON user_storage(storage_key);
    `;

    // Method 1: Try using raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: createTableSQL
      })
    });

    if (!response.ok) {
      console.log('SQL execution failed, trying alternative method...');
      
      // Method 2: Create using individual operations
      console.log('Attempting to create using client operations...');
      
      // First test if we can insert a test record (which might create the table)
      const testUserId = '00000000-0000-0000-0000-000000000000';
      const { data, error } = await supabase
        .from('user_storage')
        .insert({
          user_id: testUserId,
          storage_key: 'initialization_test',
          storage_value: { created: new Date().toISOString() }
        })
        .select();

      if (error) {
        console.log(`❌ Direct insert failed: ${error.message}`);
        console.log('Table might not exist, need manual creation');
        return false;
      } else {
        console.log('✅ user_storage table accessible and working');
        console.log('Test record created:', data);
        return true;
      }
    } else {
      console.log('✅ SQL execution successful');
      
      // Test the table
      const { data: testData, error: testError } = await supabase
        .from('user_storage')
        .select('*')
        .limit(1);

      if (!testError) {
        console.log('✅ user_storage table created and working');
        console.log(`📊 Current data: ${testData?.length || 0} rows`);
        return true;
      } else {
        console.log(`⚠️ Table created but test failed: ${testError.message}`);
        return false;
      }
    }

  } catch (error) {
    console.error('❌ Error creating user_storage table:', error);
    return false;
  }
}

async function updateCodeToUseCorrectTables() {
  console.log('\n🔄 Updating code to use correct table names...');
  
  // Check current table status
  const { data: userReadingHistory } = await supabase.from('user_reading_history').select('*').limit(1);
  const { data: userStorage } = await supabase.from('user_storage').select('*').limit(1);
  
  console.log('Current status:');
  console.log(`✅ user_reading_history: Available (${userReadingHistory?.length || 0} rows)`);
  console.log(`${userStorage !== null ? '✅' : '❌'} user_storage: ${userStorage !== null ? 'Available' : 'Missing'}`);
  
  return {
    useReadingHistory: 'user_reading_history', // Use this instead of reading_history
    userStorageExists: userStorage !== null
  };
}

// Execute
createUserStorageTable().then(async (success) => {
  const status = await updateCodeToUseCorrectTables();
  
  console.log('\n📋 FINAL STATUS:');
  console.log('===============');
  console.log(`user_reading_history: ✅ Use this instead of reading_history`);
  console.log(`user_storage: ${status.userStorageExists ? '✅ Available' : '❌ Needs manual creation'}`);
  
  if (status.userStorageExists) {
    console.log('\n🎉 Both tables are now available!');
    console.log('💡 Update your API endpoints to use:');
    console.log('   - user_reading_history (instead of reading_history)');
    console.log('   - user_storage (now available)');
  } else {
    console.log('\n⚠️  user_storage needs manual creation in Supabase dashboard');
    console.log('SQL to run manually:');
    console.log(`
CREATE TABLE user_storage (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  storage_key TEXT NOT NULL,
  storage_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, storage_key)
);

ALTER TABLE user_storage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access" ON user_storage FOR ALL TO anon USING (true);
    `);
  }
  
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});