import { createClient } from '@supabase/supabase-js';

// Use the same credentials from supabase.ts
// SECURITY: Use environment variables only
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('🚨 SECURITY: Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetFakeData() {
  console.log('🧹 Resetting all fake view counts to 0...');
  
  try {
    // First, check current data
    const { data: before } = await supabase
      .from('articles')
      .select('id, title, view_count')
      .not('view_count', 'is', null)
      .order('view_count', { ascending: false });
    
    console.log('BEFORE RESET - Articles with view counts:');
    before?.forEach(article => {
      console.log(`  ID ${article.id}: ${article.view_count} views - "${article.title.substring(0, 50)}..."`);
    });
    
    // Reset all view counts to 0
    const { data: resetResult, error: resetError } = await supabase
      .from('articles')
      .update({ view_count: 0 })
      .neq('id', 0);
    
    if (resetError) {
      console.error('❌ Error resetting view counts:', resetError);
      return;
    }
    
    // Also reset article_analytics if it exists
    const { error: analyticsError } = await supabase
      .from('article_analytics')
      .update({ view_count: 0, unique_view_count: 0 })
      .neq('id', 0);
    
    if (analyticsError) {
      console.log('⚠️  Article analytics table not found or error:', analyticsError.message);
    }
    
    // Verify the reset
    const { data: after } = await supabase
      .from('articles')
      .select('id, title, view_count')
      .order('id')
      .limit(5);
    
    console.log('\n✅ AFTER RESET - All view counts set to 0:');
    after?.forEach(article => {
      console.log(`  ID ${article.id}: ${article.view_count} views - "${article.title.substring(0, 50)}..."`);
    });
    
    console.log('\n🎉 SUCCESS: All fake view counts eliminated!');
    console.log('💡 Now the "সর্বাধিক পঠিত" section will only show articles with real view counts.');
    
  } catch (error) {
    console.error('❌ Error during reset:', error);
  }
}

resetFakeData();