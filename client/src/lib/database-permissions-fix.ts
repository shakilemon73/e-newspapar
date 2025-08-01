/**
 * Database Permissions Fix
 * Handle permission denied errors gracefully
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function checkTablePermissions() {
  const tables = ['articles', 'categories', 'authors', 'users', 'site_settings'];
  const results: Record<string, boolean> = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await adminSupabase
        .from(table)
        .select('count(*)')
        .limit(1);
      
      results[table] = !error;
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: accessible`);
      }
    } catch (error) {
      results[table] = false;
      console.log(`❌ ${table}: ${error}`);
    }
  }
  
  return results;
}

export async function createMockArticlesForTesting() {
  try {
    console.log('🔧 Creating sample articles for testing...');
    
    const sampleArticles = [
      {
        title: 'নমুনা সংবাদ ১',
        slug: 'sample-news-1',
        content: 'এটি একটি নমুনা সংবাদের বিষয়বস্তু। এই সংবাদটি পরীক্ষার জন্য তৈরি করা হয়েছে।',
        excerpt: 'নমুনা সংবাদের সংক্ষিপ্ত বিবরণ',
        category_id: 1,
        is_featured: false,
        view_count: 0,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        title: 'নমুনা সংবাদ ২',
        slug: 'sample-news-2',
        content: 'দ্বিতীয় নমুনা সংবাদের বিষয়বস্তু। এটিও পরীক্ষার উদ্দেশ্যে তৈরি।',
        excerpt: 'দ্বিতীয় সংবাদের সারসংক্ষেপ',
        category_id: 1,
        is_featured: true,
        view_count: 5,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { data, error } = await adminSupabase
      .from('articles')
      .insert(sampleArticles)
      .select();

    if (error) {
      console.error('Failed to create sample articles:', error);
      return false;
    }

    console.log('✅ Sample articles created successfully:', data?.length);
    return true;
  } catch (error) {
    console.error('Error creating sample articles:', error);
    return false;
  }
}

// Check permissions and log results
export function initializeDatabaseCheck() {
  checkTablePermissions().then(results => {
    console.log('📊 Database permissions check completed:', results);
    
    if (results.articles) {
      console.log('✅ Articles table is accessible');
    } else {
      console.log('❌ Articles table has permission issues');
    }
  });
}