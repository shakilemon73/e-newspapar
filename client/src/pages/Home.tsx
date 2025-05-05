import { Helmet } from 'react-helmet';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import FeaturedSlideshow from '@/components/FeaturedSlideshow';
import WeatherWidget from '@/components/WeatherWidget';
import LatestNews from '@/components/LatestNews';
import CategoryNewsSection from '@/components/CategoryNewsSection';
import EPaperSection from '@/components/EPaperSection';
import PopularNewsSection from '@/components/PopularNewsSection';

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
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Breaking News Ticker */}
        <BreakingNewsTicker />

        {/* Featured Section with Slideshow */}
        <FeaturedSlideshow />

        {/* Weather and Latest News Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weather Widget */}
          <WeatherWidget />
          
          {/* Latest News */}
          <LatestNews />
        </div>

        {/* Category News Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => (
            <CategoryNewsSection 
              key={category.slug} 
              categorySlug={category.slug} 
              limit={4}
            />
          ))}
        </div>

        {/* E-Paper Section */}
        <EPaperSection />

        {/* Popular News Section */}
        <PopularNewsSection />

        {/* Lifestyle and Entertainment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {lifestyleCategories.map((category) => (
            <CategoryNewsSection 
              key={category.slug} 
              categorySlug={category.slug} 
              limit={4}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
