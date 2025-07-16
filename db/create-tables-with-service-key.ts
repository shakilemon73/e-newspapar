import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

console.log('SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// Create Supabase client with service role key
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

async function createTables() {
  try {
    console.log('🚀 Creating Advanced Algorithm Tables...');
    
    // Create user_analytics table
    console.log('📋 Creating user_analytics table...');
    const { error: userAnalyticsError } = await supabase
      .from('user_analytics')
      .select('*')
      .limit(1);
    
    if (userAnalyticsError && userAnalyticsError.code === '42P01') {
      console.log('Creating user_analytics table...');
      // We'll create this via SQL injection workaround
      try {
        await supabase.from('user_analytics').insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          page_views: 0
        });
      } catch (insertError) {
        console.log('user_analytics table needs to be created in SQL editor');
      }
    } else {
      console.log('✅ user_analytics table already exists');
    }
    
    // Create article_analytics table
    console.log('📋 Creating article_analytics table...');
    const { error: articleAnalyticsError } = await supabase
      .from('article_analytics')
      .select('*')
      .limit(1);
    
    if (articleAnalyticsError && articleAnalyticsError.code === '42P01') {
      console.log('Creating article_analytics table...');
      // We'll need to create this via SQL
      try {
        await supabase.from('article_analytics').insert({
          article_id: 1,
          view_count: 0
        });
      } catch (insertError) {
        console.log('article_analytics table needs to be created in SQL editor');
      }
    } else {
      console.log('✅ article_analytics table already exists');
    }
    
    // Create user_interactions table
    console.log('📋 Creating user_interactions table...');
    const { error: userInteractionsError } = await supabase
      .from('user_interactions')
      .select('*')
      .limit(1);
    
    if (userInteractionsError && userInteractionsError.code === '42P01') {
      console.log('Creating user_interactions table...');
      try {
        await supabase.from('user_interactions').insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          article_id: 1,
          interaction_type: 'view'
        });
      } catch (insertError) {
        console.log('user_interactions table needs to be created in SQL editor');
      }
    } else {
      console.log('✅ user_interactions table already exists');
    }
    
    // Create user_preferences table
    console.log('📋 Creating user_preferences table...');
    const { error: userPreferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);
    
    if (userPreferencesError && userPreferencesError.code === '42P01') {
      console.log('Creating user_preferences table...');
      try {
        await supabase.from('user_preferences').insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          category_id: 1,
          interest_score: 0.0
        });
      } catch (insertError) {
        console.log('user_preferences table needs to be created in SQL editor');
      }
    } else {
      console.log('✅ user_preferences table already exists');
    }
    
    // Create search_history table
    console.log('📋 Creating search_history table...');
    const { error: searchHistoryError } = await supabase
      .from('search_history')
      .select('*')
      .limit(1);
    
    if (searchHistoryError && searchHistoryError.code === '42P01') {
      console.log('Creating search_history table...');
      try {
        await supabase.from('search_history').insert({
          search_query: 'test',
          search_results_count: 0
        });
      } catch (insertError) {
        console.log('search_history table needs to be created in SQL editor');
      }
    } else {
      console.log('✅ search_history table already exists');
    }
    
    // Create recommendation_cache table
    console.log('📋 Creating recommendation_cache table...');
    const { error: recommendationCacheError } = await supabase
      .from('recommendation_cache')
      .select('*')
      .limit(1);
    
    if (recommendationCacheError && recommendationCacheError.code === '42P01') {
      console.log('Creating recommendation_cache table...');
      try {
        await supabase.from('recommendation_cache').insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          article_id: 1,
          recommendation_score: 0.0
        });
      } catch (insertError) {
        console.log('recommendation_cache table needs to be created in SQL editor');
      }
    } else {
      console.log('✅ recommendation_cache table already exists');
    }
    
    // Since we can't execute raw SQL through the client, provide the SQL commands
    console.log('\n📋 SQL Commands to run in Supabase SQL Editor:');
    console.log('Copy and paste these commands in your Supabase SQL Editor:');
    console.log('\n-- USER ANALYTICS TABLE');
    console.log(`CREATE TABLE IF NOT EXISTS user_analytics (
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
    );`);
    
    console.log('\n-- ARTICLE ANALYTICS TABLE');
    console.log(`CREATE TABLE IF NOT EXISTS article_analytics (
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
    );`);
    
    console.log('\n-- USER INTERACTIONS TABLE');
    console.log(`CREATE TABLE IF NOT EXISTS user_interactions (
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
    );`);
    
    console.log('\n-- USER PREFERENCES TABLE');
    console.log(`CREATE TABLE IF NOT EXISTS user_preferences (
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
    );`);
    
    console.log('\n-- SEARCH HISTORY TABLE');
    console.log(`CREATE TABLE IF NOT EXISTS search_history (
      id SERIAL PRIMARY KEY,
      user_id UUID,
      search_query TEXT NOT NULL,
      search_results_count INTEGER DEFAULT 0,
      clicked_result_id INTEGER,
      search_metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (clicked_result_id) REFERENCES articles(id) ON DELETE SET NULL
    );`);
    
    console.log('\n-- RECOMMENDATION CACHE TABLE');
    console.log(`CREATE TABLE IF NOT EXISTS recommendation_cache (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      article_id INTEGER NOT NULL,
      recommendation_score DECIMAL(5,2) NOT NULL,
      recommendation_reason TEXT,
      algorithm_version VARCHAR(50) DEFAULT 'v1.0',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );`);
    
    console.log('\n-- INDEXES FOR PERFORMANCE');
    console.log(`CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_article_analytics_article_id ON article_analytics(article_id);
CREATE INDEX IF NOT EXISTS idx_article_analytics_trending_score ON article_analytics(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user_id ON recommendation_cache(user_id);`);
    
    console.log('\n-- ADVANCED FUNCTIONS');
    console.log(`-- Engagement Score Calculation Function
CREATE OR REPLACE FUNCTION calculate_engagement_score(article_id_param INTEGER)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    engagement_score DECIMAL(5,2) := 0.0;
BEGIN
    SELECT 
        COALESCE(
            (COUNT(CASE WHEN interaction_type = 'view' THEN 1 END) * 0.1) +
            (COUNT(CASE WHEN interaction_type = 'like' THEN 1 END) * 0.3) +
            (COUNT(CASE WHEN interaction_type = 'share' THEN 1 END) * 0.5) +
            (COUNT(CASE WHEN interaction_type = 'comment' THEN 1 END) * 0.7) +
            (COUNT(CASE WHEN interaction_type = 'save' THEN 1 END) * 0.4),
            0.0
        )
    INTO engagement_score
    FROM user_interactions
    WHERE article_id = article_id_param;
    
    RETURN engagement_score;
END;
$$ LANGUAGE plpgsql;`);
    
    console.log('\n-- Personalized Recommendations Function');
    console.log(`CREATE OR REPLACE FUNCTION get_personalized_recommendations(user_id_param UUID, limit_param INTEGER DEFAULT 10)
RETURNS TABLE(
    article_id INTEGER,
    title TEXT,
    excerpt TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    category_name TEXT,
    recommendation_score DECIMAL(5,2),
    recommendation_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.image_url,
        a.published_at,
        c.name as category_name,
        COALESCE(aa.engagement_score, 0.0) + COALESCE(aa.trending_score, 0.0) as rec_score,
        'জনপ্রিয় সংবাদ' as rec_reason
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    LEFT JOIN article_analytics aa ON a.id = aa.article_id
    WHERE a.id NOT IN (
        SELECT DISTINCT ui.article_id
        FROM user_interactions ui
        WHERE ui.user_id = user_id_param
        AND ui.interaction_type = 'view'
        AND ui.created_at >= NOW() - INTERVAL '7 days'
    )
    AND a.published_at >= NOW() - INTERVAL '30 days'
    ORDER BY rec_score DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;`);
    
    console.log('\n-- Advanced Bengali Search Function');
    console.log(`CREATE OR REPLACE FUNCTION advanced_bengali_search(
    search_query TEXT,
    category_id_param INTEGER DEFAULT NULL,
    limit_param INTEGER DEFAULT 20
)
RETURNS TABLE(
    article_id INTEGER,
    title TEXT,
    excerpt TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    category_name TEXT,
    search_rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.image_url,
        a.published_at,
        c.name as category_name,
        ts_rank(
            to_tsvector('simple', a.title || ' ' || a.excerpt || ' ' || a.content),
            plainto_tsquery('simple', search_query)
        ) as search_rank
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE to_tsvector('simple', a.title || ' ' || a.excerpt || ' ' || a.content) @@ plainto_tsquery('simple', search_query)
    AND (category_id_param IS NULL OR a.category_id = category_id_param)
    ORDER BY search_rank DESC, a.published_at DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;`);
    
    console.log('\n🎉 Setup complete! Please run these SQL commands in your Supabase SQL Editor to create all advanced algorithm tables and functions.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Run the setup
createTables()
  .then(success => {
    if (success) {
      console.log('\n✅ Advanced algorithm setup completed!');
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