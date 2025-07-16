/**
 * Direct Database Creation Script for User Dashboard Tables
 * This script creates all required tables directly in the database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceRoleKey);
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createUserDashboardTables() {
  console.log('🚀 Creating user dashboard tables with service role key...');
  
  const sqlCommands = [
    `
    -- Create reading_history table
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
    `,
    
    `
    -- Create saved_articles table
    CREATE TABLE IF NOT EXISTS saved_articles (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      article_id INTEGER NOT NULL,
      saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, article_id)
    );
    `,
    
    `
    -- Create user_achievements table
    CREATE TABLE IF NOT EXISTS user_achievements (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      achievement_id INTEGER NOT NULL,
      earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, achievement_id)
    );
    `,
    
    `
    -- Create user_analytics table
    CREATE TABLE IF NOT EXISTS user_analytics (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      total_interactions INTEGER DEFAULT 0,
      reading_streak INTEGER DEFAULT 0,
      favorite_categories TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id)
    );
    `,
    
    `
    -- Create achievements table
    CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(100) NOT NULL,
      requirement_type VARCHAR(50) NOT NULL,
      requirement_value INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    `
    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);
    CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);
    CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);
    CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at);
    CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
    `,
    
    `
    -- Enable Row Level Security
    ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
    ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
    `,
    
    `
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own reading history" ON reading_history;
    DROP POLICY IF EXISTS "Users can insert own reading history" ON reading_history;
    DROP POLICY IF EXISTS "Users can update own reading history" ON reading_history;
    DROP POLICY IF EXISTS "Users can delete own reading history" ON reading_history;
    
    DROP POLICY IF EXISTS "Users can view own saved articles" ON saved_articles;
    DROP POLICY IF EXISTS "Users can insert own saved articles" ON saved_articles;
    DROP POLICY IF EXISTS "Users can delete own saved articles" ON saved_articles;
    
    DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
    DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
    
    DROP POLICY IF EXISTS "Users can view own analytics" ON user_analytics;
    DROP POLICY IF EXISTS "Users can insert own analytics" ON user_analytics;
    DROP POLICY IF EXISTS "Users can update own analytics" ON user_analytics;
    
    DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
    `,
    
    `
    -- Create RLS policies for reading_history
    CREATE POLICY "Users can view own reading history" ON reading_history
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own reading history" ON reading_history
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own reading history" ON reading_history
      FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own reading history" ON reading_history
      FOR DELETE USING (auth.uid() = user_id);
    `,
    
    `
    -- Create RLS policies for saved_articles
    CREATE POLICY "Users can view own saved articles" ON saved_articles
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own saved articles" ON saved_articles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can delete own saved articles" ON saved_articles
      FOR DELETE USING (auth.uid() = user_id);
    `,
    
    `
    -- Create RLS policies for user_achievements
    CREATE POLICY "Users can view own achievements" ON user_achievements
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own achievements" ON user_achievements
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    `,
    
    `
    -- Create RLS policies for user_analytics
    CREATE POLICY "Users can view own analytics" ON user_analytics
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own analytics" ON user_analytics
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own analytics" ON user_analytics
      FOR UPDATE USING (auth.uid() = user_id);
    `,
    
    `
    -- Create RLS policies for achievements (public read)
    CREATE POLICY "Anyone can view achievements" ON achievements
      FOR SELECT USING (true);
    `
  ];
  
  try {
    // Execute all SQL commands
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i].trim();
      if (command) {
        console.log(`📝 Executing SQL command ${i + 1}/${sqlCommands.length}...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`❌ Error in command ${i + 1}:`, error.message);
          console.error('SQL:', command.substring(0, 100) + '...');
          // Continue with next command
        } else {
          console.log(`✅ Command ${i + 1} executed successfully`);
        }
      }
    }
    
    // Insert sample achievements
    console.log('🏆 Creating sample achievements...');
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .insert([
        {
          name: 'প্রথম পড়া',
          description: 'প্রথম নিবন্ধ পড়া সম্পন্ন করুন',
          icon: 'BookOpen',
          requirement_type: 'articles_read',
          requirement_value: 1
        },
        {
          name: 'নিয়মিত পাঠক',
          description: '৫টি নিবন্ধ পড়ুন',
          icon: 'Target',
          requirement_type: 'articles_read',
          requirement_value: 5
        },
        {
          name: 'সংগ্রাহক',
          description: 'প্রথম নিবন্ধ সংরক্ষণ করুন',
          icon: 'Heart',
          requirement_type: 'articles_saved',
          requirement_value: 1
        },
        {
          name: 'আগ্রহী পাঠক',
          description: '১০টি নিবন্ধ পড়ুন',
          icon: 'Award',
          requirement_type: 'articles_read',
          requirement_value: 10
        },
        {
          name: 'নিয়মিত দর্শক',
          description: '৭ দিন পরপর পড়ুন',
          icon: 'Calendar',
          requirement_type: 'reading_streak',
          requirement_value: 7
        }
      ]);
    
    if (achievementsError) {
      console.error('❌ Error creating achievements:', achievementsError.message);
    } else {
      console.log('✅ Sample achievements created successfully');
    }
    
    console.log('🎉 All user dashboard tables created successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error during table creation:', error.message);
  }
}

async function testUserDashboardTables() {
  console.log('🧪 Testing user dashboard tables...');
  
  const tables = ['reading_history', 'saved_articles', 'user_achievements', 'user_analytics', 'achievements'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ Error testing ${table}:`, error.message);
      } else {
        console.log(`✅ ${table} table is accessible`);
      }
    } catch (error) {
      console.error(`❌ Error testing ${table}:`, error.message);
    }
  }
}

// Run the script
async function main() {
  await createUserDashboardTables();
  await testUserDashboardTables();
  console.log('✨ User dashboard database setup complete!');
}

main().catch(console.error);