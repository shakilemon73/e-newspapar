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

async function debugComments() {
  try {
    console.log('🔍 Debugging comments data...');
    console.log('Using URL:', supabaseUrl);
    console.log('Service key (first 20 chars):', supabaseServiceKey.substring(0, 20) + '...');

    // Check if table exists and has data
    const { data: tableData, error: tableError, count } = await supabase
      .from('article_comments')
      .select('*', { count: 'exact' })
      .limit(10);

    if (tableError) {
      console.error('❌ Table error:', tableError);
      return;
    }

    console.log('✅ Table accessible, total count:', count);
    console.log('📊 Sample data (first 3 records):');
    tableData?.slice(0, 3).forEach((comment, index) => {
      console.log(`${index + 1}:`, {
        id: comment.id,
        content: comment.content?.substring(0, 50) + '...',
        author_name: comment.author_name,
        status: comment.status,
        created_at: comment.created_at
      });
    });

    // Test the exact query from admin function
    console.log('\n🔍 Testing admin query with joins...');
    const { data: adminData, error: adminError } = await supabase
      .from('article_comments')
      .select(`
        id,
        article_id,
        user_id,
        content,
        author_name,
        author_email,
        status,
        is_reported,
        reported_reason,
        admin_reply,
        admin_reply_by,
        parent_id,
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

    if (adminError) {
      console.error('❌ Admin query error:', adminError);
      return;
    }

    console.log('✅ Admin query successful, records:', adminData?.length);
    adminData?.forEach((comment, index) => {
      console.log(`Admin ${index + 1}:`, {
        id: comment.id,
        content: comment.content?.substring(0, 40) + '...',
        author: comment.author_name,
        status: comment.status,
        article: comment.articles?.title || 'No article'
      });
    });

  } catch (error) {
    console.error('💥 Debug error:', error);
  }
}

debugComments();