/**
 * Fix Article Timestamp - Direct Supabase Update
 * Updates the "রোনালদো" article timestamp to 30 minutes ago
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRonaldoArticleTimestamp() {
  try {
    console.log('🔧 Starting timestamp fix for রোনালদো article...');
    
    // Calculate correct timestamp (30 minutes ago)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    console.log(`⏰ Setting timestamp to: ${thirtyMinutesAgo.toISOString()} (30 minutes ago)`);
    
    // First, find the article
    const { data: articles, error: findError } = await supabase
      .from('articles')
      .select('id, title, published_at, created_at')
      .ilike('title', '%রোনালদো%');
    
    if (findError) {
      console.error('❌ Error finding article:', findError);
      return;
    }
    
    if (!articles || articles.length === 0) {
      console.log('❌ রোনালদো article not found');
      return;
    }
    
    console.log(`📝 Found ${articles.length} matching article(s):`);
    articles.forEach(article => {
      console.log(`  - ID: ${article.id}`);
      console.log(`  - Title: ${article.title}`);
      console.log(`  - Current published_at: ${article.published_at}`);
      console.log(`  - Current created_at: ${article.created_at}`);
    });
    
    // Update the article timestamp
    const { data: updated, error: updateError } = await supabase
      .from('articles')
      .update({ 
        published_at: thirtyMinutesAgo.toISOString(),
        updated_at: new Date().toISOString()
      })
      .ilike('title', '%রোনালদো%')
      .select('id, title, published_at');
    
    if (updateError) {
      console.error('❌ Error updating article:', updateError);
      return;
    }
    
    console.log('✅ Successfully updated article timestamp!');
    console.log('📊 Updated articles:');
    updated.forEach(article => {
      console.log(`  - ID: ${article.id}`);
      console.log(`  - Title: ${article.title}`);
      console.log(`  - New published_at: ${article.published_at}`);
    });
    
    console.log('🎉 The article should now show "৩০ মিনিট আগে" instead of "২১ ঘন্টা আগে"');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixRonaldoArticleTimestamp()
  .then(() => {
    console.log('✅ Timestamp fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });