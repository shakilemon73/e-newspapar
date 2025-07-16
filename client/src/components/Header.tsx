import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Menu, User, LogOut, Home, Bookmark, Bell, X, ChevronDown } from 'lucide-react';
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
  const [searchOpen, setSearchOpen] = useState(false);
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
    
    // Close mobile menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && !(event.target as Element).closest('.mobile-menu')) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      // Focus search input when opening
      setTimeout(() => {
        document.getElementById('mobile-search')?.focus();
      }, 100);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search form submitted with query:', searchQuery);
    if (searchQuery.trim()) {
      console.log('Navigating to search page with query:', searchQuery);
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(''); // Clear search after submission
      setSearchOpen(false); // Close search on mobile
    } else {
      console.log('Empty search query, not navigating');
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
    <header className="glass-effect sticky top-0 z-50 shadow-sm">
      {/* Modern Top Bar with News Priority */}
      <div className="bg-primary text-primary-foreground border-b border-primary/20">
        <div className="container-modern">
          <div className="flex justify-between items-center py-2">
            {/* Date and Location - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-3 text-sm">
              <time className="font-medium">{currentDate}</time>
              <span className="text-primary-foreground/60">•</span>
              <span className="text-primary-foreground/90">ঢাকা, বাংলাদেশ</span>
            </div>

            {/* User Area & Social */}
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name || user.email} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {(user.user_metadata?.name?.[0] || user.email?.[0] || '?').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-3">
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
                      <Link href="/dashboard" className="cursor-pointer">
                        <Home className="mr-2 h-4 w-4" />
                        <span>ড্যাশবোর্ড</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/saved-articles" className="cursor-pointer">
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>সংরক্ষিত</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reading-history" className="cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>পড়ার ইতিহাস</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>লগআউট</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3 text-sm">
                  <Link href="/login" className="btn-link text-primary-foreground hover:text-primary-foreground/80">লগইন</Link>
                  <span className="text-primary-foreground/40">|</span>
                  <Link href="/register" className="btn-link text-primary-foreground hover:text-primary-foreground/80">রেজিস্টার</Link>
                </div>
              )}
              
              {/* Theme Toggle */}
              <div className="border-l border-primary-foreground/20 pl-3">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Header with Logo and Search */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container-modern">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="headline gradient-text hover:scale-105 transition-transform duration-200">
                প্রথম আলো
              </Link>
            </div>
            
            {/* Desktop Search */}
            <div className="hidden md:flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="সংবাদ খুঁজুন..."
                  className="input-modern w-80 pr-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Search size={20} />
                </button>
              </form>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center space-x-2 md:hidden">
              <button 
                onClick={toggleSearch}
                className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <button 
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="md:hidden bg-background border-b border-border p-4 slide-up">
          <form onSubmit={handleSearch} className="relative">
            <Input
              id="mobile-search"
              type="text"
              placeholder="সংবাদ খুঁজুন..."
              className="input-modern w-full pr-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Search size={20} />
            </button>
          </form>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="bg-background/98 backdrop-blur-sm border-b border-border">
        <div className="container-modern">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-start py-2 overflow-x-auto">
            <div className="flex items-center space-x-2 min-w-max">
              <Link href="/" className="nav-link flex items-center whitespace-nowrap">
                <Home size={16} className="mr-1" />
                প্রথম পাতা
              </Link>
              
              {categories.map(category => (
                <Link 
                  key={category.id}
                  href={`/category/${category.slug}`} 
                  className="nav-link whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
              
              <Link href="/epaper" className="nav-link whitespace-nowrap">ই-পেপার</Link>
              <Link href="/videos" className="nav-link whitespace-nowrap">ভিডিও</Link>
              <Link href="/audio-articles" className="nav-link whitespace-nowrap">অডিও</Link>
              <Link href="/advanced-search" className="nav-link whitespace-nowrap">উন্নত অনুসন্ধান</Link>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mobile-menu bg-background border-t border-border animate-in slide-in-from-top-2 duration-200">
              <div className="py-4 px-4 space-y-2">
                <Link href="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <Home size={16} className="mr-2" />
                  প্রথম পাতা
                </Link>
                
                {categories.map(category => (
                  <Link 
                    key={category.id}
                    href={`/category/${category.slug}`} 
                    className="mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
                
                <Link href="/epaper" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>ই-পেপার</Link>
                <Link href="/videos" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>ভিডিও</Link>
                <Link href="/audio-articles" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>অডিও</Link>
                <Link href="/advanced-search" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>উন্নত অনুসন্ধান</Link>
                
                {user && (
                  <>
                    <div className="border-t border-border/50 my-2"></div>
                    <Link href="/dashboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <Home size={16} className="mr-2" />
                      ড্যাশবোর্ড
                    </Link>
                    <Link href="/saved-articles" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <Bookmark size={16} className="mr-2" />
                      সংরক্ষিত আর্টিকেল
                    </Link>
                    <Link href="/reading-history" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <Bell size={16} className="mr-2" />
                      পড়ার ইতিহাস
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
