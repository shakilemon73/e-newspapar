import { createClient } from '@supabase/supabase-js';

// SECURITY: Use service role key for seeding to bypass RLS - environment variables only
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('🚨 SECURITY: Missing required environment variables for database seeding');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedCategories() {
  console.log("Seeding categories...");

  // Check if categories already exist
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('id');
    
  if (existingCategories && existingCategories.length > 0) {
    console.log(`Found ${existingCategories.length} existing categories. Skipping category seeding.`);
    return;
  }

  const categories = [
    { name: "রাজনীতি", slug: "politics" },
    { name: "অর্থনীতি", slug: "economy" },
    { name: "আন্তর্জাতিক", slug: "international" },
    { name: "খেলা", slug: "sports" },
    { name: "বিনোদন", slug: "entertainment" },
    { name: "প্রযুক্তি", slug: "technology" },
    { name: "লাইফস্টাইল", slug: "lifestyle" },
    { name: "স্বাস্থ্য", slug: "health" }
  ];

  for (const category of categories) {
    await supabase
      .from('categories')
      .insert(category);
  }

  console.log("Categories seeded successfully!");
}

async function seedSampleData() {
  console.log("Seeding sample data...");

  // Get categories for article creation
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug');

  if (!categories || categories.length === 0) {
    console.log("No categories found. Please seed categories first.");
    return;
  }

  // Check if articles already exist
  const { data: existingArticles } = await supabase
    .from('articles')
    .select('id');

  if (existingArticles && existingArticles.length > 0) {
    console.log(`Found ${existingArticles.length} existing articles. Skipping article seeding.`);
    return;
  }

  const politicsCategory = categories.find(c => c.slug === 'politics');
  const sportsCategory = categories.find(c => c.slug === 'sports');
  const economyCategory = categories.find(c => c.slug === 'economy');

  if (politicsCategory && sportsCategory && economyCategory) {
    const articles = [
      {
        title: "সংসদে আজ উত্থাপিত হবে নতুন বিল",
        slug: "new-bill-parliament-today",
        excerpt: "আজ জাতীয় সংসদে একটি গুরুত্বপূর্ণ বিল উত্থাপিত হবে যা দেশের ভবিষ্যতের জন্য অত্যন্ত তাৎপর্যপূর্ণ।",
        content: "আজ জাতীয় সংসদে একটি গুরুত্বপূর্ণ বিল উত্থাপিত হবে যা দেশের ভবিষ্যতের জন্য অত্যন্ত তাৎপর্যপূর্ণ। এই বিলটি পাস হলে দেশের অর্থনৈতিক কাঠামোতে ব্যাপক পরিবর্তন আসবে।",
        image_url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        category_id: politicsCategory.id,
        is_featured: true,
        view_count: 245,
        published_at: new Date().toISOString()
      },
      {
        title: "নতুন ভ্যারিয়েন্ট মোকাবেলায় সরকারের প্রস্তুতি",
        slug: "new-variant-government-preparation",
        excerpt: "করোনার নতুন ভ্যারিয়েন্ট মোকাবেলায় সরকার বিভিন্ন পদক্ষেপ নিয়েছে।",
        content: "করোনার নতুন ভ্যারিয়েন্ট মোকাবেলায় সরকার বিভিন্ন পদক্ষেপ নিয়েছে। স্বাস্থ্য মন্ত্রণালয় জানিয়েছে যে সকল হাসপাতালে পর্যাপ্ত প্রস্তুতি রয়েছে।",
        image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        category_id: politicsCategory.id,
        is_featured: false,
        view_count: 189,
        published_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        title: "বাংলাদেশ ক্রিকেট দল ইংল্যান্ডের বিপক্ষে জয়ী",
        slug: "bangladesh-cricket-victory-england",
        excerpt: "টেস্ট সিরিজে ইংল্যান্ডের বিপক্ষে অসামান্য জয় পেয়েছে বাংলাদেশ ক্রিকেট দল।",
        content: "টেস্ট সিরিজে ইংল্যান্ডের বিপক্ষে অসামান্য জয় পেয়েছে বাংলাদেশ ক্রিকেট দল। এই জয়ের মাধ্যমে বাংলাদেশ আন্তর্জাতিক ক্রিকেটে নতুন উচ্চতা স্পর্শ করেছে।",
        image_url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2067&q=80",
        category_id: sportsCategory.id,
        is_featured: true,
        view_count: 532,
        published_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    for (const article of articles) {
      await supabase
        .from('articles')
        .insert(article);
    }

    console.log("Sample articles seeded successfully!");
  }

  // Seed breaking news
  const breakingNews = [
    {
      content: "রাজধানীতে নতুন মেট্রোরেল স্টেশন উদ্বোধন",
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  await supabase
    .from('breaking_news')
    .insert(breakingNews);

  console.log("Breaking news seeded successfully!");

  // Seed weather data
  const weatherData = [
    {
      city: "ঢাকা",
      temperature: 28,
      condition: "Partly Cloudy",
      icon: "partly-cloudy",
      forecast: JSON.stringify([
        { day: "আজ", temperature: 28, icon: "partly-cloudy" },
        { day: "আগামীকাল", temperature: 30, icon: "sunny" },
        { day: "পরশু", temperature: 26, icon: "rainy" }
      ]),
      updated_at: new Date().toISOString()
    },
    {
      city: "চট্টগ্রাম",
      temperature: 26,
      condition: "Sunny",
      icon: "sunny",
      forecast: JSON.stringify([
        { day: "আজ", temperature: 26, icon: "sunny" },
        { day: "আগামীকাল", temperature: 28, icon: "sunny" },
        { day: "পরশু", temperature: 24, icon: "cloudy" }
      ]),
      updated_at: new Date().toISOString()
    }
  ];

  for (const weather of weatherData) {
    await supabase
      .from('weather')
      .insert(weather);
  }

  console.log("Weather data seeded successfully!");

  // Seed E-paper
  const epaper = {
    title: "আজকের সংস্করণ",
    publish_date: new Date().toISOString().split('T')[0],
    image_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    pdf_url: "/epapers/today.pdf",
    is_latest: true
  };

  await supabase
    .from('epapers')
    .insert(epaper);

  console.log("E-paper seeded successfully!");

  // Seed video content
  const videoContent = [
    {
      title: "কীভাবে বর্ষা মৌসুমে স্বাস্থ্য সুরক্ষা নিশ্চিত করবেন",
      slug: "health-protection-monsoon-season",
      description: "বর্ষা মৌসুমে স্বাস্থ্য সুরক্ষার জন্য প্রয়োজনীয় পদক্ষেপ এবং পরামর্শ।",
      thumbnail_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "05:30",
      view_count: 1250,
      published_at: new Date().toISOString()
    },
    {
      title: "স্বাস্থ্যকর জীবনযাত্রার জন্য সকালের রুটিন",
      slug: "morning-routine-healthy-lifestyle",
      description: "স্বাস্থ্যকর জীবনযাত্রার জন্য একটি আদর্শ সকালের রুটিন কেমন হওয়া উচিত তা জানুন।",
      thumbnail_url: "https://images.unsplash.com/photo-1506629905350-03d4ea6ad5da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "08:15",
      view_count: 890,
      published_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      title: "প্রযুক্তি ও ভবিষ্যতের শিক্ষা ব্যবস্থা",
      slug: "technology-future-education-system",
      description: "কীভাবে প্রযুক্তি আমাদের শিক্ষা ব্যবস্থাকে পরিবর্তন করছে এবং ভবিষ্যতের সম্ভাবনা।",
      thumbnail_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "12:45",
      view_count: 2100,
      published_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  for (const video of videoContent) {
    await supabase
      .from('video_content')
      .insert(video);
  }

  console.log("Video content seeded successfully!");

  // Seed audio articles
  const audioArticles = [
    {
      title: "বাংলাদেশের জনপ্রিয় খাবারের ইতিহাস",
      slug: "popular-food-history-bangladesh",
      excerpt: "বাংলাদেশের ঐতিহ্যবাহী খাবারের রহস্য এবং তাদের উৎপত্তির গল্প।",
      image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      audio_url: "https://www.soundcloud.com/demo-audio-1",
      duration: "15:30",
      published_at: new Date().toISOString()
    },
    {
      title: "স্বাধীনতা যুদ্ধের অজানা গল্প",
      slug: "unknown-stories-liberation-war",
      excerpt: "বাংলাদেশের স্বাধীনতা যুদ্ধের কিছু অজানা ইতিহাস এবং বীরত্বের গল্প।",
      image_url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      audio_url: "https://www.soundcloud.com/demo-audio-2",
      duration: "22:45",
      published_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      title: "আধুনিক বাংলা কবিতার বিবর্তন",
      slug: "modern-bengali-poetry-evolution",
      excerpt: "আধুনিক বাংলা কবিতার উৎপত্তি থেকে বর্তমান সময় পর্যন্ত এর বিবর্তনের গল্প।",
      image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      audio_url: "https://www.soundcloud.com/demo-audio-3",
      duration: "18:20",
      published_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  for (const audio of audioArticles) {
    await supabase
      .from('audio_articles')
      .insert(audio);
  }

  console.log("Audio articles seeded successfully!");

  // Seed social media posts
  const socialMediaPosts = [
    {
      platform: "facebook",
      content: "আজকের সংবাদ: নতুন প্রযুক্তি উদ্ভাবনে এগিয়ে বাংলাদেশ। আমাদের দেশের তরুণ প্রজন্ম বিশ্বমানের সফটওয়্যার তৈরি করছে।",
      embed_code: '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fexample%2Fposts%2F1234567890&width=500" width="500" height="380" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>',
      post_url: "https://www.facebook.com/example/posts/1234567890",
      published_at: new Date().toISOString()
    },
    {
      platform: "twitter",
      content: "🇧🇩 বাংলাদেশের শিক্ষা ব্যবস্থায় ডিজিটাল বিপ্লব! #DigitalBangladesh #Education #Technology",
      embed_code: '<blockquote class="twitter-tweet"><p lang="bn" dir="ltr">🇧🇩 বাংলাদেশের শিক্ষা ব্যবস্থায় ডিজিটাল বিপ্লব! <a href="https://twitter.com/hashtag/DigitalBangladesh?src=hash&amp;ref_src=twsrc%5Etfw">#DigitalBangladesh</a> <a href="https://twitter.com/hashtag/Education?src=hash&amp;ref_src=twsrc%5Etfw">#Education</a> <a href="https://twitter.com/hashtag/Technology?src=hash&amp;ref_src=twsrc%5Etfw">#Technology</a></p>&mdash; Example News (@ExampleNews) <a href="https://twitter.com/ExampleNews/status/1234567890">January 1, 2025</a></blockquote>',
      post_url: "https://twitter.com/ExampleNews/status/1234567890",
      published_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      platform: "instagram",
      content: "বাংলাদেশের প্রকৃতির সৌন্দর্য 🌿 আমাদের দেশের অপরূপ প্রাকৃতিক দৃশ্য। #Bangladesh #Nature #Beauty",
      embed_code: '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/example/" data-instgrm-version="14" style="background:#FFF;border:0;border-radius:3px;box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15);margin:1px;max-width:540px;min-width:326px;padding:0;width:99.375%;width:-webkit-calc(100% - 2px);width:calc(100% - 2px);"></blockquote>',
      post_url: "https://www.instagram.com/p/example/",
      published_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  for (const post of socialMediaPosts) {
    await supabase
      .from('social_media_posts')
      .insert(post);
  }

  console.log("Social media posts seeded successfully!");
}

async function seed() {
  try {
    await seedCategories();
    await seedSampleData();
    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}

export { seed };