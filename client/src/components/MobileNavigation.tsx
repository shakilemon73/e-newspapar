import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  User, 
  Settings, 
  Bell, 
  Bookmark, 
  Calendar, 
  Globe, 
  Smartphone,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface MobileNavigationProps {
  categories: Category[];
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useSupabaseAuth();
  const [location, setLocation] = useLocation();

  const closeNavigation = () => {
    setIsOpen(false);
    setExpandedCategory(null);
  };

  const toggleCategory = (categorySlug: string) => {
    setExpandedCategory(expandedCategory === categorySlug ? null : categorySlug);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      closeNavigation();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    closeNavigation();
  };

  const mainMenuItems = [
    { href: '/', label: 'প্রধান পাতা', icon: Home },
    { href: '/epaper', label: 'ই-পেপার', icon: Calendar },
    { href: '/videos', label: 'ভিডিও', icon: Globe },
    { href: '/audio-articles', label: 'অডিও', icon: Smartphone },
  ];

  const userMenuItems = user ? [
    { href: '/dashboard', label: 'ড্যাশবোর্ড', icon: User },
    { href: '/saved-articles', label: 'সংরক্ষিত', icon: Bookmark },
    { href: '/reading-history', label: 'পড়ার ইতিহাস', icon: Calendar },
    { href: '/profile', label: 'প্রোফাইল', icon: Settings },
  ] : [
    { href: '/login', label: 'লগইন', icon: User },
    { href: '/register', label: 'নিবন্ধন', icon: User },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden relative p-2 hover:bg-accent/10 transition-colors"
          aria-label="মেনু খুলুন"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-80 p-0 bg-background border-r border-border"
      >
        <div className="h-full flex flex-col">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {/* Header */}
          <div className="p-4 border-b border-border bg-primary/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary">প্রথম আলো</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeNavigation}
                className="h-8 w-8 hover:bg-accent/10"
                aria-label="মেনু বন্ধ করুন"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="খবর খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-background border border-border focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </form>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto">
            {/* User Section */}
            {user && (
              <div className="p-4 border-b border-border bg-muted/10">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.user_metadata?.name?.[0] || user.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.user_metadata?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Menu */}
            <nav className="p-2">
              <div className="space-y-1">
                {mainMenuItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeNavigation}>
                    <span className="flex items-center px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>

              <Separator className="my-3" />

              {/* Categories */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  বিভাগসমূহ
                </h3>
                {categories.map((category) => (
                  <div key={category.slug}>
                    <button
                      onClick={() => toggleCategory(category.slug)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/10 rounded-lg transition-colors"
                    >
                      <span>{category.name}</span>
                      {expandedCategory === category.slug ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {expandedCategory === category.slug && (
                      <div className="ml-4 mt-1 space-y-1">
                        <Link 
                          href={`/category/${category.slug}`} 
                          onClick={closeNavigation}
                        >
                          <span className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                            সব {category.name}
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-3" />

              {/* User Menu */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {user ? 'আপনার অ্যাকাউন্ট' : 'অ্যাকাউন্ট'}
                </h3>
                {userMenuItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeNavigation}>
                    <span className="flex items-center px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </span>
                  </Link>
                ))}
                
                {user && (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-3 text-sm font-medium text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <User className="h-5 w-5 mr-3" />
                    লগআউট
                  </button>
                )}
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/10">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>© ২০২৫ প্রথম আলো</span>
              <div className="flex space-x-2">
                <Link href="/privacy-policy" onClick={closeNavigation}>
                  <span className="hover:text-primary transition-colors cursor-pointer">গোপনীয়তা</span>
                </Link>
                <span>•</span>
                <Link href="/terms-of-service" onClick={closeNavigation}>
                  <span className="hover:text-primary transition-colors cursor-pointer">শর্তাবলী</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;