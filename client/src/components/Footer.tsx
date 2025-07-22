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
    <footer className="bg-primary text-primary-foreground pt-10 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-xl font-bold mb-4 text-primary-foreground">{siteSettings.siteName}</h4>
            <p className="text-primary-foreground/80 mb-4">দেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র, সত্য ও নিরপেক্ষ সংবাদ প্রকাশের অঙ্গীকার</p>
            <div className="flex space-x-4 mb-4">
              <a href="https://facebook.com" className="text-primary-foreground hover:text-accent transition" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" className="text-primary-foreground hover:text-accent transition" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://youtube.com" className="text-primary-foreground hover:text-accent transition" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="https://instagram.com" className="text-primary-foreground hover:text-accent transition" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <a href="https://play.google.com/store" className="block px-3 py-2 bg-primary-foreground/10 hover:bg-accent rounded transition flex items-center space-x-2" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-android"></i>
                <span>Android App</span>
              </a>
              <a href="https://apps.apple.com" className="block px-3 py-2 bg-primary-foreground/10 hover:bg-accent rounded transition flex items-center space-x-2" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-apple"></i>
                <span>iOS App</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4 text-primary-foreground">বিভাগসমূহ</h4>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category.id}>
                  <Link href={`/category/${category.slug}`} className="text-primary-foreground/80 hover:text-accent transition">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4 text-primary-foreground">আমাদের সম্পর্কে</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-primary-foreground/80 hover:text-accent transition">পরিচিতি</Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="text-primary-foreground/80 hover:text-accent transition">সম্পাদকীয় নীতিমালা</Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-foreground/80 hover:text-accent transition">যোগাযোগ</Link>
              </li>
              <li>
                <Link href="/advertisement" className="text-primary-foreground/80 hover:text-accent transition">বিজ্ঞাপন</Link>
              </li>
              <li>
                <Link href="/archive" className="text-primary-foreground/80 hover:text-accent transition">আর্কাইভ</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-primary-foreground/80 hover:text-accent transition">গোপনীয়তা নীতি</Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-primary-foreground/80 hover:text-accent transition">ব্যবহারের শর্তাবলী</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4 text-primary-foreground">সংবাদ আপডেট</h4>
            <p className="text-primary-foreground/80 mb-4">আমাদের নিউজলেটার সাবস্ক্রাইব করুন এবং সর্বশেষ খবর পান</p>
            <form onSubmit={handleSubscribe}>
              <div className="mb-4">
                <Input
                  type="email"
                  placeholder="আপনার ইমেইল ঠিকানা"
                  className="w-full px-4 py-2 rounded bg-primary-foreground/10 border border-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-accent text-primary-foreground placeholder:text-primary-foreground/60"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="bg-accent hover:bg-opacity-90 transition text-white px-4 py-2 rounded w-full font-medium"
              >
                সাবস্ক্রাইব
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-4 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} {siteSettings.siteName}। সর্বস্বত্ব সংরক্ষিত</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
