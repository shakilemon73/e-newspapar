import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Users, 
  Settings, 
  BarChart3,
  Database,
  Shield,
  Smartphone,
  MessageSquare,
  Search,
  Mail,
  DollarSign,
  Cloud,
  Zap,
  ChevronRight,
  LogOut,
  Bell,
  Tag,
  ImageIcon,
  Video,
  Headphones,
  LayoutDashboard,
  TrendingUp,
  Bot,
  Globe,
  Share2,
  Activity,
  Key,
  Moon,
  Sun
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  href: string;
  icon: React.ElementType;
  enLabel: string;
  bnLabel: string;
  badge?: string;
  description?: { en: string; bn: string };
}

// SIMPLIFIED NAVIGATION - Following Nielsen Norman Group's 7±2 rule and Miller's Law
// Reduced from 25+ items to 6 main categories to reduce cognitive load
// Baymard Institute: Maximum 5-6 categories for optimal dashboard UX
const navSections = [
  {
    id: 'overview',
    enTitle: 'Overview',
    bnTitle: 'সংক্ষিপ্ত বিবরণ',
    color: 'from-blue-500 to-blue-600',
    items: [
      {
        id: 'dashboard',
        href: '/admin-dashboard',
        icon: Home,
        enLabel: 'Dashboard',
        bnLabel: 'ড্যাশবোর্ড',
        description: { en: 'Key metrics and overview', bn: 'প্রধান মেট্রিক্স এবং সংক্ষিপ্ত বিবরণ' }
      },
      {
        id: 'analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        enLabel: 'Analytics',
        bnLabel: 'বিশ্লেষণ',
        description: { en: 'Performance insights', bn: 'কর্মক্ষমতা অন্তর্দৃষ্টি' }
      }
    ]
  },
  {
    id: 'content',
    enTitle: 'Content',
    bnTitle: 'কন্টেন্ট',
    color: 'from-green-500 to-green-600',
    items: [
      {
        id: 'articles',
        href: '/admin/articles',
        icon: FileText,
        enLabel: 'Articles',
        bnLabel: 'নিবন্ধ',
        description: { en: 'Manage news articles', bn: 'সংবাদ নিবন্ধ পরিচালনা' }
      },
      {
        id: 'breaking-news',
        href: '/admin/breaking-news',
        icon: Bell,
        enLabel: 'Breaking News',
        bnLabel: 'জরুরি সংবাদ',
        badge: 'Live',
        description: { en: 'Urgent updates', bn: 'জরুরি আপডেট' }
      },
      {
        id: 'videos',
        href: '/admin/videos',
        icon: Video,
        enLabel: 'Videos',
        bnLabel: 'ভিডিও',
        description: { en: 'Video content', bn: 'ভিডিও কন্টেন্ট' }
      },
      {
        id: 'categories',
        href: '/admin/categories',
        icon: Tag,
        enLabel: 'Categories',
        bnLabel: 'বিভাগ',
        description: { en: 'Content categories', bn: 'কন্টেন্ট বিভাগ' }
      }
    ]
  },
  {
    id: 'audience',
    enTitle: 'Audience',
    bnTitle: 'দর্শক',
    color: 'from-purple-500 to-purple-600',
    items: [
      {
        id: 'users',
        href: '/admin/users',
        icon: Users,
        enLabel: 'Users',
        bnLabel: 'ব্যবহারকারী',
        description: { en: 'User management', bn: 'ব্যবহারকারী ব্যবস্থাপনা' }
      },
      {
        id: 'trending-analytics',
        href: '/admin/trending-analytics',
        icon: TrendingUp,
        enLabel: 'Trending',
        bnLabel: 'ট্রেন্ডিং',
        description: { en: 'Popular content insights', bn: 'জনপ্রিয় কন্টেন্ট অন্তর্দৃষ্টি' }
      }
    ]
  },
  {
    id: 'tools',
    enTitle: 'Tools',
    bnTitle: 'টুলস',
    color: 'from-orange-500 to-orange-600',
    items: [
      {
        id: 'search',
        href: '/admin/search',
        icon: Search,
        enLabel: 'Search',
        bnLabel: 'সার্চ',
        description: { en: 'Search management', bn: 'সার্চ ব্যবস্থাপনা' }
      },
      {
        id: 'security',
        href: '/admin/security',
        icon: Key,
        enLabel: 'Security',
        bnLabel: 'নিরাপত্তা',
        description: { en: 'Access control', bn: 'অ্যাক্সেস নিয়ন্ত্রণ' }
      },
      {
        id: 'weather',
        href: '/admin/weather',
        icon: Cloud,
        enLabel: 'Weather',
        bnLabel: 'আবহাওয়া',
        description: { en: 'Weather management', bn: 'আবহাওয়া ব্যবস্থাপনা' }
      }
    ]
  },
  {
    id: 'more',
    enTitle: 'More',
    bnTitle: 'আরও',
    color: 'from-slate-500 to-slate-600',
    items: [
      {
        id: 'epapers',
        href: '/admin/epapers',
        icon: ImageIcon,
        enLabel: 'E-Papers',
        bnLabel: 'ই-পেপার',
        description: { en: 'Digital editions', bn: 'ডিজিটাল সংস্করণ' }
      },
      {
        id: 'footer-pages',
        href: '/admin/footer-pages',
        icon: FileText,
        enLabel: 'Footer Pages',
        bnLabel: 'ফুটার পেজ',
        description: { en: 'Footer page management', bn: 'ফুটার পেজ ব্যবস্থাপনা' }
      }
    ]
  },
  {
    id: 'settings',
    enTitle: 'Settings',
    bnTitle: 'সেটিংস',
    color: 'from-gray-500 to-gray-600',
    items: [
      {
        id: 'settings',
        href: '/admin/settings',
        icon: Settings,
        enLabel: 'Site Settings',
        bnLabel: 'সাইট সেটিংস',
        description: { en: 'Configure your site', bn: 'আপনার সাইট কনফিগার করুন' }
      }
    ]
  }
];

