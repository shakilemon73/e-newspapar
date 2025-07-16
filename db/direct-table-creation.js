const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

// Extract connection string from Supabase URL
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Creating Advanced Algorithm Tables directly in PostgreSQL...');

// PostgreSQL connection using service role key
const pool = new Pool({
  connectionString: `postgresql://postgres:${serviceRoleKey.split('.')[1]}@${supabaseUrl.replace('https://', '')}/postgres`,
  ssl: { rejectUnauthorized: false }
});

async function createAdvancedTables() {
  const client = await pool.connect();
  
  try {
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
      
      // Performance Indexes
      `CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_article_analytics_article_id ON article_analytics(article_id);`,
      `CREATE INDEX IF NOT EXISTS idx_article_analytics_trending_score ON article_analytics(trending_score DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id);`,
      `CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user_id ON recommendation_cache(user_id);`,
      
      // Engagement Score Function
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
      
      // Personalized Recommendations Function
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
      
      // Advanced Bengali Search Function
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
    
    for (let i = 0; i < sqlCommands.length; i++) {
      try {
        console.log(`Executing command ${i + 1}/${sqlCommands.length}...`);
        
        await client.query(sqlCommands[i]);
        successCount++;
        
        // Log what was created
        if (sqlCommands[i].includes('CREATE TABLE')) {
          const tableName = sqlCommands[i].match(/CREATE TABLE.*?(\w+)/i)?.[1];
          console.log(`✅ Created table: ${tableName}`);
        } else if (sqlCommands[i].includes('CREATE INDEX')) {
          const indexName = sqlCommands[i].match(/CREATE INDEX.*?(\w+)/i)?.[1];
          console.log(`✅ Created index: ${indexName}`);
        } else if (sqlCommands[i].includes('CREATE OR REPLACE FUNCTION')) {
          const functionName = sqlCommands[i].match(/CREATE OR REPLACE FUNCTION (\w+)/i)?.[1];
          console.log(`✅ Created function: ${functionName}`);
        }
      } catch (error) {
        console.error(`❌ Error in command ${i + 1}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Results: ${successCount} successful, ${errorCount} errors`);
    
    // Verify tables were created
    const tableNames = ['user_analytics', 'article_analytics', 'user_interactions', 'user_preferences', 'search_history', 'recommendation_cache'];
    
    console.log('\n🔍 Verifying table creation...');
    
    for (const tableName of tableNames) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
        console.log(`✅ ${tableName}: Table exists and accessible`);
      } catch (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Advanced Algorithm Tables Setup Complete!');
    console.log('✅ All tables, indexes, and functions created successfully!');
    console.log('✅ Your Bengali news website now has advanced analytics capabilities!');
    
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the setup
createAdvancedTables()
  .then(() => {
    console.log('\n🚀 Advanced algorithms are now active in your Supabase database!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });