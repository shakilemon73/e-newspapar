import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Menu, User, LogOut, Home, Bookmark, Bell, X, ChevronDown, Users } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Input } from '@/components/ui/input';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileNavigation } from './MobileNavigation';
import { EnhancedSearchSystem } from './EnhancedSearchSystem';

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
  const { settings: siteSettings } = useSiteSettings();

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
    
    // Fetch categories and site settings
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
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
      {/* Enhanced Top Bar - Mobile Optimized */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2.5">
            {/* Date and Breaking News Indicator - Mobile First */}
            <div className="flex items-center space-x-3 text-sm flex-shrink-0">
              <time className="font-medium hidden sm:block whitespace-nowrap">{currentDate}</time>
              <span className="hidden sm:block text-primary-foreground/60">•</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="text-primary-foreground/90 text-xs sm:text-sm font-medium whitespace-nowrap">সর্বশেষ খবর</span>
              </div>
            </div>

            {/* Enhanced User Area & Quick Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
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
                    <DropdownMenuItem asChild>
                      <Link href="/user-engagement" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        <span>এনগেজমেন্ট</span>
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
                <div className="flex items-center space-x-2 text-sm">
                  <Link href="/login" className="px-3 py-1.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors text-primary-foreground font-medium">লগইন</Link>
                  <Link href="/register" className="px-3 py-1.5 bg-accent hover:bg-accent/90 rounded-md transition-colors text-white font-medium">রেজিস্টার</Link>
                </div>
              )}
              
              {/* Enhanced Theme Toggle & Quick Actions */}
              <div className="flex items-center space-x-2 border-l border-primary-foreground/20 pl-2 sm:pl-3">
                <ThemeToggle />
                {/* Mobile Quick Menu */}
                <button 
                  className="sm:hidden p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
                  aria-label="আরো অপশন"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Main Header - Mobile Optimized */}
      <div className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-5">
            {/* Enhanced Logo Section */}
            <div className="flex items-center flex-shrink-0 min-w-0">
              <Link href="/" className="group flex items-center space-x-3 hover:scale-[1.02] transition-all duration-300 ease-out">
                {siteSettings.logoUrl && (
                  <div className="relative overflow-hidden rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                    <img 
                      src={siteSettings.logoUrl} 
                      alt={siteSettings.siteName}
                      className="h-10 sm:h-12 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent leading-tight whitespace-nowrap">
                    {siteSettings.siteName}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block font-medium whitespace-nowrap">
                    বিশ্বস্ত সংবাদ মাধ্যম
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Enhanced Desktop Search */}
            <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-4 xl:mx-8">
              <div className="w-full relative">
                <EnhancedSearchSystem 
                  placeholder="সংবাদ, বিভাগ বা লেখক খুঁজুন..."
                  className="w-full border-2 border-gray-200/80 dark:border-gray-700/80 focus-within:border-primary/50 rounded-xl shadow-sm"
                  showHistory={true}
                  showTrending={true}
                  showFilters={true}
                />
              </div>
            </div>

            {/* Enhanced Desktop & Mobile Controls */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Desktop Media Sections - beside notification */}
              <div className="hidden xl:flex items-center space-x-1 mr-4">
                <Link href="/epaper" className="nav-item px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary whitespace-nowrap">
                  📰 ই-পেপার
                </Link>
                <Link href="/videos" className="nav-item px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary whitespace-nowrap">
                  🎥 ভিডিও
                </Link>
                <Link href="/audio-articles" className="nav-item px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary whitespace-nowrap">
                  🎧 অডিও
                </Link>
              </div>
              
              {/* Search Button - Mobile */}
              <button 
                onClick={toggleSearch}
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target"
                aria-label="সার্চ করুন"
              >
                <Search size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* Notification Bell */}
              {user && (
                <button 
                  className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target relative"
                  aria-label="নোটিফিকেশন"
                >
                  <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </button>
              )}
              
              {/* Mobile Navigation */}
              <div className="lg:hidden">
                <MobileNavigation categories={categories} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Search */}
      {searchOpen && (
        <div className="lg:hidden bg-white/98 dark:bg-gray-900/98 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="relative">
            <EnhancedSearchSystem 
              placeholder="সংবাদ, বিভাগ বা লেখক খুঁজুন..."
              className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
              showHistory={true}
              showTrending={true}
              showFilters={false}
            />
            <button 
              onClick={toggleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="সার্চ বন্ধ করুন"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}
      
      {/* Enhanced Navigation - Mobile First */}
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between py-3 overflow-x-auto scrollbar-hide">
            {/* Left Side - Home and Categories */}
            <div className="flex items-center space-x-1 min-w-max">
              <Link href="/" className="nav-item group flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary">
                <Home size={16} className="group-hover:scale-110 transition-transform" />
                <span>প্রথম পাতা</span>
              </Link>
              
              {/* All Categories Navigation */}
              {categories.map(category => (
                <Link 
                  key={category.id}
                  href={`/category/${category.slug}`} 
                  className="nav-item px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
            </div>
            
            {/* Right Side - Spacer to push content toward notification */}
            <div className="flex-1 max-w-16"></div>
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
