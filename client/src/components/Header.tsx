import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Menu, User, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Input } from '@/components/ui/input';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [location, setLocation] = useLocation();
  const { user, signOut, loading } = useSupabaseAuth();

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
  
  const handleLogout = async () => {
    try {
      await signOut();
      setLocation('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-card dark:bg-card shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary text-white text-sm py-1">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>{currentDate}</span>
            <span>|</span>
            <span>ঢাকা, বাংলাদেশ</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white hover:bg-accent/20">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name || user.email} />
                      <AvatarFallback className="bg-accent text-white">
                        {(user.user_metadata?.name?.[0] || user.email?.[0] || '?').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.name || 'ব্যবহারকারী'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>প্রোফাইল</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/saved-articles" className="cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>সংরক্ষিত আর্টিকেল</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>লগআউট</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth" className="hover:text-accent transition">লগইন</Link>
                <span className="text-gray-400">|</span>
                <Link href="/auth?tab=register" className="hover:text-accent transition">রেজিস্টার</Link>
              </>
            )}
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
            <div className="border-l border-white/20 pl-3">
              <ThemeToggle />
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
      <nav className="border-t border-b border-border bg-card dark:bg-card text-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <button 
              className="lg:hidden mr-4 py-3 text-primary dark:text-primary" 
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
                  <Link href="/" className="px-4 py-2 block hover:bg-muted dark:hover:bg-muted">সর্বশেষ</Link>
                </li>
                
                {categories.map(category => (
                  <li key={category.id}>
                    <Link href={`/category/${category.slug}`} className="px-4 py-2 block hover:bg-muted dark:hover:bg-muted">{category.name}</Link>
                  </li>
                ))}
                
                <li>
                  <Link href="/epaper" className="px-4 py-2 block hover:bg-muted dark:hover:bg-muted">ই-পেপার</Link>
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
