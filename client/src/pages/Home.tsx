import { Helmet } from 'react-helmet';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import FeaturedSlideshow from '@/components/FeaturedSlideshow';
import WeatherWidget from '@/components/WeatherWidget';
import LatestNews from '@/components/LatestNews';
import CategoryNewsSection from '@/components/CategoryNewsSection';
import EPaperSection from '@/components/EPaperSection';
import PopularNewsSection from '@/components/PopularNewsSection';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';
import SocialMediaFeed from '@/components/SocialMediaFeed';
import VideoContent from '@/components/VideoContent';
import AudioArticles from '@/components/AudioArticles';
import { 
  ContentDiscoveryWidget, 
  UserEngagementPanel, 
  EnhancedFilterPanel 
} from '@/components/UXEnhancementSuite';
import { ContextAwareUXSuite } from '@/components/ContextAwareUXSuite';

const Home = () => {
  // Each category is handled by the CategoryNewsSection component
  const categories = [
    { slug: 'politics', name: 'রাজনীতি' },
    { slug: 'international', name: 'আন্তর্জাতিক' },
    { slug: 'sports', name: 'খেলা' }
  ];

  const lifestyleCategories = [
    { slug: 'lifestyle', name: 'লাইফস্টাইল' },
    { slug: 'entertainment', name: 'বিনোদন' }
  ];

  return (
    <>
      <Helmet>
        <title>প্রথম আলো | বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র</title>
        <meta name="description" content="বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র, সত্য ও নিরপেক্ষ সংবাদ প্রকাশের অঙ্গীকার" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="প্রথম আলো | বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র" />
        <meta property="og:description" content="বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র, সত্য ও নিরপেক্ষ সংবাদ প্রকাশের অঙ্গীকার" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Breaking News Ticker */}
        <section className="fade-in">
          <BreakingNewsTicker />
        </section>

        {/* Featured Section with Slideshow */}
        <section className="container-modern py-6 slide-up">
          <FeaturedSlideshow />
        </section>

        {/* Weather and Latest News Widgets */}
        <section className="container-modern py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Weather Widget */}
            <div className="slide-in-right">
              <WeatherWidget />
            </div>
            
            {/* Latest News */}
            <div className="slide-up">
              <LatestNews />
            </div>
            
            {/* Content Discovery Widget */}
            <div className="slide-in-left">
              <ContentDiscoveryWidget />
            </div>
          </div>
        </section>
        
        {/* Personalized Recommendations */}
        <section className="container-modern py-6 fade-in">
          <PersonalizedRecommendations />
        </section>

        {/* Context-Aware UX Suite */}
        <section className="container-modern py-6 slide-up">
          <ContextAwareUXSuite />
        </section>

        {/* Category News Sections */}
        <section className="container-modern py-6">
          <div className="grid-news mb-8">
            {categories.map((category, index) => (
              <div 
                key={category.slug} 
                className="bounce-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CategoryNewsSection 
                  categorySlug={category.slug} 
                  limit={4}
                />
              </div>
            ))}
          </div>
        </section>

        {/* E-Paper Section */}
        <section className="container-modern py-6 scale-in">
          <EPaperSection />
        </section>

        {/* Popular News Section */}
        <section className="container-modern py-6 slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PopularNewsSection />
            </div>
            <div className="slide-in-left">
              <UserEngagementPanel />
            </div>
          </div>
        </section>
        
        {/* Video Content Section */}
        <section className="container-modern py-6 fade-in">
          <VideoContent />
        </section>

        {/* Lifestyle and Entertainment */}
        <section className="container-modern py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {lifestyleCategories.map((category, index) => (
              <div 
                key={category.slug} 
                className="rotate-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CategoryNewsSection 
                  categorySlug={category.slug} 
                  limit={4}
                />
              </div>
            ))}
          </div>
        </section>
        
        {/* Audio Articles Section */}
        <section className="container-modern py-6 slide-in-right">
          <AudioArticles />
        </section>
        
        {/* Social Media Feed Section */}
        <section className="container-modern py-6 fade-in">
          <SocialMediaFeed />
        </section>
      </main>
    </>
  );
};

export default Home;
