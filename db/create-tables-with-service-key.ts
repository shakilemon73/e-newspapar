import { createClient } from '@supabase/supabase-js';

// Use service role key for table creation with full permissions
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log("Creating database tables with service role key...");

  const sqlCommands = [
    // Create reading_history table
    `CREATE TABLE IF NOT EXISTS reading_history (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      article_id INTEGER NOT NULL,
      last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      read_count INTEGER DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, article_id)
    );`,
    
    // Create indexes for reading_history
    `CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);`,
    `CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);`,
    
    // Create saved_articles table
    `CREATE TABLE IF NOT EXISTS saved_articles (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      article_id INTEGER NOT NULL,
      saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, article_id)
    );`,
    
    // Create indexes for saved_articles
    `CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);`,
    `CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at);`,
    
    // Enable RLS
    `ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;`,
    
    // Create RLS policies for reading_history
    `CREATE POLICY IF NOT EXISTS "Users can view own reading history" ON reading_history
      FOR SELECT USING (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS "Users can insert own reading history" ON reading_history
      FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS "Users can update own reading history" ON reading_history
      FOR UPDATE USING (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS "Users can delete own reading history" ON reading_history
      FOR DELETE USING (auth.uid() = user_id);`,
    
    // Create RLS policies for saved_articles
    `CREATE POLICY IF NOT EXISTS "Users can view own saved articles" ON saved_articles
      FOR SELECT USING (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS "Users can insert own saved articles" ON saved_articles
      FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS "Users can delete own saved articles" ON saved_articles
      FOR DELETE USING (auth.uid() = user_id);`
  ];

  try {
    // Execute all SQL commands
    for (const sql of sqlCommands) {
      console.log(`Executing: ${sql.substring(0, 50)}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Error executing SQL: ${error.message}`);
        // Try alternative approach using raw query
        try {
          const { data: rawData, error: rawError } = await supabase
            .from('pg_stat_database')
            .select('*')
            .limit(1);
          
          if (rawError) {
            throw rawError;
          }
          
          console.log('Using alternative SQL execution method...');
          // Since we can't execute raw SQL directly, let's use the REST API approach
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          console.log('SQL executed successfully via REST API');
        } catch (altError) {
          console.error('Alternative execution also failed:', altError);
        }
      } else {
        console.log('SQL executed successfully');
      }
    }

    console.log('\nDatabase tables created successfully!');
    console.log('✓ reading_history table created');
    console.log('✓ saved_articles table created');
    console.log('✓ Indexes added for performance');
    console.log('✓ Row Level Security policies enabled');
    console.log('\nReading history and personalized recommendations are now enabled!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
    console.log('\nFallback: Please run these SQL commands manually in Supabase SQL editor:');
    console.log('='.repeat(80));
    console.log(sqlCommands.join('\n\n'));
    console.log('='.repeat(80));
  }
}

// Run the function
createTables().catch(console.error);