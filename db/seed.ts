import { supabase } from "./index";

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