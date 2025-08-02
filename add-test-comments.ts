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

async function addTestComments() {
  try {
    console.log('🔄 Adding test comments to article_comments table...');

    // First, get some articles to attach comments to
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug')
      .limit(3);

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
      return;
    }

    if (!articles || articles.length === 0) {
      console.log('❌ No articles found. Adding a test article first...');
      
      // Add a test article
      const { data: newArticle, error: articleError } = await supabase
        .from('articles')
        .insert({
          title: 'Test Article for Comments',
          slug: 'test-article-comments',
          excerpt: 'This is a test article to demonstrate comment functionality',
          content: 'This article exists solely for testing the comment management system.',
          status: 'published',
          category_id: 1,
          author_id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (articleError) {
        console.error('Error creating test article:', articleError);
        return;
      }

      articles.push(newArticle);
      console.log('✅ Test article created:', newArticle.title);
    }

    // Add test comments
    const testComments = [
      {
        article_id: articles[0].id,
        content: 'এটি একটি দুর্দান্ত নিবন্ধ! অনেক তথ্যবহুল এবং উপকারী।',
        author_name: 'রহিম উদ্দিন',
        author_email: 'rahim@example.com',
        status: 'pending',
        is_reported: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        article_id: articles[0].id,
        content: 'আমি এই বিষয়ে আরও জানতে চাই। আপনি কি আরও বিস্তারিত তথ্য দিতে পারেন?',
        author_name: 'ফাতেমা খানম',
        author_email: 'fatema@example.com',
        status: 'approved',
        is_reported: false,
        admin_reply: 'ধন্যবাদ আপনার মন্তব্যের জন্য। আমরা শীঘ্রই এই বিষয়ে আরও বিস্তারিত নিবন্ধ প্রকাশ করব।',
        admin_reply_by: 'Admin',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date().toISOString()
      },
      {
        article_id: articles[0].id,
        content: 'এই তথ্য সম্পূর্ণ ভুল! এটি মিথ্যা সংবাদ।',
        author_name: 'করিম আহমেদ',
        author_email: 'karim@example.com',
        status: 'rejected',
        is_reported: true,
        reported_reason: 'Spam/inappropriate content',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date().toISOString()
      },
      {
        article_id: articles.length > 1 ? articles[1].id : articles[0].id,
        content: 'খুবই ভালো একটি প্রতিবেদন। আশা করি এরকম আরও নিবন্ধ পাব।',
        author_name: 'সালমা বেগম',
        author_email: 'salma@example.com',
        status: 'approved',
        is_reported: false,
        created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        updated_at: new Date().toISOString()
      },
      {
        article_id: articles.length > 1 ? articles[1].id : articles[0].id,
        content: 'আমার মতে এই বিষয়ে সরকারের আরও পদক্ষেপ নেওয়া উচিত।',
        author_name: 'মোহাম্মদ হাসান',
        author_email: 'hasan@example.com',
        status: 'pending',
        is_reported: false,
        created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        updated_at: new Date().toISOString()
      }
    ];

    const { data: insertedComments, error: commentsError } = await supabase
      .from('article_comments')
      .insert(testComments)
      .select();

    if (commentsError) {
      console.error('Error inserting test comments:', commentsError);
      return;
    }

    console.log('✅ Successfully added', insertedComments?.length || 0, 'test comments');
    console.log('📊 Comment breakdown:');
    
    const statusCounts = testComments.reduce((acc, comment) => {
      acc[comment.status] = (acc[comment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} comments`);
    });

    const reportedCount = testComments.filter(c => c.is_reported).length;
    console.log(`   - reported: ${reportedCount} comments`);

    console.log('\n🎉 Test comments successfully added to the database!');
    console.log('You can now visit the admin/comments page to see them.');

  } catch (error) {
    console.error('Error adding test comments:', error);
  }
}

addTestComments();