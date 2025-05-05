import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
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
    <footer className="bg-primary text-white pt-10 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-xl font-bold mb-4 font-hind">প্রথম আলো</h4>
            <p className="text-gray-300 mb-4">দেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র, সত্য ও নিরপেক্ষ সংবাদ প্রকাশের অঙ্গীকার</p>
            <div className="flex space-x-4 mb-4">
              <a href="https://facebook.com" className="hover:text-accent transition" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" className="hover:text-accent transition" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://youtube.com" className="hover:text-accent transition" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="https://instagram.com" className="hover:text-accent transition" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <a href="https://play.google.com/store" className="block px-3 py-2 bg-gray-800 hover:bg-accent rounded transition flex items-center space-x-2" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-android"></i>
                <span>Android App</span>
              </a>
              <a href="https://apps.apple.com" className="block px-3 py-2 bg-gray-800 hover:bg-accent rounded transition flex items-center space-x-2" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-apple"></i>
                <span>iOS App</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4 font-hind">বিভাগসমূহ</h4>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category.id}>
                  <Link href={`/category/${category.slug}`}>
                    <a className="text-gray-300 hover:text-accent transition">{category.name}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4 font-hind">আমাদের সম্পর্কে</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-gray-300 hover:text-accent transition">পরিচিতি</a>
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy">
                  <a className="text-gray-300 hover:text-accent transition">সম্পাদকীয় নীতিমালা</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-300 hover:text-accent transition">যোগাযোগ</a>
                </Link>
              </li>
              <li>
                <Link href="/advertise">
                  <a className="text-gray-300 hover:text-accent transition">বিজ্ঞাপন</a>
                </Link>
              </li>
              <li>
                <Link href="/archive">
                  <a className="text-gray-300 hover:text-accent transition">আর্কাইভ</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  <a className="text-gray-300 hover:text-accent transition">গোপনীয়তা নীতি</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-gray-300 hover:text-accent transition">ব্যবহারের শর্তাবলী</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4 font-hind">সংবাদ আপডেট</h4>
            <p className="text-gray-300 mb-4">আমাদের নিউজলেটার সাবস্ক্রাইব করুন এবং সর্বশেষ খবর পান</p>
            <form onSubmit={handleSubscribe}>
              <div className="mb-4">
                <Input
                  type="email"
                  placeholder="আপনার ইমেইল ঠিকানা"
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent text-white"
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
          <p>© {new Date().getFullYear()} প্রথম আলো। সর্বস্বত্ব সংরক্ষিত</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
