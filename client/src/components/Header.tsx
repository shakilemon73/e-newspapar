import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Get current date in Bengali
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    // Using Bengali locale
    setCurrentDate(today.toLocaleDateString('bn-BD', options));
    
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary text-white text-sm py-1">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>{currentDate}</span>
            <span>|</span>
            <span>ঢাকা, বাংলাদেশ</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-accent transition">লগইন</Link>
            <Link href="/register" className="hover:text-accent transition">রেজিস্টার</Link>
            <div className="flex items-center space-x-2">
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
          </div>
        </div>
      </div>
      
      {/* Logo and Search */}
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Link href="/" className="text-3xl font-bold text-accent font-hind">প্রথম আলো</Link>
        </div>
        
        <div className="w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="সংবাদ খুঁজুন..."
              className="border border-mid-gray px-4 py-2 rounded-full w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-3 top-2.5 text-primary hover:text-accent transition"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="border-t border-b border-mid-gray bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <button 
              className="lg:hidden mr-4 py-3 text-primary" 
              onClick={toggleMobileMenu}
            >
              <Menu size={24} />
            </button>
            
            <ul className="hidden lg:flex overflow-x-auto whitespace-nowrap">
              <li>
                <Link href="/" className="px-3 py-3 block hover:text-accent font-medium transition border-b-2 border-transparent hover:border-accent">সর্বশেষ</Link>
              </li>
              
              {categories.map(category => (
                <li key={category.id}>
                  <Link href={`/category/${category.slug}`} className="px-3 py-3 block hover:text-accent font-medium transition border-b-2 border-transparent hover:border-accent">{category.name}</Link>
                </li>
              ))}
              
              <li>
                <Link href="/epaper" className="px-3 py-3 block hover:text-accent font-medium transition border-b-2 border-transparent hover:border-accent">ই-পেপার</Link>
              </li>
            </ul>
            
            <div className={`mobile-menu ${mobileMenuOpen ? '' : 'hidden'} w-full mt-2 lg:hidden`}>
              <ul className="pb-2">
                <li>
                  <Link href="/" className="px-4 py-2 block hover:bg-light-gray">সর্বশেষ</Link>
                </li>
                
                {categories.map(category => (
                  <li key={category.id}>
                    <Link href={`/category/${category.slug}`} className="px-4 py-2 block hover:bg-light-gray">{category.name}</Link>
                  </li>
                ))}
                
                <li>
                  <Link href="/epaper" className="px-4 py-2 block hover:bg-light-gray">ই-পেপার</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
