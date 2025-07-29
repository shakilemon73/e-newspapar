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

async function addAuthorColumn() {
  console.log('🔧 Adding author column to articles table...');

  try {
    // Add author column to articles table
    const { data, error } = await adminSupabase.rpc('exec_sql', {
      sql: 'ALTER TABLE articles ADD COLUMN IF NOT EXISTS author TEXT DEFAULT \'Admin\';'
    });

    if (error) {
      console.log('Direct SQL method failed, trying alternative approach...');
      
      // Try using direct SQL insert approach to test if we can add data
      const testArticle = {
        title: 'Test Article After Server Restart',
        slug: 'test-article-after-restart',
        content: 'This article tests if we can create articles without the author column.',
        excerpt: 'Testing article creation',
        category_id: 1,
        is_featured: false,
        published_at: new Date().toISOString(),
        view_count: 0
      };

      const { data: insertResult, error: insertError } = await adminSupabase
        .from('articles')
        .insert(testArticle)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Still cannot create articles:', insertError);
      } else {
        console.log('✅ Article created successfully without author column:', insertResult);
      }
    } else {
      console.log('✅ Author column added successfully');
    }

  } catch (error) {
    console.error('❌ Error adding author column:', error);
  }
}

addAuthorColumn().then(() => {
  console.log('Author column addition completed');
  process.exit(0);
}).catch(err => {
  console.error('Process failed:', err);
  process.exit(1);
});