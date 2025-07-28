import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState<string>('');
  const { settings: siteSettings } = useSiteSettings();

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const { getCategories } = await import('../lib/supabase-api-direct');
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert(`সাবস্ক্রাইব করার জন্য ধন্যবাদ: ${email}`);
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground">
      {/* Enhanced Footer with Mobile-First Design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="pt-12 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section - Enhanced */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-6">
                <h4 className="text-2xl font-bold mb-3 text-primary-foreground">{siteSettings.siteName}</h4>
                <p className="text-primary-foreground/90 mb-6 leading-relaxed text-sm">
                  বাংলাদেশের সর্বাধিক বিশ্বস্ত অনলাইন সংবাদ মাধ্যম। সত্য, নিরপেক্ষ ও দায়িত্বশীল সংবাদ পরিবেশনের অঙ্গীকারে আমরা প্রতিদিন কাজ করে যাচ্ছি।
                </p>
              </div>
              
              {/* Enhanced Social Media */}
              <div className="mb-6">
                <h5 className="text-sm font-semibold mb-3 text-primary-foreground">আমাদের সাথে থাকুন</h5>
                <div className="flex space-x-3">
                  {[
                    { name: 'Facebook', url: 'https://facebook.com', icon: '📘', color: 'hover:bg-blue-600' },
                    { name: 'Twitter', url: 'https://twitter.com', icon: '🐦', color: 'hover:bg-sky-500' },
                    { name: 'YouTube', url: 'https://youtube.com', icon: '📺', color: 'hover:bg-red-600' },
                    { name: 'Instagram', url: 'https://instagram.com', icon: '📷', color: 'hover:bg-pink-600' },
                  ].map((social) => (
                    <a 
                      key={social.name}
                      href={social.url} 
                      className={`w-10 h-10 rounded-xl bg-primary-foreground/10 ${social.color} transition-all duration-200 flex items-center justify-center text-lg hover:scale-110 hover:shadow-lg`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Mobile Apps - Enhanced */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="https://play.google.com/store" 
                  className="flex items-center space-x-3 px-4 py-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl transition-all duration-200 hover:scale-[1.02] touch-target"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <span className="text-lg">📱</span>
                  <div className="text-left">
                    <div className="text-xs text-primary-foreground/80">Download for</div>
                    <div className="text-sm font-semibold">Android</div>
                  </div>
                </a>
                <a 
                  href="https://apps.apple.com" 
                  className="flex items-center space-x-3 px-4 py-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl transition-all duration-200 hover:scale-[1.02] touch-target"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <span className="text-lg">🍎</span>
                  <div className="text-left">
                    <div className="text-xs text-primary-foreground/80">Download for</div>
                    <div className="text-sm font-semibold">iOS</div>
                  </div>
                </a>
              </div>
            </div>
            
            {/* Enhanced Categories Section */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-primary-foreground flex items-center">
                <span className="mr-2">📰</span>
                বিভাগসমূহ
              </h4>
              <ul className="space-y-2.5">
                {categories.map(category => (
                  <li key={category.id}>
                    <Link 
                      href={`/category/${category.slug}`} 
                      className="text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/5 px-2 py-1 rounded-md transition-all duration-200 block text-sm"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Enhanced About Section */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-primary-foreground flex items-center">
                <span className="mr-2">ℹ️</span>
                আমাদের সম্পর্কে
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/about', label: 'পরিচিতি' },
                  { href: '/editorial-policy', label: 'সম্পাদকীয় নীতিমালা' },
                  { href: '/contact', label: 'যোগাযোগ' },
                  { href: '/advertisement', label: 'বিজ্ঞাপন' },
                  { href: '/archive', label: 'আর্কাইভ' },
                  { href: '/privacy-policy', label: 'গোপনীয়তা নীতি' },
                  { href: '/terms-of-service', label: 'ব্যবহারের শর্তাবলী' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href} 
                      className="text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/5 px-2 py-1 rounded-md transition-all duration-200 block text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Enhanced Newsletter Section */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-primary-foreground flex items-center">
                <span className="mr-2">📧</span>
                সংবাদ আপডেট
              </h4>
              <p className="text-primary-foreground/80 mb-4 text-sm leading-relaxed">
                আমাদের নিউজলেটার সাবস্ক্রাইব করুন এবং সর্বশেষ খবর সরাসরি আপনার ইনবক্সে পান
              </p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div>
                  <Input
                    type="email"
                    placeholder="আপনার ইমেইল ঠিকানা"
                    className="w-full px-4 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-primary-foreground placeholder:text-primary-foreground/60 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-accent hover:bg-accent/90 transition-all duration-200 text-white px-6 py-3 rounded-xl w-full font-medium text-sm hover:scale-[1.02] touch-target"
                >
                  📬 সাবস্ক্রাইব করুন
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Enhanced Footer Bottom */}
        <div className="border-t border-primary-foreground/20 pt-6 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <p className="text-primary-foreground/90 text-sm font-medium">
                © {new Date().getFullYear()} {siteSettings.siteName}
              </p>
              <p className="text-primary-foreground/70 text-xs mt-1">
                সর্বস্বত্ব সংরক্ষিত | বাংলাদেশের বিশ্বস্ত সংবাদ মাধ্যম
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="flex items-center space-x-6 text-xs">
              <Link href="/privacy-policy" className="text-primary-foreground/70 hover:text-accent transition-colors">
                Privacy
              </Link>
              <Link href="/terms-of-service" className="text-primary-foreground/70 hover:text-accent transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-primary-foreground/70 hover:text-accent transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
