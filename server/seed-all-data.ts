import { seedSocialMediaPosts } from './seed-social-media';
import { seedVideoContent } from './seed-video-content';
import { seedAudioArticles } from './seed-audio-articles';
import { seedPolls } from './seed-polls';

export async function seedAllMissingData() {
  console.log('🚀 Starting comprehensive data seeding...');
  
  const results = {
    socialMedia: await seedSocialMediaPosts(),
    videoContent: await seedVideoContent(),
    audioArticles: await seedAudioArticles(),
    polls: await seedPolls()
  };

  console.log('✅ Data seeding completed!');
  console.log('Results:', JSON.stringify(results, null, 2));
  
  return results;
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAllMissingData().catch(console.error);
}