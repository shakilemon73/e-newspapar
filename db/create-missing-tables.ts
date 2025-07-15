import { supabase } from '../server/supabase';

async function createMissingTables() {
  console.log('Creating missing tables...');

  // Create reading_history table
  const { error: readingHistoryError } = await supabase.rpc('exec_sql', {
    sql: `
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
    `
  });

  if (readingHistoryError) {
    console.error('Error creating reading_history table:', readingHistoryError);
  } else {
    console.log('✓ Created reading_history table');
  }

  // Create saved_articles table
  const { error: savedArticlesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS saved_articles (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        article_id INTEGER NOT NULL,
        saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, article_id)
      );
    `
  });

  if (savedArticlesError) {
    console.error('Error creating saved_articles table:', savedArticlesError);
  } else {
    console.log('✓ Created saved_articles table');
  }

  // Create indexes for performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);',
    'CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);',
    'CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);',
    'CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at);'
  ];

  for (const indexSql of indexes) {
    const { error } = await supabase.rpc('exec_sql', { sql: indexSql });
    if (error) {
      console.error('Error creating index:', error);
    }
  }

  console.log('✓ Created all indexes');

  // Enable Row Level Security
  const rlsCommands = [
    'ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;'
  ];

  for (const rlsCommand of rlsCommands) {
    const { error } = await supabase.rpc('exec_sql', { sql: rlsCommand });
    if (error) {
      console.error('Error enabling RLS:', error);
    }
  }

  console.log('✓ Enabled Row Level Security');

  // Create RLS policies
  const policies = [
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

  for (const policy of policies) {
    const { error } = await supabase.rpc('exec_sql', { sql: policy });
    if (error) {
      console.error('Error creating policy:', error);
    }
  }

  console.log('✓ Created all RLS policies');
}

async function main() {
  try {
    await createMissingTables();
    console.log('✅ All missing tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating missing tables:', error);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createMissingTables };