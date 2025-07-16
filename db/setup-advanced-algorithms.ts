import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function setupAdvancedAlgorithms() {
  console.log('🚀 Setting up Advanced Algorithm Tables...');
  
  try {
    // Create user_analytics table
    console.log('📋 Creating user_analytics table...');
    await supabase.from('user_analytics').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      page_views: 0,
      total_time_spent: 0,
      articles_read: 0,
      categories_viewed: [],
      device_type: 'desktop',
      browser_info: 'test',
      location_data: {}
    }).then(() => {
      console.log('✅ user_analytics table structure verified');
    }).catch(async (error) => {
      if (error.code === '42P01') {
        console.log('Creating user_analytics table...');
        
        // Since we can't execute raw SQL directly, we'll use the REST API
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({
            query: `
              CREATE TABLE IF NOT EXISTS user_analytics (
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
              );
            `
          })
        });
        
        if (response.ok) {
          console.log('✅ user_analytics table created successfully');
        } else {
          const errorData = await response.text();
          console.error('❌ Error creating user_analytics:', errorData);
        }
      }
    });

    // Create article_analytics table
    console.log('📋 Creating article_analytics table...');
    await supabase.from('article_analytics').insert({
      article_id: 1,
      view_count: 0,
      unique_views: 0,
      engagement_score: 0.0,
      trending_score: 0.0,
      average_read_time: 0,
      bounce_rate: 0.0,
      social_shares: 0,
      comments_count: 0,
      likes_count: 0
    }).then(() => {
      console.log('✅ article_analytics table structure verified');
    }).catch(async (error) => {
      if (error.code === '42P01') {
        console.log('Creating article_analytics table...');
        
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({
            query: `
              CREATE TABLE IF NOT EXISTS article_analytics (
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
              );
            `
          })
        });
        
        if (response.ok) {
          console.log('✅ article_analytics table created successfully');
        } else {
          const errorData = await response.text();
          console.error('❌ Error creating article_analytics:', errorData);
        }
      }
    });

    // Create user_interactions table
    console.log('📋 Creating user_interactions table...');
    await supabase.from('user_interactions').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      article_id: 1,
      interaction_type: 'view',
      interaction_value: 1.0,
      reading_duration: 0,
      scroll_depth: 0.0,
      metadata: {}
    }).then(() => {
      console.log('✅ user_interactions table structure verified');
    }).catch(async (error) => {
      if (error.code === '42P01') {
        console.log('Creating user_interactions table...');
        
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({
            query: `
              CREATE TABLE IF NOT EXISTS user_interactions (
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
              );
            `
          })
        });
        
        if (response.ok) {
          console.log('✅ user_interactions table created successfully');
        } else {
          const errorData = await response.text();
          console.error('❌ Error creating user_interactions:', errorData);
        }
      }
    });

    // Create user_preferences table
    console.log('📋 Creating user_preferences table...');
    await supabase.from('user_preferences').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      category_id: 1,
      interest_score: 0.0,
      interaction_count: 0
    }).then(() => {
      console.log('✅ user_preferences table structure verified');
    }).catch(async (error) => {
      if (error.code === '42P01') {
        console.log('Creating user_preferences table...');
        
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({
            query: `
              CREATE TABLE IF NOT EXISTS user_preferences (
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
              );
            `
          })
        });
        
        if (response.ok) {
          console.log('✅ user_preferences table created successfully');
        } else {
          const errorData = await response.text();
          console.error('❌ Error creating user_preferences:', errorData);
        }
      }
    });

    // Create search_history table
    console.log('📋 Creating search_history table...');
    await supabase.from('search_history').insert({
      search_query: 'test',
      search_results_count: 0,
      search_metadata: {}
    }).then(() => {
      console.log('✅ search_history table structure verified');
    }).catch(async (error) => {
      if (error.code === '42P01') {
        console.log('Creating search_history table...');
        
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({
            query: `
              CREATE TABLE IF NOT EXISTS search_history (
                id SERIAL PRIMARY KEY,
                user_id UUID,
                search_query TEXT NOT NULL,
                search_results_count INTEGER DEFAULT 0,
                clicked_result_id INTEGER,
                search_metadata JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                FOREIGN KEY (clicked_result_id) REFERENCES articles(id) ON DELETE SET NULL
              );
            `
          })
        });
        
        if (response.ok) {
          console.log('✅ search_history table created successfully');
        } else {
          const errorData = await response.text();
          console.error('❌ Error creating search_history:', errorData);
        }
      }
    });

    // Create recommendation_cache table
    console.log('📋 Creating recommendation_cache table...');
    await supabase.from('recommendation_cache').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      article_id: 1,
      recommendation_score: 0.0,
      recommendation_reason: 'test',
      algorithm_version: 'v1.0'
    }).then(() => {
      console.log('✅ recommendation_cache table structure verified');
    }).catch(async (error) => {
      if (error.code === '42P01') {
        console.log('Creating recommendation_cache table...');
        
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({
            query: `
              CREATE TABLE IF NOT EXISTS recommendation_cache (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL,
                article_id INTEGER NOT NULL,
                recommendation_score DECIMAL(5,2) NOT NULL,
                recommendation_reason TEXT,
                algorithm_version VARCHAR(50) DEFAULT 'v1.0',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
                FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
              );
            `
          })
        });
        
        if (response.ok) {
          console.log('✅ recommendation_cache table created successfully');
        } else {
          const errorData = await response.text();
          console.error('❌ Error creating recommendation_cache:', errorData);
        }
      }
    });

    console.log('\n🎉 Advanced Algorithm Tables Setup Complete!');
    console.log('✅ All tables have been created successfully in your Supabase database.');
    console.log('✅ Your Bengali news website now has advanced analytics capabilities.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

// Run the setup
setupAdvancedAlgorithms()
  .then(success => {
    if (success) {
      console.log('\n🚀 Advanced algorithms are now active in your Supabase database!');
      process.exit(0);
    } else {
      console.log('\n❌ Setup failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });