import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('Creating missing tables with service key...');

  // SQL queries for creating tables
  const createReadingHistoryTable = `
    CREATE TABLE IF NOT EXISTS reading_history (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      article_id INTEGER NOT NULL,
      last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      read_count INTEGER DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, article_id)
    );
  `;

  const createSavedArticlesTable = `
    CREATE TABLE IF NOT EXISTS saved_articles (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      article_id INTEGER NOT NULL,
      saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, article_id)
    );
  `;

  // Create indexes
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);',
    'CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);',
    'CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);',
    'CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at);'
  ];

  // Enable RLS
  const enableRLS = [
    'ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;'
  ];

  // Create RLS policies
  const createPolicies = [
    `CREATE POLICY IF NOT EXISTS "Users can view own reading history" ON reading_history
      FOR SELECT USING (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS "Users can insert own reading history" ON reading_history
      FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS "Users can update own reading history" ON reading_history
      FOR UPDATE USING (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS "Users can delete own reading history" ON reading_history
      FOR DELETE USING (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS "Users can view own saved articles" ON saved_articles
      FOR SELECT USING (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS "Users can insert own saved articles" ON saved_articles
      FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `CREATE POLICY IF NOT EXISTS "Users can delete own saved articles" ON saved_articles
      FOR DELETE USING (auth.uid() = user_id);`
  ];

  try {
    // Create reading_history table
    const { error: readingHistoryError } = await supabase.rpc('exec_sql', {
      sql: createReadingHistoryTable
    });
    if (readingHistoryError) {
      console.error('Error creating reading_history table:', readingHistoryError);
    } else {
      console.log('✓ Created reading_history table');
    }

    // Create saved_articles table
    const { error: savedArticlesError } = await supabase.rpc('exec_sql', {
      sql: createSavedArticlesTable
    });
    if (savedArticlesError) {
      console.error('Error creating saved_articles table:', savedArticlesError);
    } else {
      console.log('✓ Created saved_articles table');
    }

    // Create indexes
    for (const indexSQL of createIndexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSQL });
      if (error) {
        console.error('Error creating index:', error);
      }
    }
    console.log('✓ Created all indexes');

    // Enable RLS
    for (const rlsSQL of enableRLS) {
      const { error } = await supabase.rpc('exec_sql', { sql: rlsSQL });
      if (error) {
        console.error('Error enabling RLS:', error);
      }
    }
    console.log('✓ Enabled Row Level Security');

    // Create policies
    for (const policySQL of createPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policySQL });
      if (error) {
        console.error('Error creating policy:', error);
      }
    }
    console.log('✓ Created all RLS policies');

    console.log('✅ All missing tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

// Run the function
createTables();