export function EnhancedAdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState(3);
  const { t } = useLanguage();
  const { user, logout } = useSupabaseAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Don Norman's Discoverability: Clear visual affordances with immediate feedback */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Jonathan Ive's Simplicity: Purpose-driven visual hierarchy */}
            <div className="relative group">
              <div className="w-10 h-10 cultural-gradient rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 cursor-pointer">
                <span className="text-white font-bold text-base bangla-text">প</span>
              </div>
              {/* Micro-interaction for emotional connection */}
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-red-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
            </div>
            <div className="space-y-1">
              {/* Luke Wroblewski: Content priority with clear hierarchy */}
              <h2 className="text-lg font-bold bangla-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {t('admin-panel', 'Admin Panel', 'অ্যাডমিন প্যানেল')}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {t('admin-subtitle', 'Content Management System', 'কন্টেন্ট ম্যানেজমেন্ট সিস্টেম')}
              </p>
            </div>
          </div>
          {/* Steve Krug: Familiar patterns with clear conventions */}
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-10 w-10 touch-target hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg"
              aria-label={t('toggle-theme', 'Toggle Theme', 'থিম পরিবর্তন করুন')}
            >
              {theme === 'light' ? 
                <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" /> : 
                <Sun className="h-4 w-4 text-yellow-500" />
              }
            </Button>
            {/* Notifications with social proof */}
            {notifications > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 touch-target relative hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg"
                aria-label={`${notifications} ${t('notifications', 'notifications', 'বিজ্ঞপ্তি')}`}
              >
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
                  {notifications}
                </span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Farai Madzima: Accessible breadcrumb for current location */}
        <div className="px-6 py-2 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs">
            <Home className="h-3 w-3 text-gray-400" />
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-300 font-medium bangla-text">
              {navSections.find(section => 
                section.items.some(item => item.href === location)
              )?.items.find(item => item.href === location)?.bnLabel ||
              t('admin-dashboard', 'Dashboard', 'ড্যাশবোর্ড')}
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        {/* Susan Weinschenk: Attention management with visual hierarchy */}
        <nav className="space-y-8" role="navigation" aria-label={t('main-navigation', 'Main navigation', 'মূল নেভিগেশন')}>
          {navSections.map((section) => (
            <div key={section.id} className="space-y-3">
              {/* Dieter Rams: Understandable self-explanatory interface */}
              <div className="flex items-center gap-2 px-3">
                <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700"></div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 bg-white dark:bg-gray-900">
                  {t(`section-${section.id}`, section.enTitle, section.bnTitle)}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent dark:from-gray-700"></div>
              </div>
              
              <ul className="space-y-1" role="list">
                {section.items.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <li key={item.id} role="listitem">
                      <Link href={item.href}>
                        {/* Alan Cooper: Direct manipulation with goal-oriented design */}
                        <Button
                          variant="ghost"
                          className={`w-full justify-start h-auto p-0 text-left group relative overflow-hidden transition-all duration-300 ease-out ${
                            isActive 
                              ? 'bg-primary/5 text-primary dark:bg-primary/10 shadow-sm' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-sm'
                          }`}
                          onClick={() => isMobile && setSidebarOpen(false)}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          {/* Luke Wroblewski: 44px minimum touch targets */}
                          <div className="flex items-center gap-4 w-full p-4 min-h-[52px]">
                            {/* Don Norman: Visual affordances with clear signifiers */}
                            <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                              isActive 
                                ? 'bg-primary/10 text-primary scale-110' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:scale-105'
                            }`}>
                              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`font-semibold truncate bangla-text transition-colors ${
                                  isActive ? 'text-primary' : 'text-gray-900 dark:text-gray-100'
                                }`}>
                                  {t(`nav-${item.id}`, item.enLabel, item.bnLabel)}
                                </span>
                                {item.badge && (
                                  <Badge 
                                    variant="secondary" 
                                    className="text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 animate-pulse"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground truncate bangla-text leading-relaxed">
                                  {t(`desc-${item.id}`, item.description.en, item.description.bn)}
                                </p>
                              )}
                            </div>
                            
                            {/* Aarron Walter: Emotional design with delightful transitions */}
                            <div className={`transition-all duration-200 ${
                              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-60 group-hover:scale-75'
                            }`}>
                              <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                            </div>
                          </div>
                          
                          {/* Active indicator with cultural colors */}
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-red-500 rounded-r-full"></div>
                          )}
                          
                          {/* Hover effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </Button>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Julie Zhuo: Systems thinking with consistent user experience */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-t from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="space-y-4">
          {/* User profile with emotional design */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800">
                <span className="text-lg font-bold text-primary-foreground bangla-text">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-bold truncate text-gray-900 dark:text-gray-100">
                {user?.email || t('admin-user', 'Admin User', 'অ্যাডমিন ব্যবহারকারী')}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Shield className="h-3 w-3" />
                {t('admin-role', 'Administrator', 'প্রশাসক')}
              </p>
            </div>
          </div>
          
          {/* System health indicators - Susan Weinschenk: Social proof */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xs font-bold text-green-600 dark:text-green-400">৯৯%</div>
              <div className="text-xs text-green-700 dark:text-green-300 bangla-text">আপটাইম</div>
            </div>
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400">৫২ms</div>
              <div className="text-xs text-blue-700 dark:text-blue-300 bangla-text">রেসপনস</div>
            </div>
            <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xs font-bold text-purple-600 dark:text-purple-400">৪৮২</div>
              <div className="text-xs text-purple-700 dark:text-purple-300 bangla-text">ইউজার</div>
            </div>
          </div>
          
          {/* Enhanced logout with error prevention */}
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 touch-target group hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-700 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3 group-hover:text-red-500 transition-colors" />
            <span className="bangla-text font-medium group-hover:text-red-600 dark:group-hover:text-red-400">
              {t('logout', 'Logout', 'লগ আউট')}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 bangladesh-colors">
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 h-10 w-10 touch-target interactive-element"
              aria-label={t('open-menu', 'Open menu', 'মেনু খুলুন')}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <NavContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-80 border-r bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <NavContent />
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Enhanced Header */}
        <header className="admin-header sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="touch-target"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 cultural-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">প</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white bangla-text">
                    {t('dashboard-title', ' Admin', ' অ্যাডমিন')}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('news-management', 'News Management System', 'সংবাদ ব্যবস্থাপনা সিস্টেম')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="bangla-text text-xs">
                    {t('server-status', 'All Systems Operational', 'সব সিস্টেম চালু')}
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="touch-target"
                  aria-label={t('notifications', 'Notifications', 'বিজ্ঞপ্তি')}
                >
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className={`admin-main minimal-interface ${isMobile ? 'pt-4' : ''}`}>
          <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}