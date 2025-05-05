import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Insert categories
    const categoriesData = [
      { name: "রাজনীতি", slug: "politics", description: "রাজনীতি সংক্রান্ত খবরাখবর" },
      { name: "বাংলাদেশ", slug: "bangladesh", description: "বাংলাদেশ সংক্রান্ত সর্বশেষ খবর" },
      { name: "আন্তর্জাতিক", slug: "international", description: "আন্তর্জাতিক খবর" },
      { name: "অর্থনীতি", slug: "economy", description: "অর্থনীতি বিষয়ক খবর" },
      { name: "খেলা", slug: "sports", description: "খেলাধুলা সংক্রান্ত খবরাখবর" },
      { name: "বিনোদন", slug: "entertainment", description: "বিনোদন জগতের সর্বশেষ খবর" },
      { name: "চাকরি", slug: "jobs", description: "চাকরি সংক্রান্ত খবর" },
      { name: "লাইফস্টাইল", slug: "lifestyle", description: "জীবনযাপন ও স্বাস্থ্য বিষয়ক খবর" },
      { name: "শিক্ষা", slug: "education", description: "শিক্ষা সংক্রান্ত খবর" }
    ];

    // Check if categories exist
    const existingCategories = await db.query.categories.findMany();
    if (existingCategories.length === 0) {
      console.log("Inserting categories...");
      await db.insert(schema.categories).values(categoriesData);
    } else {
      console.log("Categories already exist, skipping insertion");
    }

    // Get all categories for referencing in articles
    const categories = await db.query.categories.findMany();
    const categoryMap = Object.fromEntries(categories.map(cat => [cat.slug, cat.id]));

    // Insert articles
    const articlesData = [
      {
        title: "সংসদে আজ উত্থাপিত হবে নতুন বাজেট প্রস্তাব, আলোচনার অপেক্ষায় সরকার",
        slug: "parliament-budget-proposal",
        content: `বাংলাদেশের অর্থনৈতিক চ্যালেঞ্জ মোকাবেলায় নতুন বাজেট প্রস্তাব আজ সংসদে উত্থাপিত হবে। বিরোধী দলের প্রতিক্রিয়ার অপেক্ষায় সরকার।

আজ দুপুর ২টায় সংসদে উপস্থিত হবেন অর্থমন্ত্রী এবং নতুন অর্থবছরের বাজেট উপস্থাপন করবেন। আগামী অর্থবছরের জন্য সরকার ৭.৫ লক্ষ কোটি টাকার বাজেট প্রস্তাব করেছে, যা গত বছরের তুলনায় ১২% বেশি।

প্রধান বিরোধী দল ইতিমধ্যে এই বাজেট নিয়ে তাদের সন্দেহ প্রকাশ করেছে, বিশেষ করে করারোপ ও মূল্যবৃদ্ধির বিষয়ে তারা উদ্বেগ প্রকাশ করেছে।

বাজেটের প্রধান আকর্ষণ হতে পারে শিক্ষা ও স্বাস্থ্য খাতে বরাদ্দ বৃদ্ধি। সরকার শিক্ষা খাতে জিডিপির ৪% বরাদ্দের ঘোষণা দিতে পারে বলে জানা গেছে।`,
        excerpt: "বাংলাদেশের অর্থনৈতিক চ্যালেঞ্জ মোকাবেলায় নতুন বাজেট প্রস্তাব আজ সংসদে উত্থাপিত হবে। বিরোধী দলের প্রতিক্রিয়ার অপেক্ষায় সরকার।",
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        categoryId: categoryMap["politics"],
        isFeatured: true,
        viewCount: 1240,
        publishedAt: new Date(),
      },
      {
        title: "নতুন ভ্যারিয়েন্ট মোকাবেলায় দেশজুড়ে শুরু হচ্ছে বুস্টার ডোজ প্রদান",
        slug: "covid-booster-dose-campaign",
        content: `করোনাভাইরাসের নতুন ভ্যারিয়েন্ট মোকাবেলায় দেশজুড়ে বুস্টার ডোজ প্রদান শুরু হচ্ছে। স্বাস্থ্য মন্ত্রণালয় আজ এ বিষয়ে একটি বিজ্ঞপ্তি জারি করেছে।

বিজ্ঞপ্তিতে বলা হয়েছে, আগামীকাল থেকে প্রাথমিকভাবে স্বাস্থ্যকর্মী, বয়স্ক নাগরিক এবং ফ্রন্টলাইন কর্মীদের বুস্টার ডোজ দেওয়া হবে। পরবর্তীতে সকল নাগরিকের জন্য এই কার্যক্রম সম্প্রসারিত করা হবে।

টিকাকরণ কেন্দ্রগুলো সকাল ৯টা থেকে বিকেল ৫টা পর্যন্ত খোলা থাকবে। যারা ইতিমধ্যে দুটি ডোজ নিয়েছেন, তারাই কেবল বুস্টার ডোজের জন্য যোগ্য বলে গণ্য হবেন।

বিশেষজ্ঞরা মনে করেন, নতুন ভ্যারিয়েন্ট মোকাবেলায় বুস্টার ডোজ গুরুত্বপূর্ণ ভূমিকা পালন করবে এবং সংক্রমণ থেকে অতিরিক্ত সুরক্ষা প্রদান করবে।`,
        excerpt: "করোনাভাইরাসের নতুন ভ্যারিয়েন্ট মোকাবেলায় দেশজুড়ে বুস্টার ডোজ প্রদান শুরু হচ্ছে।",
        imageUrl: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        categoryId: categoryMap["bangladesh"],
        isFeatured: true,
        viewCount: 980,
        publishedAt: new Date(),
      },
      {
        title: "বাংলাদেশ ক্রিকেট দল ইংল্যান্ড সফরে যাবে আগামী মাসে",
        slug: "cricket-team-england-tour",
        content: `বাংলাদেশ ক্রিকেট দল আগামী মাসে ইংল্যান্ড সফরে যাবে। বাংলাদেশ ক্রিকেট বোর্ড (বিসিবি) গতকাল এই সফরের সময়সূচী ঘোষণা করেছে।

সফরে বাংলাদেশ দল তিনটি টেস্ট ও তিনটি ওয়ানডে ম্যাচ খেলবে। প্রথম টেস্ট শুরু হবে আগামী মাসের ১২ তারিখে লর্ডসে। এরপর বার্মিংহাম ও ম্যানচেস্টারে অন্য দুটি টেস্ট অনুষ্ঠিত হবে।

ওয়ানডে সিরিজ শুরু হবে টেস্ট সিরিজের পর। প্রথম ওয়ানডে লন্ডনে, দ্বিতীয়টি বার্মিংহামে এবং তৃতীয়টি ম্যানচেস্টারে অনুষ্ঠিত হবে।

সফরের জন্য দলে কয়েকটি পরিবর্তন আনা হয়েছে। দুজন নতুন খেলোয়াড়কে দলে অন্তর্ভুক্ত করা হয়েছে। আহমেদ এবং রহমান প্রথমবারের মতো জাতীয় দলে সুযোগ পেয়েছেন।`,
        excerpt: "বাংলাদেশ ক্রিকেট দল আগামী মাসে ইংল্যান্ড সফরে যাবে। বাংলাদেশ ক্রিকেট বোর্ড (বিসিবি) গতকাল এই সফরের সময়সূচী ঘোষণা করেছে।",
        imageUrl: "https://images.unsplash.com/photo-1600679472829-3044539ce8ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        categoryId: categoryMap["sports"],
        isFeatured: true,
        viewCount: 1560,
        publishedAt: new Date(),
      },
      {
        title: "ঢাকার যানজট সমস্যা সমাধানে নতুন উদ্যোগ নিচ্ছে সিটি কর্পোরেশন",
        slug: "dhaka-traffic-jam-solution",
        content: `রাজধানীর যানজট কমাতে নতুন ট্রাফিক ব্যবস্থাপনা চালু হবে আগামী সপ্তাহে। ঢাকা সিটি কর্পোরেশন আজ এক সংবাদ সম্মেলনে এই ঘোষণা দিয়েছে।

নতুন ব্যবস্থাপনার অধীনে, শহরের প্রধান সড়কগুলোতে সময়ভিত্তিক ট্রাফিক নিয়ন্ত্রণ চালু করা হবে। সকাল ৮টা থেকে ১০টা এবং বিকাল ৪টা থেকে ৬টা পর্যন্ত বড় যানবাহন প্রবেশ সীমিত থাকবে।

এছাড়া, শহরের বিভিন্ন পয়েন্টে স্মার্ট ট্রাফিক সিগন্যাল স্থাপন করা হবে, যা ট্রাফিকের পরিমাণ অনুযায়ী স্বয়ংক্রিয়ভাবে সময় সমন্বয় করবে।

সিটি কর্পোরেশনের মেয়র জানিয়েছেন, এই পদক্ষেপগুলো যানজট কমিয়ে আনতে সাহায্য করবে বলে আশা করা হচ্ছে। তিনি নাগরিকদের এই নতুন ব্যবস্থায় সহযোগিতা করার জন্য অনুরোধ করেছেন।`,
        excerpt: "রাজধানীর যানজট কমাতে নতুন ট্রাফিক ব্যবস্থাপনা চালু হবে আগামী সপ্তাহে।",
        imageUrl: "https://images.unsplash.com/photo-1558227576-93261288eace?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        categoryId: categoryMap["bangladesh"],
        isFeatured: false,
        viewCount: 754,
        publishedAt: new Date(),
      },
      {
        title: "বিশ্ববিদ্যালয়গুলোতে নতুন শিক্ষাবর্ষ শুরু হচ্ছে নভেম্বরে",
        slug: "universities-new-academic-year",
        content: `করোনা পরিস্থিতির কারণে পিছিয়ে যাওয়া একাডেমিক ক্যালেন্ডার সমন্বয় করা হচ্ছে। দেশের সব পাবলিক বিশ্ববিদ্যালয়ে নতুন শিক্ষাবর্ষ শুরু হবে আগামী নভেম্বর মাসে।

শিক্ষা মন্ত্রণালয় থেকে জারি করা একটি বিজ্ঞপ্তিতে এ তথ্য জানানো হয়েছে। বিজ্ঞপ্তিতে বলা হয়েছে, সকল পাবলিক বিশ্ববিদ্যালয় ১ নভেম্বর থেকে একটি সমন্বিত একাডেমিক ক্যালেন্ডার অনুসরণ করবে।

ভর্তি পরীক্ষা অক্টোবরের প্রথম সপ্তাহে অনুষ্ঠিত হবে। সেমিস্টার সিস্টেমে চলমান বিশ্ববিদ্যালয়গুলোও এই সময়সূচী অনুসরণ করবে।

উপাচার্যদের সমন্বয় পরিষদ জানিয়েছে, এই পদক্ষেপ একাডেমিক সেশন জট কমাতে সাহায্য করবে এবং শিক্ষার্থীদের সময়মত ডিগ্রি সম্পন্ন করতে সহায়তা করবে।`,
        excerpt: "করোনা পরিস্থিতির কারণে পিছিয়ে যাওয়া একাডেমিক ক্যালেন্ডার সমন্বয় করা হচ্ছে।",
        imageUrl: "https://images.unsplash.com/photo-1551184451-76b792384a83?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        categoryId: categoryMap["education"],
        isFeatured: false,
        viewCount: 642,
        publishedAt: new Date(),
      },
      {
        title: "জাতিসংঘ সাধারণ পরিষদে জলবায়ু পরিবর্তন নিয়ে জোরালো বক্তব্য বাংলাদেশের",
        slug: "un-climate-change-bangladesh",
        content: `জাতিসংঘ সাধারণ পরিষদের ৭৭তম অধিবেশনে জলবায়ু পরিবর্তনের বিষয়ে বাংলাদেশের প্রতিনিধি বলেন, উন্নত বিশ্বকে দায়িত্ব নিতে হবে।

বাংলাদেশের প্রতিনিধি তার বক্তব্যে জলবায়ু পরিবর্তনের ফলে উপকূলীয় এলাকায় বসবাসকারী মানুষের জীবনযাপনে পড়া নেতিবাচক প্রভাব তুলে ধরেন।

তিনি বলেন, "জলবায়ু পরিবর্তন একটি বৈশ্বিক সমস্যা এবং এর সমাধানও বৈশ্বিক হতে হবে। বাংলাদেশের মতো দেশগুলো এর জন্য দায়ী নয়, কিন্তু আমরা এর সবচেয়ে বড় শিকার।"

জাতিসংঘের মহাসচিব বাংলাদেশের অবস্থানকে সমর্থন করেছেন এবং উন্নত দেশগুলোকে আরও সহায়তা প্রদানের আহ্বান জানিয়েছেন। তিনি জলবায়ু অর্থায়ন বৃদ্ধির উপর জোর দিয়েছেন।`,
        excerpt: "জাতিসংঘ সাধারণ পরিষদের ৭৭তম অধিবেশনে জলবায়ু পরিবর্তনের বিষয়ে বাংলাদেশের প্রতিনিধি বলেন, উন্নত বিশ্বকে দায়িত্ব নিতে হবে।",
        imageUrl: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        categoryId: categoryMap["international"],
        isFeatured: false,
        viewCount: 834,
        publishedAt: new Date(),
      }
    ];

    // Check if we have articles already
    const articleCount = await db.query.articles.findMany({
      limit: 1
    });

    if (articleCount.length === 0) {
      console.log("Inserting articles...");
      for (const article of articlesData) {
        await db.insert(schema.articles).values(article);
      }
    } else {
      console.log("Articles already exist, skipping insertion");
    }

    // Insert e-papers
    const epapersData = [
      {
        title: "আজকের সংস্করণ",
        publishDate: new Date(),
        imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=240&q=80",
        pdfUrl: "https://example.com/epaper/latest.pdf",
        isLatest: true,
      },
      {
        title: "গতকালের সংস্করণ",
        publishDate: new Date(Date.now() - 86400000), // yesterday
        imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=240&q=80",
        pdfUrl: "https://example.com/epaper/yesterday.pdf",
        isLatest: false,
      }
    ];

    const epaperCount = await db.query.epapers.findMany({
      limit: 1
    });

    if (epaperCount.length === 0) {
      console.log("Inserting e-papers...");
      for (const epaper of epapersData) {
        await db.insert(schema.epapers).values(epaper);
      }
    } else {
      console.log("E-papers already exist, skipping insertion");
    }

    // Insert weather data
    const weatherData = [
      {
        city: "ঢাকা",
        temperature: 32,
        condition: "আংশিক মেঘলা",
        icon: "fas fa-sun",
        forecast: JSON.stringify([
          { day: "আজ", temperature: 32, icon: "fas fa-sun" },
          { day: "বৃহস্পতি", temperature: 30, icon: "fas fa-cloud-sun" },
          { day: "শুক্রবার", temperature: 28, icon: "fas fa-cloud-rain" },
          { day: "শনিবার", temperature: 29, icon: "fas fa-cloud" }
        ])
      },
      {
        city: "চট্টগ্রাম",
        temperature: 31,
        condition: "আংশিক মেঘলা",
        icon: "fas fa-cloud-sun",
        forecast: JSON.stringify([
          { day: "আজ", temperature: 31, icon: "fas fa-cloud-sun" },
          { day: "বৃহস্পতি", temperature: 30, icon: "fas fa-cloud" },
          { day: "শুক্রবার", temperature: 29, icon: "fas fa-cloud-rain" },
          { day: "শনিবার", temperature: 30, icon: "fas fa-cloud" }
        ])
      },
      {
        city: "সিলেট",
        temperature: 29,
        condition: "বৃষ্টিপাত",
        icon: "fas fa-cloud-rain",
        forecast: JSON.stringify([
          { day: "আজ", temperature: 29, icon: "fas fa-cloud-rain" },
          { day: "বৃহস্পতি", temperature: 28, icon: "fas fa-cloud-rain" },
          { day: "শুক্রবার", temperature: 27, icon: "fas fa-cloud-rain" },
          { day: "শনিবার", temperature: 28, icon: "fas fa-cloud" }
        ])
      },
      {
        city: "রাজশাহী",
        temperature: 33,
        condition: "রোদ্রোজ্জ্বল",
        icon: "fas fa-sun",
        forecast: JSON.stringify([
          { day: "আজ", temperature: 33, icon: "fas fa-sun" },
          { day: "বৃহস্পতি", temperature: 34, icon: "fas fa-sun" },
          { day: "শুক্রবার", temperature: 33, icon: "fas fa-cloud-sun" },
          { day: "শনিবার", temperature: 32, icon: "fas fa-cloud-sun" }
        ])
      },
      {
        city: "খুলনা",
        temperature: 32,
        condition: "আংশিক মেঘলা",
        icon: "fas fa-cloud-sun",
        forecast: JSON.stringify([
          { day: "আজ", temperature: 32, icon: "fas fa-cloud-sun" },
          { day: "বৃহস্পতি", temperature: 31, icon: "fas fa-cloud" },
          { day: "শুক্রবার", temperature: 30, icon: "fas fa-cloud-rain" },
          { day: "শনিবার", temperature: 31, icon: "fas fa-cloud" }
        ])
      }
    ];

    const weatherCount = await db.query.weather.findMany({
      limit: 1
    });

    if (weatherCount.length === 0) {
      console.log("Inserting weather data...");
      for (const weather of weatherData) {
        await db.insert(schema.weather).values(weather);
      }
    } else {
      console.log("Weather data already exists, skipping insertion");
    }

    // Insert breaking news
    const breakingNewsData = [
      {
        content: "ঢাকায় তাপমাত্রা বাড়ছে, স্বাস্থ্য বিভাগের সতর্কতা",
        isActive: true,
      },
      {
        content: "জাতীয় নির্বাচনের তারিখ ঘোষণা আজ",
        isActive: true,
      },
      {
        content: "দেশের অর্থনীতি ধীরে ধীরে স্থিতিশীল হচ্ছে - অর্থমন্ত্রী",
        isActive: true,
      },
      {
        content: "রাজধানীতে নতুন মেট্রোরেল রুট চালু হচ্ছে আগামী মাসে",
        isActive: true,
      }
    ];

    const breakingNewsCount = await db.query.breakingNews.findMany({
      limit: 1
    });

    if (breakingNewsCount.length === 0) {
      console.log("Inserting breaking news...");
      for (const news of breakingNewsData) {
        await db.insert(schema.breakingNews).values(news);
      }
    } else {
      console.log("Breaking news already exists, skipping insertion");
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}

seed();
