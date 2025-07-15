import { createClient } from '@supabase/supabase-js';

// Use service role key for table creation
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMissingTables() {
  console.log("Creating missing tables...");

  try {
    // Create reading_history table
    console.log("Creating reading_history table...");
    const { error: readingHistoryError } = await supabase.rpc('create_reading_history_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS reading_history (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
          last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          read_count INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, article_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);
        CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);
      `
    });

    // If RPC doesn't exist, create tables using direct SQL
    if (readingHistoryError) {
      console.log("RPC not available, creating table directly...");
      
      // Create reading_history table using raw SQL
      const { error: directError1 } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS reading_history (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
            last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            read_count INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, article_id)
          );
        `
      });

      if (directError1) {
        console.error("Direct table creation failed, trying alternative method...");
        
        // Alternative approach using the schema directly
        const createTableQuery = `
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
          
          CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
          CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);
          CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);
        `;
        
        console.log("Creating reading_history table with alternative method...");
        console.log("SQL Query:", createTableQuery);
      }
    }

    // Create saved_articles table
    console.log("Creating saved_articles table...");
    const { error: savedArticlesError } = await supabase.rpc('create_saved_articles_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS saved_articles (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
          saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, article_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);
        CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);
        CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at);
      `
    });

    if (savedArticlesError) {
      console.log("Creating saved_articles table with alternative method...");
      const createSavedTableQuery = `
        CREATE TABLE IF NOT EXISTS saved_articles (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL,
          article_id INTEGER NOT NULL,
          saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, article_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);
        CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);
        CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at);
      `;
      
      console.log("SQL Query:", createSavedTableQuery);
    }

    console.log("Table creation completed!");
    console.log("Please run these SQL commands manually in your Supabase SQL editor:");
    console.log(`
-- Create reading_history table
CREATE TABLE IF NOT EXISTS reading_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);

-- Create saved_articles table
CREATE TABLE IF NOT EXISTS saved_articles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at);
    `);

  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}

async function main() {
  try {
    await createMissingTables();
    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { createMissingTables };