// Test the new direct Supabase admin API
import { createArticleDirect } from './client/src/lib/admin-direct-supabase.js';

async function testDirectSupabase() {
  console.log('🧪 Testing direct Supabase article creation...');
  
  try {
    const testArticle = {
      title: 'Direct Supabase Test Article',
      content: 'This article was created using direct Supabase calls, bypassing the Express server completely.',
      category_id: 1,
      excerpt: 'Testing direct Supabase integration',
      is_featured: false
    };

    const result = await createArticleDirect(testArticle);
    console.log('✅ Direct Supabase article creation successful:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Direct Supabase test failed:', error);
    throw error;
  }
}

testDirectSupabase().then((result) => {
  console.log('🎉 Direct Supabase test completed successfully!');
  console.log('📄 Created article ID:', result.id);
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error.message);
  process.exit(1);
});