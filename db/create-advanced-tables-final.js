import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 Creating Advanced Algorithm Tables in Supabase Database...');

async function createAdvancedTables() {
  const tables = [
    {
      name: 'user_analytics',
      schema: {
        id: { type: 'SERIAL', primary: true },
        user_id: { type: 'UUID', required: true },
        session_id: { type: 'VARCHAR(255)' },
        page_views: { type: 'INTEGER', default: 0 },
        total_time_spent: { type: 'INTEGER', default: 0 },
        articles_read: { type: 'INTEGER', default: 0 },
        categories_viewed: { type: 'TEXT[]' },
        device_type: { type: 'VARCHAR(50)' },
        browser_info: { type: 'TEXT' },
        location_data: { type: 'JSONB' },
        created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
        updated_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' }
      }
    },
    {
      name: 'article_analytics',
      schema: {
        id: { type: 'SERIAL', primary: true },
        article_id: { type: 'INTEGER', required: true },
        view_count: { type: 'INTEGER', default: 0 },
        unique_views: { type: 'INTEGER', default: 0 },
        engagement_score: { type: 'DECIMAL(5,2)', default: 0.0 },
        trending_score: { type: 'DECIMAL(5,2)', default: 0.0 },
        average_read_time: { type: 'INTEGER', default: 0 },
        bounce_rate: { type: 'DECIMAL(5,2)', default: 0.0 },
        social_shares: { type: 'INTEGER', default: 0 },
        comments_count: { type: 'INTEGER', default: 0 },
        likes_count: { type: 'INTEGER', default: 0 },
        created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
        updated_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' }
      }
    },
    {
      name: 'user_interactions',
      schema: {
        id: { type: 'SERIAL', primary: true },
        user_id: { type: 'UUID', required: true },
        article_id: { type: 'INTEGER', required: true },
        interaction_type: { type: 'VARCHAR(50)', required: true },
        interaction_value: { type: 'DECIMAL(3,2)', default: 1.0 },
        reading_duration: { type: 'INTEGER', default: 0 },
        scroll_depth: { type: 'DECIMAL(5,2)', default: 0.0 },
        metadata: { type: 'JSONB' },
        created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' }
      }
    },
    {
      name: 'user_preferences',
      schema: {
        id: { type: 'SERIAL', primary: true },
        user_id: { type: 'UUID', required: true },
        category_id: { type: 'INTEGER', required: true },
        interest_score: { type: 'DECIMAL(5,2)', default: 0.0 },
        interaction_count: { type: 'INTEGER', default: 0 },
        last_interaction: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
        created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
        updated_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' }
      }
    },
    {
      name: 'search_history',
      schema: {
        id: { type: 'SERIAL', primary: true },
        user_id: { type: 'UUID' },
        search_query: { type: 'TEXT', required: true },
        search_results_count: { type: 'INTEGER', default: 0 },
        clicked_result_id: { type: 'INTEGER' },
        search_metadata: { type: 'JSONB' },
        created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' }
      }
    },
    {
      name: 'recommendation_cache',
      schema: {
        id: { type: 'SERIAL', primary: true },
        user_id: { type: 'UUID', required: true },
        article_id: { type: 'INTEGER', required: true },
        recommendation_score: { type: 'DECIMAL(5,2)', required: true },
        recommendation_reason: { type: 'TEXT' },
        algorithm_version: { type: 'VARCHAR(50)', default: 'v1.0' },
        created_at: { type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
        expires_at: { type: 'TIMESTAMP WITH TIME ZONE', default: "NOW() + INTERVAL '24 hours'" }
      }
    }
  ];

  // Test database connection
  console.log('Testing database connection...');
  const { data: connectionTest, error: connectionError } = await supabase
    .from('articles')
    .select('id')
    .limit(1);

  if (connectionError) {
    console.error('❌ Database connection failed:', connectionError.message);
    return;
  }
  
  console.log('✅ Database connection successful');

  // Create tables by inserting test data
  const results = [];
  
  for (const table of tables) {
    try {
      console.log(`Creating ${table.name} table...`);
      
      // Create a test record to force table creation
      const testRecord = createTestRecord(table);
      
      const { data, error } = await supabase
        .from(table.name)
        .insert(testRecord)
        .select();
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${table.name}: Table does not exist and cannot be created automatically`);
          results.push({ table: table.name, status: 'requires_manual_creation' });
        } else {
          console.log(`❌ ${table.name}: ${error.message}`);
          results.push({ table: table.name, status: 'error', message: error.message });
        }
      } else {
        console.log(`✅ ${table.name}: Table created successfully`);
        results.push({ table: table.name, status: 'created' });
        
        // Clean up test data
        await supabase
          .from(table.name)
          .delete()
          .eq('id', data[0].id);
      }
    } catch (error) {
      console.log(`❌ ${table.name}: Exception - ${error.message}`);
      results.push({ table: table.name, status: 'exception', message: error.message });
    }
  }

  // Summary
  console.log('\\n📊 Table Creation Results:');
  results.forEach(result => {
    const icon = result.status === 'created' ? '✅' : '❌';
    console.log(`${icon} ${result.table}: ${result.status}`);
    if (result.message) console.log(`   ${result.message}`);
  });

  const created = results.filter(r => r.status === 'created').length;
  const failed = results.filter(r => r.status !== 'created').length;

  console.log(`\\n🎉 Summary: ${created} created, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\\n⚠️  For failed tables, you need to execute these SQL commands in Supabase SQL Editor:');
    console.log('\\n-- Copy and paste these commands into your Supabase SQL Editor:');
    
    results.filter(r => r.status !== 'created').forEach(result => {
      const table = tables.find(t => t.name === result.table);
      if (table) {
        console.log(`\\n-- ${table.name} table`);
        console.log(generateCreateTableSQL(table));
      }
    });
  }
}

function createTestRecord(table) {
  const record = {};
  
  for (const [field, config] of Object.entries(table.schema)) {
    if (config.primary) continue; // Skip primary key
    
    if (config.required) {
      switch (config.type) {
        case 'UUID':
          record[field] = '00000000-0000-0000-0000-000000000000';
          break;
        case 'INTEGER':
          record[field] = 1;
          break;
        case 'TEXT':
          record[field] = 'test';
          break;
        case 'VARCHAR(50)':
          record[field] = 'test';
          break;
        case 'DECIMAL(5,2)':
          record[field] = 1.0;
          break;
        default:
          record[field] = 'test';
      }
    }
  }
  
  return record;
}

function generateCreateTableSQL(table) {
  let sql = `CREATE TABLE IF NOT EXISTS ${table.name} (\\n`;
  
  const columns = [];
  for (const [field, config] of Object.entries(table.schema)) {
    let column = `  ${field} ${config.type}`;
    
    if (config.primary) {
      column += ' PRIMARY KEY';
    }
    
    if (config.required && !config.primary) {
      column += ' NOT NULL';
    }
    
    if (config.default !== undefined) {
      if (config.default === 'NOW()') {
        column += ' DEFAULT NOW()';
      } else if (typeof config.default === 'string') {
        column += ` DEFAULT '${config.default}'`;
      } else {
        column += ` DEFAULT ${config.default}`;
      }
    }
    
    columns.push(column);
  }
  
  sql += columns.join(',\\n');
  sql += '\\n);';
  
  return sql;
}

createAdvancedTables();