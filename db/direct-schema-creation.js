import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'public'
    }
  }
);

console.log('Creating advanced algorithm tables using direct schema approach...');

async function createTablesWithAPI() {
  const results = [];
  
  // Use the REST API to create tables through HTTP requests
  const baseUrl = process.env.VITE_SUPABASE_URL;
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const headers = {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Test if we can access the database
    console.log('Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('articles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('Database connection error:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Create tables using the management API
    const sqlCommands = [
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
    
    // Try to execute through the database management API
    for (let i = 0; i < sqlCommands.length; i++) {
      try {
        console.log(`Executing SQL command ${i + 1}/${sqlCommands.length}...`);
        
        // Use the database management API endpoint
        const response = await fetch(`${baseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            sql: sqlCommands[i]
          })
        });
        
        if (!response.ok) {
          // If the exec function doesn't exist, try creating it first
          if (response.status === 404) {
            console.log('Creating exec function...');
            
            // Create the exec function
            const execFunction = `
              CREATE OR REPLACE FUNCTION exec(sql TEXT)
              RETURNS VOID AS $$
              BEGIN
                EXECUTE sql;
              END;
              $$ LANGUAGE plpgsql SECURITY DEFINER;
            `;
            
            const createFuncResponse = await fetch(`${baseUrl}/rest/v1/rpc/exec`, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({
                sql: execFunction
              })
            });
            
            if (!createFuncResponse.ok) {
              console.log('Cannot create exec function, trying alternative...');
              
              // Alternative: Use the HTTP API directly
              const directResponse = await fetch(`${baseUrl}/rest/v1/`, {
                method: 'POST',
                headers: {
                  ...headers,
                  'Content-Type': 'application/vnd.pgrst.object+json'
                },
                body: JSON.stringify({
                  query: sqlCommands[i]
                })
              });
              
              if (directResponse.ok) {
                console.log(`✅ Table ${i + 1} created successfully`);
                results.push({ table: `table_${i + 1}`, status: 'created' });
              } else {
                const errorText = await directResponse.text();
                console.log(`❌ Table ${i + 1} failed: ${errorText}`);
                results.push({ table: `table_${i + 1}`, status: 'error', message: errorText });
              }
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ Command ${i + 1} failed: ${errorText}`);
            results.push({ table: `table_${i + 1}`, status: 'error', message: errorText });
          }
        } else {
          console.log(`✅ Command ${i + 1} executed successfully`);
          results.push({ table: `table_${i + 1}`, status: 'created' });
        }
      } catch (error) {
        console.log(`❌ Exception in command ${i + 1}:`, error.message);
        results.push({ table: `table_${i + 1}`, status: 'error', message: error.message });
      }
    }
    
    console.log('\\n📊 Results:');
    results.forEach(result => {
      console.log(`${result.status === 'created' ? '✅' : '❌'} ${result.table}: ${result.status}`);
    });
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

createTablesWithAPI();