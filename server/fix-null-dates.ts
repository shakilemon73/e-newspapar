import supabase from './supabase';

// Fix any null published_at values in the database
async function fixNullPublishedDates() {
  try {
    console.log('Checking for articles with null published_at...');
    
    // Get articles with null published_at
    const { data: nullDateArticles, error: selectError } = await supabase
      .from('articles')
      .select('id, title, created_at, published_at')
      .is('published_at', null);
    
    if (selectError) {
      console.error('Error fetching null date articles:', selectError);
      return;
    }
    
    if (!nullDateArticles || nullDateArticles.length === 0) {
      console.log('No articles with null published_at found');
      return;
    }
    
    console.log(`Found ${nullDateArticles.length} articles with null published_at`);
    
    // Fix each article by setting published_at to created_at or current date
    for (const article of nullDateArticles) {
      const publishedAt = article.created_at || new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('articles')
        .update({ published_at: publishedAt })
        .eq('id', article.id);
      
      if (updateError) {
        console.error(`Error updating article ${article.id}:`, updateError);
      } else {
        console.log(`Fixed article ${article.id}: "${article.title}"`);
      }
    }
    
    console.log('Date fix complete');
  } catch (error) {
    console.error('Error in fixNullPublishedDates:', error);
  }
}

// Run the fix
fixNullPublishedDates();