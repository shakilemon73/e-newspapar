import { storage } from './storage';

export async function addSampleArticles() {
  console.log('🔧 Adding sample articles to empty categories...');
  
  try {
    const articles = [
      // Entertainment articles
      {
        title: 'ঢালিউডের নতুন চলচ্চিত্র মুক্তি পেল',
        slug: 'new-dhallywood-movie-release-' + Date.now(),
        excerpt: 'ঢালিউডের একটি নতুন চলচ্চিত্র সিনেমা হলে মুক্তি পেয়েছে। দর্শকদের মধ্যে এই চলচ্চিত্র নিয়ে ব্যাপক আগ্রহ।',
        content: 'ঢালিউডের একটি নতুন চলচ্চিত্র সিনেমা হলে মুক্তি পেয়েছে। এই চলচ্চিত্রে রয়েছেন দেশের জনপ্রিয় নায়ক-নায়িকারা। দর্শকদের মধ্যে এই চলচ্চিত্র নিয়ে ব্যাপক আগ্রহ দেখা যাচ্ছে। প্রথম দিনেই সিনেমা হলগুলোতে ভিড় জমেছে।',
        image_url: 'https://images.unsplash.com/photo-1489599511606-0b1e8b5b8c3f?w=800&h=400&fit=crop',
        category_id: 6, // entertainment
        is_featured: false,
        published_at: new Date().toISOString()
      },
      {
        title: 'জনপ্রিয় গায়কের নতুন গান প্রকাশ',
        slug: 'popular-singer-new-song-' + Date.now(),
        excerpt: 'দেশের জনপ্রিয় গায়কের নতুন একটি গান প্রকাশিত হয়েছে। গানটি ইতোমধ্যে সোশ্যাল মিডিয়ায় ব্যাপক জনপ্রিয়তা পেয়েছে।',
        content: 'দেশের জনপ্রিয় গায়কের নতুন একটি গান প্রকাশিত হয়েছে। গানটি ইতোমধ্যে সোশ্যাল মিডিয়ায় ব্যাপক জনপ্রিয়তা পেয়েছে। ভক্তরা এই গানটি নিয়ে খুশি প্রকাশ করেছেন। গানটির কথা ও সুর উভয়ই অসাধারণ।',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
        category_id: 6, // entertainment
        is_featured: false,
        published_at: new Date().toISOString()
      },
      {
        title: 'নতুন নাটকে অভিনয় করবেন জনপ্রিয় অভিনেতা',
        slug: 'popular-actor-new-drama-' + Date.now(),
        excerpt: 'আগামী মাসে প্রচারিত হবে একটি নতুন নাটক। এতে প্রধান চরিত্রে অভিনয় করবেন জনপ্রিয় অভিনেতা।',
        content: 'আগামী মাসে প্রচারিত হবে একটি নতুন নাটক। এতে প্রধান চরিত্রে অভিনয় করবেন জনপ্রিয় অভিনেতা। নাটকটি একটি সামাজিক বিষয় নিয়ে তৈরি। প্রযোজক জানিয়েছেন, এই নাটকে দর্শকরা নতুন কিছু দেখতে পাবেন।',
        image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop',
        category_id: 6, // entertainment
        is_featured: false,
        published_at: new Date().toISOString()
      },
      // Lifestyle articles
      {
        title: 'স্বাস্থ্যকর জীবনযাপনের কিছু টিপস',
        slug: 'healthy-lifestyle-tips-' + Date.now(),
        excerpt: 'স্বাস্থ্যকর জীবনযাপনের জন্য কিছু সহজ এবং কার্যকর পরামর্শ। নিয়মিত ব্যায়াম ও সুষম খাবারের গুরুত্ব।',
        content: 'স্বাস্থ্যকর জীবনযাপনের জন্য কিছু সহজ এবং কার্যকর পরামর্শ। নিয়মিত ব্যায়াম, সুষম খাবার, পর্যাপ্ত ঘুম এবং মানসিক চাপ কমানো - এই সবগুলোই একটি স্বাস্থ্যকর জীবনের জন্য অত্যন্ত গুরুত্বপূর্ণ। প্রতিদিন অন্তত ৩০ মিনিট হাঁটাহাঁটি করুন।',
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
        category_id: 8, // lifestyle
        is_featured: false,
        published_at: new Date().toISOString()
      },
      {
        title: 'ঘরোয়া রান্নার সহজ পদ্ধতি',
        slug: 'easy-home-cooking-methods-' + Date.now(),
        excerpt: 'ঘরে বসে সহজে সুস্বাদু খাবার রান্না করার কিছু টিপস। স্থানীয় উপাদান ব্যবহার করে তৈরি করুন দুর্দান্ত খাবার।',
        content: 'ঘরে বসে সহজে সুস্বাদু খাবার রান্না করার কিছু টিপস। সময় বাঁচানো এবং পুষ্টিকর খাবার তৈরির জন্য এই পদ্ধতিগুলো অনুসরণ করুন। স্থানীয় উপাদান ব্যবহার করে তৈরি করুন দুর্দান্ত খাবার। মশলার সঠিক ব্যবহার জানুন।',
        image_url: 'https://images.unsplash.com/photo-1556909114-54dcf02a6ef6?w=800&h=400&fit=crop',
        category_id: 8, // lifestyle
        is_featured: false,
        published_at: new Date().toISOString()
      },
      {
        title: 'ফ্যাশন ট্রেন্ড: এই মৌসুমে কী পরবেন',
        slug: 'fashion-trends-this-season-' + Date.now(),
        excerpt: 'এই মৌসুমের সর্বশেষ ফ্যাশন ট্রেন্ড নিয়ে আলোচনা। কোন রঙের পোশাক এবং কোন স্টাইল এখন জনপ্রিয়।',
        content: 'এই মৌসুমের সর্বশেষ ফ্যাশন ট্রেন্ড নিয়ে আলোচনা। কোন রঙের পোশাক এবং কোন স্টাইল এখন জনপ্রিয়। ফ্যাশন বিশেষজ্ঞদের মতে, এই বছর প্রাকৃতিক রঙের পোশাক বেশি পছন্দ হচ্ছে। আরামদায়ক কাপড়ের চাহিদাও বেড়েছে।',
        image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop',
        category_id: 8, // lifestyle
        is_featured: false,
        published_at: new Date().toISOString()
      }
    ];

    for (const article of articles) {
      try {
        await storage.createArticle(article);
        console.log(`✅ Added article: ${article.title}`);
      } catch (error) {
        console.error(`❌ Failed to add article: ${article.title}`, error);
      }
    }
    
    console.log('✅ Sample articles addition completed');
    
  } catch (error) {
    console.error('❌ Error during sample articles addition:', error);
  }
}

// Run the function
addSampleArticles();