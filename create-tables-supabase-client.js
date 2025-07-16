/**
 * Create advanced tables using Supabase client with individual table creation
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdvancedTablesViaSupabase() {
  console.log('🚀 Creating advanced tables via Supabase client...');
  
  // Create tables one by one using individual INSERT operations
  const tables = [
    {
      name: 'user_notifications',
      columns: {
        id: 'SERIAL PRIMARY KEY',
        user_id: 'UUID',
        title: 'TEXT NOT NULL',
        content: 'TEXT NOT NULL',
        type: 'VARCHAR(50) DEFAULT \'info\'',
        is_read: 'BOOLEAN DEFAULT FALSE',
        action_url: 'TEXT',
        metadata: 'JSONB DEFAULT \'{}\'',
        created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
        read_at: 'TIMESTAMP WITH TIME ZONE',
        expires_at: 'TIMESTAMP WITH TIME ZONE'
      }
    },
    {
      name: 'user_sessions',
      columns: {
        id: 'SERIAL PRIMARY KEY',
        user_id: 'UUID',
        session_start: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
        session_end: 'TIMESTAMP WITH TIME ZONE',
        pages_visited: 'INTEGER DEFAULT 0',
        articles_read: 'INTEGER DEFAULT 0',
        time_spent: 'INTEGER DEFAULT 0',
        device_info: 'JSONB DEFAULT \'{}\'',
        ip_address: 'INET',
        user_agent: 'TEXT',
        created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()'
      }
    },
    {
      name: 'reading_goals',
      columns: {
        id: 'SERIAL PRIMARY KEY',
        user_id: 'UUID',
        goal_type: 'VARCHAR(50) NOT NULL',
        target_value: 'INTEGER NOT NULL',
        current_value: 'INTEGER DEFAULT 0',
        time_period: 'VARCHAR(20) DEFAULT \'monthly\'',
        start_date: 'DATE DEFAULT CURRENT_DATE',
        end_date: 'DATE',
        is_active: 'BOOLEAN DEFAULT TRUE',
        is_completed: 'BOOLEAN DEFAULT FALSE',
        completed_at: 'TIMESTAMP WITH TIME ZONE',
        reward_claimed: 'BOOLEAN DEFAULT FALSE',
        metadata: 'JSONB DEFAULT \'{}\'',
        created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
        updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()'
      }
    },
    {
      name: 'performance_metrics',
      columns: {
        id: 'SERIAL PRIMARY KEY',
        metric_name: 'VARCHAR(100) NOT NULL',
        metric_value: 'DECIMAL(10,4) NOT NULL',
        metric_type: 'VARCHAR(50) NOT NULL',
        category: 'VARCHAR(50)',
        metadata: 'JSONB DEFAULT \'{}\'',
        timestamp: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
        created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()'
      }
    },
    {
      name: 'user_feedback',
      columns: {
        id: 'SERIAL PRIMARY KEY',
        user_id: 'UUID',
        article_id: 'INTEGER',
        rating: 'INTEGER CHECK (rating >= 1 AND rating <= 5)',
        comment: 'TEXT',
        feedback_type: 'VARCHAR(50) DEFAULT \'rating\'',
        is_helpful: 'BOOLEAN',
        tags: 'TEXT[]',
        metadata: 'JSONB DEFAULT \'{}\'',
        created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
        updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()'
      }
    }
  ];

  // Test the connection first
  console.log('Testing Supabase connection...');
  const { data: connectionTest, error: connectionError } = await supabase
    .from('categories')
    .select('count')
    .limit(1);

  if (connectionError) {
    console.error('❌ Connection test failed:', connectionError);
    return;
  }

  console.log('✅ Supabase connection working');

  // Use the existing working tables as a base - try to create missing ones
  const results = [];

  for (const table of tables) {
    try {
      console.log(`Attempting to create table: ${table.name}...`);
      
      // First, try to check if table exists by querying it
      const { data: existsCheck, error: existsError } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);

      if (!existsError) {
        console.log(`✅ Table ${table.name} already exists`);
        results.push({ table: table.name, success: true, status: 'exists' });
        continue;
      }

      // Try to create sample data to test if we can interact with the table
      if (table.name === 'reading_goals') {
        const { error: insertError } = await supabase
          .from(table.name)
          .insert([
            {
              user_id: '00000000-0000-0000-0000-000000000001',
              goal_type: 'articles_read',
              target_value: 50,
              time_period: 'monthly'
            }
          ]);

        if (insertError) {
          console.log(`❌ Cannot insert into ${table.name}:`, insertError.message);
          results.push({ table: table.name, success: false, error: insertError.message });
        } else {
          console.log(`✅ Can insert into ${table.name} - table working`);
          results.push({ table: table.name, success: true, status: 'working' });
        }
      } else if (table.name === 'performance_metrics') {
        const { error: insertError } = await supabase
          .from(table.name)
          .insert([
            {
              metric_name: 'test_metric',
              metric_value: 1.0,
              metric_type: 'test',
              category: 'test'
            }
          ]);

        if (insertError) {
          console.log(`❌ Cannot insert into ${table.name}:`, insertError.message);
          results.push({ table: table.name, success: false, error: insertError.message });
        } else {
          console.log(`✅ Can insert into ${table.name} - table working`);
          results.push({ table: table.name, success: true, status: 'working' });
        }
      } else {
        console.log(`⚠️  Table ${table.name} does not exist and cannot be created via Supabase client`);
        results.push({ table: table.name, success: false, error: 'Table does not exist' });
      }

    } catch (error) {
      console.error(`❌ Error with table ${table.name}:`, error.message);
      results.push({ table: table.name, success: false, error: error.message });
    }
  }

  console.log('\n🎉 Advanced tables check completed!');
  console.log('Results:', results);
  
  return results;
}

// Run the script
createAdvancedTablesViaSupabase()
  .then(() => {
    console.log('\n✅ Table creation attempt completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });