import { supabase } from './supabase';

export async function seedAudioArticles() {
  console.log('🌱 Seeding audio articles...');

  const audioArticles = [
    {
      title: 'আজকের সংবাদ সারসংক্ষেপ - ১৯ জানুয়ারি ২০২৫',
      slug: 'todays-news-summary-19-jan-2025',
      audio_url: '/audio/sample-news-summary.mp3',
      duration: 480,
      published_at: new Date().toISOString()
    },
    {
      title: 'অর্থনৈতিক বিশ্লেষণ - জানুয়ারি ২০২৫',
      slug: 'economic-analysis-january-2025',
      audio_url: '/audio/economic-analysis.mp3',

      duration: 720,
      published_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
    },
    {
      title: 'স্বাস্থ্য সচেতনতা - শীতকালীন যত্ন',
      slug: 'health-awareness-winter-care',
      audio_url: '/audio/health-winter-care.mp3',

      duration: 600,
      published_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
    },
    {
      title: 'প্রযুক্তি সংবাদ - এআই এর ব্যবহার',
      slug: 'technology-news-ai-usage',
      audio_url: '/audio/technology-ai.mp3',

      duration: 540,
      published_at: new Date(Date.now() - 3*24*60*60*1000).toISOString()
    }
  ];

  try {
    // Clear existing data
    await supabase.from('audio_articles').delete().neq('id', 0);
    
    const { data, error } = await supabase
      .from('audio_articles')
      .insert(audioArticles)
      .select();

    if (error) {
      console.error('Error seeding audio articles:', error);
      return { success: false, error };
    }

    console.log('✅ Successfully seeded', data?.length || 0, 'audio articles');
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Error in seedAudioArticles:', error);
    return { success: false, error };
  }
}