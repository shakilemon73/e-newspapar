/**
 * Fix Timestamp Utility
 * This script updates article timestamps to current time minus specified duration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixArticleTimestamp(articleTitle: string, minutesAgo: number) {
  try {
    console.log(`🔧 Fixing timestamp for article: "${articleTitle}"`);
    
    // Calculate the correct timestamp
    const correctTimestamp = new Date(Date.now() - minutesAgo * 60 * 1000);
    console.log(`⏰ Setting timestamp to: ${correctTimestamp.toISOString()} (${minutesAgo} minutes ago)`);
    
    // Find and update the article
    const { data: articles, error: findError } = await supabase
      .from('articles')
      .select('id, title, published_at')
      .ilike('title', `%${articleTitle}%`);
    
    if (findError) {
      console.error('❌ Error finding article:', findError);
      return;
    }
    
    if (!articles || articles.length === 0) {
      console.log('❌ Article not found');
      return;
    }
    
    console.log(`📝 Found ${articles.length} matching article(s):`);
    articles.forEach(article => {
      console.log(`  - ID: ${article.id}, Title: ${article.title}`);
      console.log(`  - Current timestamp: ${article.published_at}`);
    });
    
    // Update all matching articles
    const { data: updated, error: updateError } = await supabase
      .from('articles')
      .update({ 
        published_at: correctTimestamp.toISOString(),
        updated_at: new Date().toISOString()
      })
      .ilike('title', `%${articleTitle}%`)
      .select();
    
    if (updateError) {
      console.error('❌ Error updating article:', updateError);
      return;
    }
    
    console.log('✅ Successfully updated article timestamp');
    console.log('📊 Updated articles:', updated);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Fix the specific article mentioned by the user
async function main() {
  await fixArticleTimestamp('রোনালদো–বেকহামের জার্সি', 30);
  process.exit(0);
}

if (require.main === module) {
  main();
}

export { fixArticleTimestamp };