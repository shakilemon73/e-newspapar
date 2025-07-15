import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Database connection using the DATABASE_URL from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('Creating missing tables...');

    // Create reading_history table
    await client.query(`
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
    `);
    console.log('✓ Created reading_history table');

    // Create saved_articles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_articles (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        article_id INTEGER NOT NULL,
        saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, article_id)
      );
    `);
    console.log('✓ Created saved_articles table');

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);',
      'CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);',
      'CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);',
      'CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at);'
    ];

    for (const indexSQL of indexes) {
      await client.query(indexSQL);
    }
    console.log('✓ Created all indexes');

    // Enable Row Level Security
    await client.query('ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;');
    console.log('✓ Enabled Row Level Security');

    // Create RLS policies
    const policies = [
      `CREATE POLICY "Users can view own reading history" ON reading_history
        FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert own reading history" ON reading_history
        FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update own reading history" ON reading_history
        FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can delete own reading history" ON reading_history
        FOR DELETE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can view own saved articles" ON saved_articles
        FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert own saved articles" ON saved_articles
        FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can delete own saved articles" ON saved_articles
        FOR DELETE USING (auth.uid() = user_id);`
    ];

    for (const policySQL of policies) {
      try {
        await client.query(policySQL);
      } catch (error) {
        if (error.code !== '42710') { // Policy already exists
          console.warn('Policy creation warning:', error.message);
        }
      }
    }
    console.log('✓ Created all RLS policies');

    console.log('✅ All missing tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();