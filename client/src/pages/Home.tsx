import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
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

import { ContextAwareUXSuite } from '@/components/ContextAwareUXSuite';
import { HomepageFeatureSuite } from '@/components/HomepageFeatureSuite';
import { AIEnhancedHomepage } from '@/components/AI/AIEnhancedHomepage';

interface Category {
  id: number;
  slug: string;
  name: string;
}

const Home = () => {
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // SEO for homepage will be handled by SEO component

  // Fetch available categories from database (Direct Supabase)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { categoriesApiDirect } = await import('../lib/queryClient-direct');
        const categories = await categoriesApiDirect.getAll();
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories if API fails
        setAvailableCategories([
          { id: 1, slug: 'economy', name: 'অর্থনীতি' },
          { id: 2, slug: 'technology', name: 'প্রযুক্তি' },
          { id: 3, slug: 'education', name: 'শিক্ষা' }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Use first 3 categories for main sections
  const mainCategories = availableCategories.slice(0, 3);
  // Use remaining categories for lifestyle sections
  const lifestyleCategories = availableCategories.slice(3, 5);

  return (
    <>
      <SEO
        title="Bengali News - বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র"
        description="সর্বশেষ সংবাদ, রাজনীতি, খেলা, বিনোদন, আন্তর্জাতিক এবং আরো অনেক কিছু পড়ুন বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যমে। Breaking news, politics, sports, entertainment from Bangladesh."
        image="/og-image.svg"
        url="/"
        type="website"
        keywords="বাংলা সংবাদ, Bangladesh news, bengali news, dhaka news, bd news, breaking news, রাজনীতি, খেলা, বিনোদন"
        tags={["news", "bangladesh", "bengali", "সংবাদ", "homepage"]}
      />

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weather Widget */}
            <div className="slide-in-right">
              <WeatherWidget />
            </div>
            
            {/* Latest News */}
            <div className="slide-up">
              <LatestNews />
            </div>
          </div>
        </section>
        
        {/* Personalized Recommendations */}
        <section className="container-modern py-6 fade-in">
          <PersonalizedRecommendations />
        </section>

        {/* Homepage Feature Suite - Missing Features */}
        <section className="container-modern py-6 slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
              আপনার জন্য বিশেষ সুবিধা
            </h2>
            <HomepageFeatureSuite />
          </div>
        </section>



        {/* Category News Sections */}
        <section className="container-modern py-6">
          <div className="grid-news mb-8">
            {!categoriesLoading && mainCategories.length > 0 && mainCategories.map((category, index) => (
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
            
            {categoriesLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-border rounded shadow-sm p-4 h-80 animate-pulse">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* E-Paper Section */}
        <section className="container-modern py-6 scale-in">
          <EPaperSection />
        </section>

        {/* Popular News Section */}
        <section className="container-modern py-6 slide-up">
          <PopularNewsSection />
        </section>
        
        {/* Video Content Section */}
        <section className="container-modern py-6 fade-in">
          <VideoContent />
        </section>

        {/* Lifestyle and Entertainment */}
        {!categoriesLoading && lifestyleCategories.length > 0 && (
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
        )}
        
        {/* Audio Articles Section */}
        <section className="container-modern py-6 slide-in-right">
          <AudioArticles />
        </section>
        
        {/* Social Media Feed Section */}
        <section className="container-modern py-6 fade-in">
          <SocialMediaFeed />
        </section>

        {/* AI-Enhanced Features */}
        <section className="container-modern py-6">
          <AIEnhancedHomepage />
        </section>
      </main>
    </>
  );
};

export default Home;
