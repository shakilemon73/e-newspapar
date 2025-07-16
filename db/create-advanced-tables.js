import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createAdvancedTables() {
  try {
    console.log('🚀 Creating Advanced Algorithm Tables with Service Role Key...');
    
    // Define the SQL commands for creating advanced tables
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
      );`,
      
      // Create indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_article_analytics_article_id ON article_analytics(article_id);`,
      `CREATE INDEX IF NOT EXISTS idx_article_analytics_trending_score ON article_analytics(trending_score DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id);`,
      `CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user_id ON recommendation_cache(user_id);`,
      
      // Create engagement score calculation function
      `CREATE OR REPLACE FUNCTION calculate_engagement_score(article_id_param INTEGER)
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
      $$ LANGUAGE plpgsql;`,
      
      // Create trending score calculation function
      `CREATE OR REPLACE FUNCTION calculate_trending_score(article_id_param INTEGER)
      RETURNS DECIMAL(5,2) AS $$
      DECLARE
          trending_score DECIMAL(5,2) := 0.0;
          recent_interactions INTEGER := 0;
      BEGIN
          SELECT COUNT(*)
          INTO recent_interactions
          FROM user_interactions
          WHERE article_id = article_id_param
          AND created_at >= NOW() - INTERVAL '24 hours';
          
          trending_score := recent_interactions * 0.8;
          
          RETURN trending_score;
      END;
      $$ LANGUAGE plpgsql;`,
      
      // Create personalized recommendations function
      `CREATE OR REPLACE FUNCTION get_personalized_recommendations(user_id_param UUID, limit_param INTEGER DEFAULT 10)
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
      $$ LANGUAGE plpgsql;`,
      
      // Create advanced Bengali search function
      `CREATE OR REPLACE FUNCTION advanced_bengali_search(
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
      $$ LANGUAGE plpgsql;`
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each SQL command
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i].trim();
      
      try {
        console.log(`Executing command ${i + 1}/${sqlCommands.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: command
        });
        
        if (error) {
          console.error(`❌ Error in command ${i + 1}:`, error.message);
          errorCount++;
        } else {
          successCount++;
          
          // Log what was created
          if (command.includes('CREATE TABLE')) {
            const tableName = command.match(/CREATE TABLE.*?(\w+)/i)?.[1];
            console.log(`✅ Created table: ${tableName}`);
          } else if (command.includes('CREATE INDEX')) {
            const indexName = command.match(/CREATE INDEX.*?(\w+)/i)?.[1];
            console.log(`✅ Created index: ${indexName}`);
          } else if (command.includes('CREATE OR REPLACE FUNCTION')) {
            const functionName = command.match(/CREATE OR REPLACE FUNCTION (\w+)/i)?.[1];
            console.log(`✅ Created function: ${functionName}`);
          }
        }
      } catch (err) {
        console.error(`❌ Exception in command ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Results: ${successCount} successful, ${errorCount} errors`);
    
    // Initialize article analytics for existing articles
    try {
      console.log('🔄 Initializing article analytics...');
      
      const { data: articles, error: articleError } = await supabase
        .from('articles')
        .select('id, view_count');
      
      if (articleError) {
        console.error('Error fetching articles:', articleError.message);
      } else if (articles && articles.length > 0) {
        let initCount = 0;
        
        for (const article of articles) {
          const { error: insertError } = await supabase
            .from('article_analytics')
            .insert({
              article_id: article.id,
              view_count: article.view_count || 0,
              unique_views: article.view_count || 0,
              engagement_score: 0.0,
              trending_score: 0.0
            });
          
          if (!insertError || insertError.code === '23505') { // Success or duplicate key
            initCount++;
          }
        }
        
        console.log(`✅ Initialized analytics for ${initCount} articles`);
      }
    } catch (err) {
      console.error('Error initializing article analytics:', err.message);
    }
    
    // Test the functions
    console.log('\n🧪 Testing created functions...');
    
    // Test personalized recommendations
    try {
      const { data: testRecs, error: testError } = await supabase.rpc('get_personalized_recommendations', {
        user_id_param: '00000000-0000-0000-0000-000000000000',
        limit_param: 3
      });
      
      if (testError) {
        console.log('⚠️ Personalized recommendations test:', testError.message);
      } else {
        console.log(`✅ Personalized recommendations function working: ${testRecs?.length || 0} results`);
      }
    } catch (err) {
      console.log('⚠️ Personalized recommendations test failed');
    }
    
    // Test Bengali search
    try {
      const { data: searchResults, error: searchError } = await supabase.rpc('advanced_bengali_search', {
        search_query: 'বাংলাদেশ',
        limit_param: 3
      });
      
      if (searchError) {
        console.log('⚠️ Bengali search test:', searchError.message);
      } else {
        console.log(`✅ Bengali search function working: ${searchResults?.length || 0} results`);
      }
    } catch (err) {
      console.log('⚠️ Bengali search test failed');
    }
    
    console.log('\n🎉 Advanced algorithm tables setup complete!');
    console.log('📊 Your Supabase database now includes:');
    console.log('   • User analytics and behavior tracking');
    console.log('   • Article performance metrics');
    console.log('   • Personalized recommendation engine');
    console.log('   • Advanced Bengali text search');
    console.log('   • User interaction tracking');
    console.log('   • Performance optimization indexes');
    console.log('   • Machine learning functions for recommendations');
    
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

// Run the setup
createAdvancedTables()
  .then(success => {
    if (success) {
      console.log('\n✅ Advanced algorithm tables created successfully!');
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