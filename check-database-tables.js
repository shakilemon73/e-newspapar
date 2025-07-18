const { Pool } = require('pg');

// PostgreSQL connection using DATABASE_URL or fallback to Supabase
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.mrjukcqspvhketnfzmud:ZjP8kYqgQ3XtXJP9@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkHomepageTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 HOME PAGE RELATED DATABASE TABLES ANALYSIS\n');
    console.log('===============================================\n');

    // Core tables for home page functionality
    const homePageTables = [
      'articles', 'categories', 'breaking_news', 'weather', 
      'epapers', 'video_content', 'audio_articles', 'social_media_posts',
      'user_bookmarks', 'user_likes', 'trending_topics', 'tags',
      'article_tags', 'polls', 'page_views', 'user_interactions',
      'newsletters', 'user_profiles', 'media_files'
    ];

    for (const tableName of homePageTables) {
      try {
        // Check if table exists and get structure
        const tableExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [tableName]);

        if (tableExists.rows[0].exists) {
          console.log(`✅ TABLE: ${tableName.toUpperCase()}`);
          
          // Get column information
          const columns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = $1 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
          `, [tableName]);

          console.log('   Columns:');
          columns.rows.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
            console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}`);
          });

          // Get row count
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName};`);
          console.log(`   Records: ${countResult.rows[0].count}\n`);

          // Show sample data for key tables
          if (['articles', 'categories', 'breaking_news', 'weather'].includes(tableName)) {
            const sampleData = await client.query(`SELECT * FROM ${tableName} LIMIT 3;`);
            if (sampleData.rows.length > 0) {
              console.log('   Sample data:');
              sampleData.rows.forEach((row, index) => {
                console.log(`   [${index + 1}] ${JSON.stringify(row, null, 2).substring(0, 200)}...`);
              });
              console.log('');
            }
          }
        } else {
          console.log(`❌ TABLE MISSING: ${tableName.toUpperCase()}`);
        }
      } catch (error) {
        console.log(`⚠️  ERROR checking ${tableName}: ${error.message}`);
      }
    }

    // Check database indexes for performance
    console.log('\n📊 DATABASE INDEXES FOR PERFORMANCE:');
    console.log('=====================================\n');
    
    const indexes = await client.query(`
      SELECT schemaname, tablename, indexname, indexdef 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = ANY($1)
      ORDER BY tablename, indexname;
    `, [homePageTables]);

    indexes.rows.forEach(idx => {
      console.log(`${idx.tablename}.${idx.indexname}: ${idx.indexdef}`);
    });

    // Check foreign key relationships
    console.log('\n🔗 FOREIGN KEY RELATIONSHIPS:');
    console.log('==============================\n');
    
    const foreignKeys = await client.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = ANY($1)
      ORDER BY tc.table_name, kcu.column_name;
    `, [homePageTables]);

    foreignKeys.rows.forEach(fk => {
      console.log(`${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkHomepageTables().catch(console.error);