/**
 * Database Data Integrity Fix
 * Adds missing articles to empty categories and ensures data consistency
 */

import supabase from './supabase';

export async function fixDatabaseData() {
  console.log('🔧 Starting database data integrity fix...');
  
  try {
    // Check current article distribution by category
    const { data: categoryStats, error: statsError } = await supabase
      .from('articles')
      .select('category_id, category:categories(name, slug)')
      .order('category_id');
    
    if (statsError) {
      console.error('Error fetching category stats:', statsError);
      return;
    }
    
    // Group by category
    const categoryCounts: { [key: string]: number } = {};
    categoryStats?.forEach(article => {
      const categorySlug = (article.category as any)?.slug || 'unknown';
      categoryCounts[categorySlug] = (categoryCounts[categorySlug] || 0) + 1;
    });
    
    console.log('📊 Current category distribution:', categoryCounts);
    
    // Get category IDs for empty categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .in('slug', ['entertainment', 'lifestyle', 'technology', 'health']);
    
    if (catError) {
      console.error('Error fetching categories:', catError);
      return;
    }
    
    console.log('📂 Found categories:', categories);
    
    // Add sample articles for empty categories
    const sampleArticles = [
      // Entertainment articles
      {
        title: 'ঢালিউডের নতুন চলচ্চিত্র মুক্তি পেল',
        slug: 'new-dhallywood-movie-release',
        excerpt: 'ঢালিউডের একটি নতুন চলচ্চিত্র সিনেমা হলে মুক্তি পেয়েছে।',
        content: 'ঢালিউডের একটি নতুন চলচ্চিত্র সিনেমা হলে মুক্তি পেয়েছে। এই চলচ্চিত্রে রয়েছেন দেশের জনপ্রিয় নায়ক-নায়িকারা। দর্শকদের মধ্যে এই চলচ্চিত্র নিয়ে ব্যাপক আগ্রহ দেখা যাচ্ছে।',
        image_url: 'https://images.unsplash.com/photo-1489599511606-0b1e8b5b8c3f?w=800&h=400&fit=crop',
        category_id: 6, // entertainment
        is_featured: false,
        view_count: 156,
        published_at: new Date().toISOString()
      },
      {
        title: 'জনপ্রিয় গায়কের নতুন গান প্রকাশ',
        slug: 'popular-singer-new-song',
        excerpt: 'দেশের জনপ্রিয় গায়কের নতুন একটি গান প্রকাশিত হয়েছে।',
        content: 'দেশের জনপ্রিয় গায়কের নতুন একটি গান প্রকাশিত হয়েছে। গানটি ইতোমধ্যে সোশ্যাল মিডিয়ায় ব্যাপক জনপ্রিয়তা পেয়েছে। ভক্তরা এই গানটি নিয়ে খুশি প্রকাশ করেছেন।',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
        category_id: 6, // entertainment
        is_featured: false,
        view_count: 234,
        published_at: new Date().toISOString()
      },
      // Lifestyle articles
      {
        title: 'স্বাস্থ্যকর জীবনযাপনের কিছু টিপস',
        slug: 'healthy-lifestyle-tips',
        excerpt: 'স্বাস্থ্যকর জীবনযাপনের জন্য কিছু সহজ এবং কার্যকর পরামর্শ।',
        content: 'স্বাস্থ্যকর জীবনযাপনের জন্য কিছু সহজ এবং কার্যকর পরামর্শ। নিয়মিত ব্যায়াম, সুষম খাবার, পর্যাপ্ত ঘুম এবং মানসিক চাপ কমানো - এই সবগুলোই একটি স্বাস্থ্যকর জীবনের জন্য অত্যন্ত গুরুত্বপূর্ণ।',
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
        category_id: 8, // lifestyle
        is_featured: false,
        view_count: 189,
        published_at: new Date().toISOString()
      },
      {
        title: 'ঘরোয়া রান্নার সহজ পদ্ধতি',
        slug: 'easy-home-cooking-methods',
        excerpt: 'ঘরে বসে সহজে সুস্বাদু খাবার রান্না করার কিছু টিপস।',
        content: 'ঘরে বসে সহজে সুস্বাদু খাবার রান্না করার কিছু টিপস। সময় বাঁচানো এবং পুষ্টিকর খাবার তৈরির জন্য এই পদ্ধতিগুলো অনুসরণ করুন। স্থানীয় উপাদান ব্যবহার করে তৈরি করুন দুর্দান্ত খাবার।',
        image_url: 'https://images.unsplash.com/photo-1556909114-54dcf02a6ef6?w=800&h=400&fit=crop',
        category_id: 8, // lifestyle
        is_featured: false,
        view_count: 145,
        published_at: new Date().toISOString()
      }
    ];
    
    // Insert articles only for categories that exist
    const existingCategoryIds = categories?.map(cat => cat.id) || [];
    const articlesToInsert = sampleArticles.filter(article => 
      existingCategoryIds.includes(article.category_id)
    );
    
    if (articlesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('articles')
        .insert(articlesToInsert);
      
      if (insertError) {
        console.error('Error inserting articles:', insertError);
      } else {
        console.log(`✅ Successfully added ${articlesToInsert.length} articles`);
      }
    }
    
    // Verify the fix
    const { data: updatedStats, error: verifyError } = await supabase
      .from('articles')
      .select('category_id, category:categories(name, slug)')
      .order('category_id');
    
    if (!verifyError) {
      const updatedCounts: { [key: string]: number } = {};
      updatedStats?.forEach(article => {
        const categorySlug = (article.category as any)?.slug || 'unknown';
        updatedCounts[categorySlug] = (updatedCounts[categorySlug] || 0) + 1;
      });
      
      console.log('📊 Updated category distribution:', updatedCounts);
    }
    
    console.log('✅ Database data integrity fix completed');
    
  } catch (error) {
    console.error('❌ Error during database fix:', error);
  }
}

// Auto-run when imported
if (require.main === module) {
  fixDatabaseData();
}