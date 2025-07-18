import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function implementHighPriorityTables() {
  console.log('🚀 Implementing High Priority Tables...\n');
  
  // 1. Populate user_saved_articles
  await populateUserSavedArticles();
  
  // 2. Populate comments table
  await populateComments();
  
  // 3. Populate tags table
  await populateTags();
  
  // 4. Populate article_tags (many-to-many)
  await populateArticleTags();
  
  // 5. Populate user_comments
  await populateUserComments();
  
  console.log('\n✅ High priority tables implementation complete!');
}

async function populateUserSavedArticles() {
  console.log('📚 Setting up user_saved_articles...');
  
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('id')
      .limit(5);
    
    if (articles && articles.length > 0) {
      const savedArticlesData = [
        {
          user_id: '12345678-1234-1234-1234-123456789012',
          article_id: articles[0].id,
          folder_name: 'favorites',
          notes: 'Important article to read later'
        },
        {
          user_id: '12345678-1234-1234-1234-123456789012',
          article_id: articles[1]?.id || articles[0].id,
          folder_name: 'sports',
          notes: null
        },
        {
          user_id: '87654321-4321-4321-4321-210987654321',
          article_id: articles[2]?.id || articles[0].id,
          folder_name: 'politics',
          notes: 'Need to fact-check this'
        }
      ];
      
      const { error } = await supabase
        .from('user_saved_articles')
        .insert(savedArticlesData);
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log('   ✅ User saved articles populated');
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function populateComments() {
  console.log('💬 Setting up comments...');
  
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('id')
      .limit(3);
    
    if (articles && articles.length > 0) {
      const commentsData = [
        {
          article_id: articles[0].id,
          user_id: '12345678-1234-1234-1234-123456789012',
          content: 'এই নিবন্ধটি খুবই তথ্যবহুল। ধন্যবাদ লেখককে।',
          author_name: 'রহিম আহমেদ',
          is_approved: true
        },
        {
          article_id: articles[0].id,
          user_id: '87654321-4321-4321-4321-210987654321',
          content: 'আরও বিস্তারিত তথ্য দিলে ভালো হতো।',
          author_name: 'করিম উদ্দিন',
          is_approved: true
        },
        {
          article_id: articles[1]?.id || articles[0].id,
          user_id: '12345678-1234-1234-1234-123456789012',
          content: 'চমৎকার বিশ্লেষণ!',
          author_name: 'ফাতিমা খাতুন',
          is_approved: true
        }
      ];
      
      const { error } = await supabase
        .from('comments')
        .insert(commentsData);
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log('   ✅ Comments populated');
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function populateTags() {
  console.log('🏷️  Setting up tags...');
  
  try {
    const tagsData = [
      { name: 'গুরুত্বপূর্ণ', slug: 'important', color: '#ff4444' },
      { name: 'জনপ্রিয়', slug: 'popular', color: '#44ff44' },
      { name: 'সর্বশেষ', slug: 'latest', color: '#4444ff' },
      { name: 'বিশেষ', slug: 'special', color: '#ff44ff' },
      { name: 'ব্রেকিং', slug: 'breaking', color: '#ffff44' },
      { name: 'বিশ্লেষণ', slug: 'analysis', color: '#44ffff' },
      { name: 'মতামত', slug: 'opinion', color: '#ff8844' },
      { name: 'তথ্য', slug: 'facts', color: '#8844ff' }
    ];
    
    const { error } = await supabase
      .from('tags')
      .insert(tagsData);
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
    } else {
      console.log('   ✅ Tags populated');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function populateArticleTags() {
  console.log('🔗 Setting up article_tags relationships...');
  
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('id')
      .limit(5);
    
    const { data: tags } = await supabase
      .from('tags')
      .select('id')
      .limit(4);
    
    if (articles && tags && articles.length > 0 && tags.length > 0) {
      const articleTagsData = [
        { article_id: articles[0].id, tag_id: tags[0].id },
        { article_id: articles[0].id, tag_id: tags[1].id },
        { article_id: articles[1]?.id || articles[0].id, tag_id: tags[0].id },
        { article_id: articles[1]?.id || articles[0].id, tag_id: tags[2]?.id || tags[0].id },
        { article_id: articles[2]?.id || articles[0].id, tag_id: tags[1].id },
        { article_id: articles[3]?.id || articles[0].id, tag_id: tags[3]?.id || tags[0].id }
      ];
      
      const { error } = await supabase
        .from('article_tags')
        .insert(articleTagsData);
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log('   ✅ Article-tag relationships populated');
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function populateUserComments() {
  console.log('👥 Setting up user_comments...');
  
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('id')
      .limit(3);
    
    if (articles && articles.length > 0) {
      const userCommentsData = [
        {
          user_id: '12345678-1234-1234-1234-123456789012',
          article_id: articles[0].id,
          comment: 'দুর্দান্ত নিবন্ধ! অনেক কিছু শিখলাম।',
          is_approved: true
        },
        {
          user_id: '87654321-4321-4321-4321-210987654321',
          article_id: articles[1]?.id || articles[0].id,
          comment: 'এই বিষয়ে আরও তথ্য চাই।',
          is_approved: true
        },
        {
          user_id: '12345678-1234-1234-1234-123456789012',
          article_id: articles[2]?.id || articles[0].id,
          comment: 'খুবই গুরুত্বপূর্ণ বিষয়।',
          is_approved: false
        }
      ];
      
      const { error } = await supabase
        .from('user_comments')
        .insert(userCommentsData);
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log('   ✅ User comments populated');
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function verifyImplementation() {
  console.log('\n🔍 Verifying implementation...\n');
  
  const tables = ['user_saved_articles', 'comments', 'tags', 'article_tags', 'user_comments'];
  
  for (const table of tables) {
    try {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      console.log(`✅ ${table}: ${count || 0} records`);
    } catch (error) {
      console.log(`❌ ${table}: Error - ${error.message}`);
    }
  }
}

// Run implementation
implementHighPriorityTables().then(verifyImplementation);