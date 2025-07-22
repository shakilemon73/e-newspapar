import { supabase } from './supabase';

async function createReadingHistoryTable() {
  try {
    console.log('Creating reading_history table...');

    // Create reading_history table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS reading_history (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
          last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          read_count INTEGER DEFAULT 1,
          reading_time_seconds INTEGER DEFAULT 0,
          scroll_percentage FLOAT DEFAULT 0,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, article_id)
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);
        CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at DESC);

        -- Enable RLS
        ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        DROP POLICY IF EXISTS "Users can view own reading history" ON reading_history;
        CREATE POLICY "Users can view own reading history" ON reading_history
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can insert own reading history" ON reading_history;  
        CREATE POLICY "Users can insert own reading history" ON reading_history
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own reading history" ON reading_history;
        CREATE POLICY "Users can update own reading history" ON reading_history
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    if (error) {
      console.error('Error creating reading_history table:', error);
      return;
    }

    console.log('✅ reading_history table created successfully');

    // Now create some sample reading history data
    const { data: { users } } = await supabase.auth.admin.listUsers();
    if (users.length === 0) {
      console.log('No users found for sample data');
      return;
    }

    const testUser = users[0];
    console.log(`Creating sample reading history for user: ${testUser.email}`);

    // Get some articles for reading history
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title')
      .limit(5);

    if (!articles || articles.length === 0) {
      console.log('No articles found for sample data');
      return;
    }

    // Create sample reading history entries
    for (let i = 0; i < Math.min(4, articles.length); i++) {
      const { error } = await supabase
        .from('reading_history')
        .insert({
          user_id: testUser.id,
          article_id: articles[i].id,
          last_read_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          read_count: Math.floor(Math.random() * 5) + 1,
          reading_time_seconds: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
          scroll_percentage: Math.random() * 100,
          completed: Math.random() > 0.5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error && error.code !== '23505') { // Ignore duplicates
        console.error(`Error creating reading history for article ${articles[i].id}:`, error);
      } else {
        console.log(`✅ Created reading history for article: ${articles[i].title}`);
      }
    }

    // Verify the data
    const { count } = await supabase
      .from('reading_history')
      .select('*', { count: 'exact' })
      .eq('user_id', testUser.id);

    console.log(`\n✅ Reading history table setup complete!`);
    console.log(`📊 Sample data created: ${count || 0} reading history entries`);

  } catch (error) {
    console.error('Error in createReadingHistoryTable:', error);
  }
}

createReadingHistoryTable();