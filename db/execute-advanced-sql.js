import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

console.log('🚀 Creating Advanced Algorithm Tables in Supabase...');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdvancedTables() {
  const sqlCommands = [
    // User Analytics Table
    `CREATE TABLE IF NOT EXISTS user_analytics (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      session_id VARCHAR(255),
      page_views INTEGER DEFAULT 0,
      total_time_spent INTEGER DEFAULT 0,
      articles_read INTEGER DEFAULT 0,
      categories_viewed TEXT[],
      device_type VARCHAR(50),
      browser_info TEXT,
      location_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Article Analytics Table
    `CREATE TABLE IF NOT EXISTS article_analytics (
      id SERIAL PRIMARY KEY,
      article_id INTEGER NOT NULL,
      view_count INTEGER DEFAULT 0,
      unique_views INTEGER DEFAULT 0,
      engagement_score DECIMAL(5,2) DEFAULT 0.0,
      trending_score DECIMAL(5,2) DEFAULT 0.0,
      average_read_time INTEGER DEFAULT 0,
      bounce_rate DECIMAL(5,2) DEFAULT 0.0,
      social_shares INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );`,
    
    // User Interactions Table
    `CREATE TABLE IF NOT EXISTS user_interactions (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      article_id INTEGER NOT NULL,
      interaction_type VARCHAR(50) NOT NULL,
      interaction_value DECIMAL(3,2) DEFAULT 1.0,
      reading_duration INTEGER DEFAULT 0,
      scroll_depth DECIMAL(5,2) DEFAULT 0.0,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );`,
    
    // User Preferences Table
    `CREATE TABLE IF NOT EXISTS user_preferences (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      category_id INTEGER NOT NULL,
      interest_score DECIMAL(5,2) DEFAULT 0.0,
      interaction_count INTEGER DEFAULT 0,
      last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, category_id),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );`,
    
    // Search History Table
    `CREATE TABLE IF NOT EXISTS search_history (
      id SERIAL PRIMARY KEY,
      user_id UUID,
      search_query TEXT NOT NULL,
      search_results_count INTEGER DEFAULT 0,
      clicked_result_id INTEGER,
      search_metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (clicked_result_id) REFERENCES articles(id) ON DELETE SET NULL
    );`,
    
    // Recommendation Cache Table
    `CREATE TABLE IF NOT EXISTS recommendation_cache (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      article_id INTEGER NOT NULL,
      recommendation_score DECIMAL(5,2) NOT NULL,
      recommendation_reason TEXT,
      algorithm_version VARCHAR(50) DEFAULT 'v1.0',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );`
  ];
  
  // Execute each SQL command using the rpc call
  for (let i = 0; i < sqlCommands.length; i++) {
    try {
      console.log(`Creating table ${i + 1}/${sqlCommands.length}...`);
      
      // Use rpc function call (if available) or direct query
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: sqlCommands[i]
      });
      
      if (error) {
        console.error(`❌ Error creating table ${i + 1}:`, error);
        
        // If rpc doesn't work, try alternative methods
        if (error.code === 'PGRST202') {
          console.log('⚠️  RPC method not available, trying alternative...');
          
          // Alternative: Try using the auth admin API
          const response = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/admin/users`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log('✅ Service role key is valid');
            console.log('📋 Please execute the following SQL commands manually in your Supabase SQL Editor:');
            console.log('\\n' + sqlCommands[i]);
          } else {
            console.error('❌ Service role key validation failed');
          }
        }
      } else {
        console.log(`✅ Table ${i + 1} created successfully`);
      }
    } catch (error) {
      console.error(`❌ Exception in table ${i + 1}:`, error.message);
    }
  }
  
  // Verify tables were created
  console.log('\\n🔍 Verifying table creation...');
  
  const tableNames = ['user_analytics', 'article_analytics', 'user_interactions', 'user_preferences', 'search_history', 'recommendation_cache'];
  
  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: Table exists and accessible`);
      }
    } catch (error) {
      console.log(`❌ ${tableName}: ${error.message}`);
    }
  }
  
  console.log('\\n📋 SQL Commands for Manual Execution:');
  console.log('Copy and paste these commands into your Supabase SQL Editor:');
  console.log('\\n' + sqlCommands.join('\\n\\n'));
}

// Run the setup
createAdvancedTables()
  .then(() => {
    console.log('\\n🎉 Advanced Algorithm Tables Setup Process Complete!');
    console.log('If tables were not created automatically, please run the SQL commands manually.');
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });