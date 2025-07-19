import { supabase } from './supabase';

export async function seedSocialMediaPosts() {
  console.log('🌱 Seeding social media posts...');

  const socialMediaPosts = [
    {
      platform: 'facebook',
      content: 'বাংলাদেশের সর্বশেষ সংবাদ পেতে আমাদের ফলো করুন। আজকের গুরুত্বপূর্ণ ঘটনাবলী নিয়ে থাকুন আপডেট।',
      embed_code: '<div class="fb-post" data-href="https://www.facebook.com/photo.php?fbid=123456" data-width="500"></div>',
      published_at: new Date().toISOString()
    },
    {
      platform: 'facebook',
      content: 'অর্থনৈতিক প্রবৃদ্ধিতে বাংলাদেশের সাফল্য আন্তর্জাতিক মহলে প্রশংসিত হয়েছে।',
      embed_code: '<div class="fb-post" data-href="https://www.facebook.com/photo.php?fbid=123457" data-width="500"></div>',
      published_at: new Date(Date.now() - 2*60*60*1000).toISOString()
    },
    {
      platform: 'twitter',
      content: 'শিক্ষা ক্ষেত্রে নতুন পদক্ষেপ নিয়েছে সরকার। ডিজিটাল বাংলাদেশ গড়ার লক্ষ্যে আরও এক ধাপ এগিয়ে গেল দেশ।',
      embed_code: '<blockquote class="twitter-tweet"><p lang="bn">শিক্ষা ক্ষেত্রে নতুন পদক্ষেপ</p>&mdash; News BD (@newsbd) <a href="https://twitter.com/newsbd/status/123456">জানুয়ারী 19, 2025</a></blockquote>',
      published_at: new Date(Date.now() - 1*60*60*1000).toISOString()
    },
    {
      platform: 'twitter',
      content: 'ক্রিকেট বিশ্বকাপে বাংলাদেশ দলের প্রস্তুতি চলছে পূর্ণোদ্যমে। সমর্থকদের অনুপ্রেরণায় এগিয়ে চলেছে টাইগাররা।',
      embed_code: '<blockquote class="twitter-tweet"><p lang="bn">ক্রিকেট বিশ্বকাপে বাংলাদেশ</p>&mdash; Sports BD (@sportsbd) <a href="https://twitter.com/sportsbd/status/123457">জানুয়ারী 19, 2025</a></blockquote>',
      published_at: new Date(Date.now() - 3*60*60*1000).toISOString()
    },
    {
      platform: 'instagram',
      content: 'ঢাকার সূর্যোদয়ের অপরূপ দৃশ্য। প্রতিটি সকাল নতুন আশার বার্তা নিয়ে আসে।',
      embed_code: '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/ABC123/"></blockquote>',
      published_at: new Date(Date.now() - 4*60*60*1000).toISOString()
    },
    {
      platform: 'instagram',
      content: 'ঐতিহ্যবাহী বাংলা খাবারের উৎসব। রসগোল্লা থেকে শুরু করে বিরিয়ানি - সব কিছুতেই বাঙালির মন।',
      embed_code: '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DEF456/"></blockquote>',
      published_at: new Date(Date.now() - 5*60*60*1000).toISOString()
    }
  ];

  try {
    // Clear existing data
    await supabase.from('social_media_posts').delete().neq('id', 0);
    
    const { data, error } = await supabase
      .from('social_media_posts')
      .insert(socialMediaPosts)
      .select();

    if (error) {
      console.error('Error seeding social media posts:', error);
      return { success: false, error };
    }

    console.log('✅ Successfully seeded', data?.length || 0, 'social media posts');
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Error in seedSocialMediaPosts:', error);
    return { success: false, error };
  }
}