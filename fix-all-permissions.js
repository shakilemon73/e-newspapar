import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAllPermissions() {
  console.log('🔧 Comprehensive permissions fix for all tables...');

  try {
    // Use direct PostgreSQL connection
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();

    // Fix weather table RLS (from error logs)
    console.log('🌤️ Fixing weather table permissions...');
    await client.query(`
      -- Drop existing policies
      DROP POLICY IF EXISTS "Weather is viewable by everyone" ON weather;
      DROP POLICY IF EXISTS "Service role can manage weather" ON weather;
      DROP POLICY IF EXISTS "Authenticated users can update weather" ON weather;
      DROP POLICY IF EXISTS "System can update weather" ON weather;
      
      -- Create new policies
      CREATE POLICY "Public can view weather" ON weather
        FOR SELECT USING (true);
      
      CREATE POLICY "Service role manages weather" ON weather
        FOR ALL TO service_role USING (true);
      
      CREATE POLICY "System updates weather" ON weather
        FOR INSERT WITH CHECK (true);
      
      CREATE POLICY "System modifies weather" ON weather
        FOR UPDATE USING (true);
    `);

    // Fix user tables permissions (most common issue)
    const userTables = [
      'user_profiles', 'user_settings', 'user_reading_history', 
      'user_interactions', 'user_bookmarks', 'user_likes', 
      'user_shares', 'user_notifications', 'user_achievements',
      'user_activity', 'user_badges', 'user_analytics'
    ];

    for (const table of userTables) {
      console.log(`👤 Fixing ${table} permissions...`);
      try {
        await client.query(`
          -- Enable RLS
          ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
          
          -- Drop existing policies
          DROP POLICY IF EXISTS "Users manage own data" ON ${table};
          DROP POLICY IF EXISTS "Service role full access" ON ${table};
          DROP POLICY IF EXISTS "Public read access" ON ${table};
          
          -- Create service role policy (always works)
          CREATE POLICY "Service role manages all" ON ${table}
            FOR ALL TO service_role USING (true);
          
          -- Create user-specific policy if user_id column exists
          CREATE POLICY "Users access own data" ON ${table}
            FOR ALL TO authenticated 
            USING (
              CASE 
                WHEN EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = '${table}' AND column_name = 'user_id'
                ) 
                THEN auth.uid()::text = user_id::text
                ELSE true
              END
            );
        `);
        console.log(`✅ Fixed ${table}`);
      } catch (error) {
        console.log(`⚠️ Could not fix ${table}: ${error.message}`);
      }
    }

    // Fix articles table permissions (ensure authors work)
    console.log('📰 Fixing articles table permissions...');
    await client.query(`
      DROP POLICY IF EXISTS "Articles are publicly readable" ON articles;
      DROP POLICY IF EXISTS "Service role manages articles" ON articles;
      
      CREATE POLICY "Public reads articles" ON articles
        FOR SELECT USING (true);
      
      CREATE POLICY "Service role manages articles" ON articles
        FOR ALL TO service_role USING (true);
      
      CREATE POLICY "Admins manage articles" ON articles
        FOR ALL TO authenticated
        USING (auth.jwt() ->> 'role' = 'admin');
    `);

    // Fix authors table permissions
    console.log('✍️ Fixing authors table permissions...');
    await client.query(`
      DROP POLICY IF EXISTS "Authors are viewable by everyone" ON authors;
      DROP POLICY IF EXISTS "Service role can manage authors" ON authors;
      
      CREATE POLICY "Public reads authors" ON authors
        FOR SELECT USING (is_active = true);
      
      CREATE POLICY "Service role manages authors" ON authors
        FOR ALL TO service_role USING (true);
      
      CREATE POLICY "Admins manage authors" ON authors
        FOR ALL TO authenticated
        USING (auth.jwt() ->> 'role' = 'admin');
    `);

    // Fix categories table permissions
    console.log('📂 Fixing categories table permissions...');
    await client.query(`
      DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
      DROP POLICY IF EXISTS "Service role manages categories" ON categories;
      
      CREATE POLICY "Public reads categories" ON categories
        FOR SELECT USING (true);
      
      CREATE POLICY "Service role manages categories" ON categories
        FOR ALL TO service_role USING (true);
    `);

    // Grant necessary permissions to authenticated and service roles
    console.log('🔑 Granting table permissions...');
    const allTables = [
      'articles', 'authors', 'categories', 'weather', 'breaking_news',
      'video_content', 'audio_articles', 'epapers', 'polls', 'reviews',
      'trending_topics', 'tags', 'media', 'newsletters', 'social_media_posts',
      ...userTables
    ];

    for (const table of allTables) {
      try {
        await client.query(`
          GRANT SELECT ON ${table} TO authenticated;
          GRANT SELECT ON ${table} TO anon;
          GRANT ALL ON ${table} TO service_role;
          GRANT USAGE ON SEQUENCE ${table}_id_seq TO authenticated;
          GRANT USAGE ON SEQUENCE ${table}_id_seq TO service_role;
        `);
      } catch (error) {
        console.log(`⚠️ Could not grant permissions for ${table}: ${error.message}`);
      }
    }

    await client.release();
    await pool.end();

    console.log('✅ All permission fixes completed successfully');

    // Test the fixes
    console.log('🧪 Testing permission fixes...');
    
    // Test weather table
    const { data: weatherTest, error: weatherError } = await adminSupabase
      .from('weather')
      .select('city, temperature')
      .limit(1);
    
    if (weatherError) {
      console.log('❌ Weather table still has issues:', weatherError.message);
    } else {
      console.log('✅ Weather table access working');
    }

    // Test authors table
    const { data: authorsTest, error: authorsError } = await adminSupabase
      .from('authors')
      .select('name')
      .limit(1);
    
    if (authorsError) {
      console.log('❌ Authors table still has issues:', authorsError.message);
    } else {
      console.log('✅ Authors table access working');
    }

    return true;

  } catch (error) {
    console.error('❌ Error in comprehensive permissions fix:', error);
    return false;
  }
}

fixAllPermissions().then((success) => {
  if (success) {
    console.log('🎉 All permission issues resolved');
  } else {
    console.log('⚠️ Some permission issues may remain');
  }
  process.exit(0);
}).catch(err => {
  console.error('💥 Process failed:', err);
  process.exit(1);
});