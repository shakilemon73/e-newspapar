import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { BreakingNewsTicker } from '@/components/BreakingNewsTicker';
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
import { AudioGrid } from '@/components/media/AudioGrid';
import { VideoGrid } from '@/components/media/VideoGrid';
import { HomepageWrapper } from '@/components/AdSensePageWrapper';
import { HeaderBannerAdSense, SidebarAdSense } from '@/components/GoogleAdSenseAds';
import { BreakingNewsTopBanner, BreakingNewsMobileStrip } from '@/components/BreakingNewsAds';


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
    <HomepageWrapper>
      <SEO
        title="বাংলা নিউজ - বাংলাদেশের নম্বর ১ সংবাদ পোর্টাল"
        description="সর্বশেষ খবর, রাজনীতি, খেলা, বিনোদন, অর্থনীতি এবং আরো অনেক কিছুর জন্য বাংলাদেশের সবচেয়ে বিশ্বস্ত সংবাদ মাধ্যম। ২৪/৭ আপডেট পান আমাদের সাথে।"
        image="/og-image.svg"
        url="/"
        type="website"
        keywords="বাংলা সংবাদ, Bangladesh news, তাজা খবর, breaking news, রাজনীতি, খেলা, বিনোদন, অর্থনীতি"
        tags={["news", "bangladesh", "bengali", "সংবাদ", "homepage"]}
      />

      {/* World-Class Mobile-First Design Architecture */}
      <main className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950">
        
        {/* 1. Breaking News Banner - Urgent Information Architecture */}
        <section className="sticky top-0 z-50 mb-2">
          <BreakingNewsTicker />
        </section>

        {/* AdSense Header Banner - Moved below breaking news */}
        <section className="w-full mb-4">
          <HeaderBannerAdSense />
        </section>

        {/* Breaking News Ads - Additional ad space after header banner */}
        <section className="w-full mb-4">
          {/* Desktop Breaking News Ad */}
          <div className="hidden md:block">
            <BreakingNewsTopBanner />
          </div>
          
          {/* Mobile Breaking News Ad */}
          <div className="md:hidden">
            <BreakingNewsMobileStrip />
          </div>
        </section>

        {/* 2. Hero Featured Slideshow - Primary Content Discovery */}
        <section className="px-4 py-6 max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <FeaturedSlideshow />
          </div>
        </section>

        {/* 3. Essential Information Bento Grid - Mobile-First Layout */}
        <section className="px-4 py-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weather + Location Context */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <WeatherWidget />
              </div>
            </div>
            
            {/* Latest News - Primary Content Stream */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-all duration-300">
                <LatestNews />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Personalized AI Recommendations - User-Centric Content */}
        <section className="px-4 py-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50/50 dark:from-green-950/20 dark:via-gray-900 dark:to-emerald-950/10 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-lg">
            <PersonalizedRecommendations />
          </div>
        </section>

        {/* 5. Advanced Feature Discovery Suite - Jakob Nielsen's Recognition Over Recall */}
        <section className="px-4 py-8 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 dark:from-red-400 dark:via-red-300 dark:to-orange-400 bg-clip-text text-transparent mb-3">
              আপনার জন্য বিশেষ সুবিধা
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              আধুনিক প্রযুক্তি ও কৃত্রিম বুদ্ধিমত্তার সাহায্যে আপনার পছন্দের সংবাদ আবিষ্কার করুন
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-900 rounded-3xl border border-purple-100/60 dark:border-purple-900/30 shadow-2xl p-1">
            <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40 rounded-2xl p-6 backdrop-blur-sm">
              <HomepageFeatureSuite />
            </div>
          </div>
        </section>

        {/* 6. Category-Based Content Architecture - Information Scent (Steve Krug) */}
        <section className="px-4 py-6 max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">বিভাগীয় সংবাদ</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!categoriesLoading && mainCategories.length > 0 && mainCategories.map((category, index) => (
              <div 
                key={category.slug} 
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 border border-gray-200/60 dark:border-gray-700/40 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CategoryNewsSection 
                  categorySlug={category.slug} 
                  limit={4}
                />
              </div>
            ))}
            
            {categoriesLoading && (
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 h-80 animate-pulse shadow-lg">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 7. Digital E-Paper - Traditional Media Integration */}
        <section className="px-4 py-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-amber-50 via-white to-yellow-50/50 dark:from-amber-950/20 dark:via-gray-900 dark:to-yellow-950/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-lg overflow-hidden">
            <EPaperSection />
          </div>
        </section>

        {/* 8. Popular & Trending Content - Social Proof Principle */}
        <section className="px-4 py-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50/50 dark:from-rose-950/20 dark:via-gray-900 dark:to-pink-950/10 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-lg">
            <PopularNewsSection />
          </div>
        </section>
        
        {/* 9. Video Content Hub - Rich Media Experience */}
        <section className="px-4 py-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50/50 dark:from-indigo-950/20 dark:via-gray-900 dark:to-blue-950/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-lg">
            <VideoContent />
          </div>
        </section>

        {/* 10. Lifestyle & Entertainment Categories - Emotional Design (Aaron Walter) */}
        {!categoriesLoading && lifestyleCategories.length > 0 && (
          <section className="px-4 py-6 max-w-7xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">জীবনযাত্রা ও বিনোদন</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-teal-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {lifestyleCategories.map((category, index) => (
                <div 
                  key={category.slug} 
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-teal-50/30 to-white dark:from-gray-900 dark:via-teal-950/20 dark:to-gray-900 border border-teal-100/60 dark:border-teal-900/30 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CategoryNewsSection 
                    categorySlug={category.slug} 
                    limit={4}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* 11. Audio Content Hub - Research-Based Audio Player */}
        <section className="px-4 py-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 rounded-2xl p-6 border border-purple-100/60 dark:border-purple-900/30 shadow-lg">
            <AudioGrid 
              title="অডিও আর্টিকেল"
              limit={6}
              showPlayer={true}
              layout="grid"
              className="space-y-6"
            />
          </div>
        </section>

        {/* 12. Video Content Hub - Research-Based Video Player */}
        <section className="px-4 py-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-teal-950/20 rounded-2xl p-6 border border-blue-100/60 dark:border-blue-900/30 shadow-lg">
            <VideoGrid 
              title="ভিডিও কন্টেন্ট"
              limit={6}
              showPlayer={true}
              className="space-y-6"
            />
          </div>
        </section>
        
        {/* 13. Social Media Integration - Community & Sharing */}
        <section className="px-4 py-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-50 via-white to-sky-50/50 dark:from-cyan-950/20 dark:via-gray-900 dark:to-sky-950/10 rounded-2xl border border-cyan-100 dark:border-cyan-900/30 shadow-lg">
            <SocialMediaFeed />
          </div>
        </section>

        {/* 14. AI-Enhanced Intelligence Hub - Future-Forward Features */}
        <section className="px-4 py-8 max-w-7xl mx-auto mb-8">
          <div className="bg-gradient-to-br from-slate-50 via-white to-gray-50/50 dark:from-slate-950/50 dark:via-gray-900 dark:to-slate-950/30 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 shadow-2xl overflow-hidden">
            <div className="relative p-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"></div>
              <div className="relative bg-white/90 dark:bg-gray-900/90 rounded-2xl backdrop-blur-sm">
                <AIEnhancedHomepage />
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Spacing for Mobile Navigation */}
        <div className="h-20 lg:h-8"></div>
      </main>
    </HomepageWrapper>
  );
};

export default Home;
