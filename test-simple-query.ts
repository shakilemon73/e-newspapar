import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testSimpleQuery() {
  try {
    console.log('🔍 Testing simplified admin query...');

    const { data, error } = await supabase
      .from('article_comments')
      .select(`
        id,
        article_id,
        user_id,
        content,
        author_name,
        author_email,
        status,

        created_at,
        updated_at,
        articles:article_id (
          id,
          title,
          slug,
          excerpt
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    console.log('✅ Query successful, records:', data?.length);
    console.log('📊 Results:');
    data?.forEach((comment, index) => {
      console.log(`${index + 1}:`, {
        id: comment.id,
        content: comment.content?.substring(0, 50) + '...',
        author: comment.author_name || 'No name',
        status: comment.status,
        article: comment.articles?.title || 'No article link'
      });
    });

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testSimpleQuery();