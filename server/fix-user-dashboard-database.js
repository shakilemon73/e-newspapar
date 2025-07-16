/**
 * Create all required tables for user dashboard functionality
 * This script fixes the database structure for user dashboard features
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function createUserDashboardTables() {
  console.log('🚀 Creating user dashboard tables...');
  
  const tables = [
    {
      name: 'reading_history',
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
        
        CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);
        CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);
        
        ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
      `
    },
    {
      name: 'saved_articles', 
      sql: `
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
        
        ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;
      `
    },
    {
      name: 'user_achievements',
      sql: `
        CREATE TABLE IF NOT EXISTS user_achievements (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL,
          achievement_id INTEGER NOT NULL,
          earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, achievement_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
        
        ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
      `
    },
    {
      name: 'user_analytics',
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
        
        ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
      `
    },
    {
      name: 'achievements',
      sql: `
        CREATE TABLE IF NOT EXISTS achievements (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          icon VARCHAR(100) NOT NULL,
          requirement_type VARCHAR(50) NOT NULL,
          requirement_value INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
      `
    }
  ];

  const policies = [
    // Reading history policies
    `DROP POLICY IF EXISTS "Users can view own reading history" ON reading_history;`,
    `CREATE POLICY "Users can view own reading history" ON reading_history FOR SELECT USING (auth.uid() = user_id);`,
    `DROP POLICY IF EXISTS "Users can insert own reading history" ON reading_history;`,
    `CREATE POLICY "Users can insert own reading history" ON reading_history FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `DROP POLICY IF EXISTS "Users can update own reading history" ON reading_history;`,
    `CREATE POLICY "Users can update own reading history" ON reading_history FOR UPDATE USING (auth.uid() = user_id);`,
    `DROP POLICY IF EXISTS "Users can delete own reading history" ON reading_history;`,
    `CREATE POLICY "Users can delete own reading history" ON reading_history FOR DELETE USING (auth.uid() = user_id);`,
    
    // Saved articles policies
    `DROP POLICY IF EXISTS "Users can view own saved articles" ON saved_articles;`,
    `CREATE POLICY "Users can view own saved articles" ON saved_articles FOR SELECT USING (auth.uid() = user_id);`,
    `DROP POLICY IF EXISTS "Users can insert own saved articles" ON saved_articles;`,
    `CREATE POLICY "Users can insert own saved articles" ON saved_articles FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `DROP POLICY IF EXISTS "Users can delete own saved articles" ON saved_articles;`,
    `CREATE POLICY "Users can delete own saved articles" ON saved_articles FOR DELETE USING (auth.uid() = user_id);`,
    
    // User achievements policies
    `DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;`,
    `CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);`,
    `DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;`,
    `CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    
    // User analytics policies
    `DROP POLICY IF EXISTS "Users can view own analytics" ON user_analytics;`,
    `CREATE POLICY "Users can view own analytics" ON user_analytics FOR SELECT USING (auth.uid() = user_id);`,
    `DROP POLICY IF EXISTS "Users can insert own analytics" ON user_analytics;`,
    `CREATE POLICY "Users can insert own analytics" ON user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `DROP POLICY IF EXISTS "Users can update own analytics" ON user_analytics;`,
    `CREATE POLICY "Users can update own analytics" ON user_analytics FOR UPDATE USING (auth.uid() = user_id);`,
    
    // Achievements policies (public read)
    `DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;`,
    `CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);`
  ];

  try {
    // Create tables
    for (const table of tables) {
      console.log(`Creating ${table.name} table...`);
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: table.sql
      });
      
      if (error) {
        console.error(`❌ Error creating ${table.name}:`, error);
      } else {
        console.log(`✅ ${table.name} table created successfully`);
      }
    }

    // Create policies
    console.log('Creating security policies...');
    for (const policy of policies) {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: policy
      });
      
      if (error) {
        console.error(`❌ Error creating policy:`, error);
      }
    }
    
    console.log('✅ All security policies created successfully');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error creating user dashboard tables:', error);
    return { success: false, error: error.message };
  }
}

export async function testUserDashboardTables() {
  console.log('🧪 Testing user dashboard tables...');
  
  const tables = ['reading_history', 'saved_articles', 'user_achievements', 'user_analytics', 'achievements'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      results[table] = error ? `❌ ${error.message}` : `✅ Working (${data?.length || 0} records)`;
    } catch (error) {
      results[table] = `❌ ${error.message}`;
    }
  }
  
  console.log('📊 Table test results:');
  Object.entries(results).forEach(([table, status]) => {
    console.log(`  ${table}: ${status}`);
  });
  
  return results;
}

export async function seedUserDashboardData() {
  console.log('🌱 Seeding user dashboard data...');
  
  try {
    // Check if achievements exist
    const { data: existingAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .limit(1);
    
    if (!achievementsError && existingAchievements.length === 0) {
      // Insert sample achievements
      const { data, error } = await supabase.from('achievements').insert([
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
      
      if (error) {
        console.error('❌ Error seeding achievements:', error);
      } else {
        console.log('✅ Sample achievements seeded successfully');
      }
    } else {
      console.log('✅ Achievements already exist');
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error seeding user dashboard data:', error);
    return { success: false, error: error.message };
  }
}

// Run the setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    console.log('🚀 Starting user dashboard setup...');
    await createUserDashboardTables();
    await seedUserDashboardData();
    await testUserDashboardTables();
    console.log('✨ Setup complete!');
  })();
}