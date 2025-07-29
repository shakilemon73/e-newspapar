import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceKey);

async function checkArticlesSchema() {
  console.log('🔍 Checking articles table schema...');

  try {
    // Get table schema using information_schema
    const { data: columns, error } = await adminSupabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'articles')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (error) {
      console.error('❌ Error fetching schema:', error);
      return;
    }

    console.log('📋 Articles table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });

    // Try to fetch a sample article to see the actual structure
    console.log('\n📄 Sample article structure:');
    const { data: sampleArticle, error: sampleError } = await adminSupabase
      .from('articles')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('❌ Error fetching sample article:', sampleError);
    } else if (sampleArticle) {
      console.log('Sample article keys:', Object.keys(sampleArticle));
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkArticlesSchema().then(() => process.exit(0));