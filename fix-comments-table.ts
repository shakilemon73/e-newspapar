import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixCommentsTable() {
  try {
    console.log('🔄 Checking article_comments table structure...');

    // First, let's check if the table exists and what columns it has
    const { data: tableInfo, error: tableError } = await supabase
      .from('article_comments')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Table check error:', tableError);
      console.log('❌ Table may not exist or has issues');
      return;
    }

    console.log('✅ Table exists, checking columns...');

    // Let's try to add missing columns using SQL
    const alterQueries = [
      'ALTER TABLE article_comments ADD COLUMN IF NOT EXISTS admin_reply TEXT;',
      'ALTER TABLE article_comments ADD COLUMN IF NOT EXISTS admin_reply_by TEXT;',
      'ALTER TABLE article_comments ADD COLUMN IF NOT EXISTS is_reported BOOLEAN DEFAULT false;',
      'ALTER TABLE article_comments ADD COLUMN IF NOT EXISTS reported_reason TEXT;'
    ];

    for (const query of alterQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error && !error.message.includes('already exists')) {
        console.log('Column modification:', query.split('ADD COLUMN IF NOT EXISTS')[1]?.split(' ')[0] || 'unknown');
      }
    }

    // Now let's try to add some simple test data
    console.log('🔄 Adding simple test comments...');

    const simpleComments = [
      {
        article_id: 1,
        content: 'এটি একটি দুর্দান্ত নিবন্ধ! অনেক তথ্যবহুল এবং উপকারী।',
        author_name: 'রহিম উদ্দিন',
        author_email: 'rahim@example.com',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        article_id: 1,
        content: 'আমি এই বিষয়ে আরও জানতে চাই। আপনি কি আরও বিস্তারিত তথ্য দিতে পারেন?',
        author_name: 'ফাতেমা খানম',
        author_email: 'fatema@example.com',
        status: 'approved',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        article_id: 1,
        content: 'এই তথ্য সম্পূর্ণ ভুল! এটি মিথ্যা সংবাদ।',
        author_name: 'করিম আহমেদ',
        author_email: 'karim@example.com',
        status: 'rejected',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { data: insertedComments, error: insertError } = await supabase
      .from('article_comments')
      .insert(simpleComments)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      console.log('🔧 Trying alternative approach...');
      
      // Try inserting one by one to see which fields are missing
      for (const comment of simpleComments) {
        const { error: singleError } = await supabase
          .from('article_comments')
          .insert(comment)
          .select();
        
        if (singleError) {
          console.error('Single insert error:', singleError);
        } else {
          console.log('✅ Successfully inserted comment from:', comment.author_name);
        }
      }
      return;
    }

    console.log('✅ Successfully added', insertedComments?.length || 0, 'test comments');
    console.log('🎉 Comments table is now ready with test data!');

  } catch (error) {
    console.error('Error fixing comments table:', error);
  }
}

fixCommentsTable();