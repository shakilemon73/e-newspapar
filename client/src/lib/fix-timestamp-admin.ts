/**
 * Admin Timestamp Fix Utility
 * Uses the existing admin Supabase client to fix article timestamps
 */

import { supabase } from './supabase';

export async function fixRonaldoArticleTimestamp() {
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
      throw findError;
    }
    
    if (!articles || articles.length === 0) {
      console.log('❌ রোনালদো article not found');
      return { success: false, message: 'Article not found' };
    }
    
    console.log(`📝 Found ${articles.length} matching article(s):`);
    articles.forEach(article => {
      console.log(`  - ID: ${article.id}`);
      console.log(`  - Title: ${article.title}`);
      console.log(`  - Current published_at: ${article.published_at}`);
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
      throw updateError;
    }
    
    console.log('✅ Successfully updated article timestamp!');
    console.log('📊 Updated articles:', updated);
    
    return { 
      success: true, 
      message: 'Timestamp updated successfully',
      updatedArticles: updated
    };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { 
      success: false, 
      message: error.message || 'Unknown error',
      error
    };
  }
}

// Function to fix any article timestamp
export async function fixArticleTimestamp(titleKeyword: string, minutesAgo: number) {
  try {
    console.log(`🔧 Fixing timestamp for article containing: "${titleKeyword}"`);
    
    const correctTimestamp = new Date(Date.now() - minutesAgo * 60 * 1000);
    console.log(`⏰ Setting timestamp to: ${correctTimestamp.toISOString()} (${minutesAgo} minutes ago)`);
    
    const { data: updated, error: updateError } = await supabase
      .from('articles')
      .update({ 
        published_at: correctTimestamp.toISOString(),
        updated_at: new Date().toISOString()
      })
      .ilike('title', `%${titleKeyword}%`)
      .select('id, title, published_at');
    
    if (updateError) {
      console.error('❌ Error updating article:', updateError);
      throw updateError;
    }
    
    console.log('✅ Successfully updated article timestamp!');
    return { success: true, updatedArticles: updated };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error };
  }
}