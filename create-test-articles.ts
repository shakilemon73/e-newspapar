/**
 * Create Test Articles - Node.js Script
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestArticles() {
  console.log('🔧 Creating test articles for admin page...');
  
  try {
    const sampleArticles = [
      {
        title: 'ঢাকায় নতুন মেট্রোরেল সম্প্রসারণ',
        slug: 'dhaka-metro-expansion',
        content: 'ঢাকার যানজট নিরসনে মেট্রোরেলের নতুন লাইন চালু হওয়ার প্রস্তুতি নিচ্ছে সরকার। এই প্রকল্পের মাধ্যমে দ্রুততম সময়ে এক স্থান থেকে অন্য স্থানে যাতায়াত সম্ভব হবে।',
        excerpt: 'ঢাকায় মেট্রোরেলের নতুন সম্প্রসারণ প্রকল্প চালু হচ্ছে',
        category_id: 1,
        is_featured: true,
        view_count: 156,
        published_at: new Date().toISOString()
      },
      {
        title: 'বাংলাদেশ ক্রিকেট দলের নতুন সাফল্য',
        slug: 'bangladesh-cricket-success',
        content: 'আন্তর্জাতিক ক্রিকেটে বাংলাদেশ দলের ক্রমাগত উন্নতি দেশের ক্রীড়াপ্রেমীদের আনন্দিত করেছে। টেস্ট র্যাঙ্কিংয়ে বাংলাদেশের অবস্থান আরও শক্তিশালী হয়েছে।',
        excerpt: 'ক্রিকেটে বাংলাদেশের নতুন সাফল্যের গল্প',
        category_id: 2,
        is_featured: false,
        view_count: 89,
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'শিক্ষা ক্ষেত্রে ডিজিটাল উন্নয়ন',
        slug: 'digital-education-development',
        content: 'দেশের শিক্ষা ব্যবস্থায় ডিজিটাল প্রযুক্তির ব্যবহার বৃদ্ধি পেয়েছে। অনলাইন ক্লাস, ই-বুক এবং ডিজিটাল লাইব্রেরির মাধ্যমে শিক্ষার্থীরা আরও ভালো সুবিধা পাচ্ছে।',
        excerpt: 'শিক্ষায় প্রযুক্তির ব্যবহার বৃদ্ধি',
        category_id: 3,
        is_featured: true,
        view_count: 234,
        published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data, error } = await adminSupabase
      .from('articles')
      .insert(sampleArticles)
      .select();

    if (error) {
      console.error('Failed to create test articles:', error);
      return false;
    }

    console.log('✅ Test articles created successfully:', data?.length);
    return true;
  } catch (error) {
    console.error('Error creating test articles:', error);
    return false;
  }
}

async function checkDatabase() {
  console.log('🔍 Checking database structure...');
  
  // Check articles table
  try {
    const { data, error } = await adminSupabase
      .from('articles')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.log('❌ Articles table error:', error.message);
    } else {
      console.log('✅ Articles table accessible');
    }
  } catch (error) {
    console.log('❌ Articles table check failed:', error);
  }
}

async function main() {
  console.log('🚀 Starting database test script...');
  
  await checkDatabase();
  await createTestArticles();
  
  console.log('🎉 Database test completed');
}

main().catch(console.error);