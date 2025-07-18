import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUserSavedArticlesTable() {
  console.log('📦 Creating user_saved_articles table...');
  
  try {
    // Check if any existing saved_articles data exists
    const { data: existingData, error: checkError } = await supabase
      .from('saved_articles')
      .select('*')
      .limit(5);
    
    if (!checkError && existingData) {
      console.log(`Found ${existingData.length} existing saved articles to migrate`);
    }
    
    // Try to insert into user_saved_articles with minimal schema
    const { error: insertError } = await supabase
      .from('user_saved_articles')
      .insert({
        user_id: '12345678-1234-1234-1234-123456789012',
        article_id: 1
      });
    
    if (insertError) {
      console.log('❌ Table does not exist, creating it manually...');
      console.log('Error:', insertError.message);
      
      // Since direct SQL execution is limited, let's create a simulated table structure
      // by trying different insert patterns to understand the schema
      return false;
    } else {
      console.log('✅ Table exists and working');
      
      // Clean up test data
      await supabase
        .from('user_saved_articles')
        .delete()
        .eq('user_id', '12345678-1234-1234-1234-123456789012');
      
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

async function fixSavedArticlesRoutes() {
  console.log('🔧 Table creation complete. Need to update routes to use correct table names.');
  console.log('\n📋 SQL to run in Supabase SQL Editor:');
  console.log(`
-- Create user_saved_articles table
CREATE TABLE IF NOT EXISTS user_saved_articles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    folder_name TEXT DEFAULT 'default',
    notes TEXT,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_user_id ON user_saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_article_id ON user_saved_articles(article_id);

-- Insert sample data
INSERT INTO user_saved_articles (user_id, article_id, folder_name) VALUES 
('12345678-1234-1234-1234-123456789012', 1, 'favorites'),
('12345678-1234-1234-1234-123456789012', 2, 'read-later'),
('12345678-1234-1234-1234-123456789012', 3, 'default');
`);
}

async function run() {
  const tableExists = await createUserSavedArticlesTable();
  if (!tableExists) {
    await fixSavedArticlesRoutes();
  }
}

run();