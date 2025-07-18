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
  Key
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

const navSections = [
  {
    id: 'main',
    enTitle: 'Main',
    bnTitle: 'মূল',
    items: [
      {
        id: 'dashboard',
        href: '/admin-dashboard',
        icon: Home,
        enLabel: 'Dashboard',
        bnLabel: 'ড্যাশবোর্ড',
        description: { en: 'Overview and analytics', bn: 'সংক্ষিপ্ত বিবরণ এবং পরিসংখ্যান' }
      }
    ]
  },
  {
    id: 'content',
    enTitle: 'Content Management',
    bnTitle: 'কন্টেন্ট ব্যবস্থাপনা',
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
        id: 'categories',
        href: '/admin/categories',
        icon: Tag,
        enLabel: 'Categories',
        bnLabel: 'বিভাগ',
        description: { en: 'Organize content categories', bn: 'বিষয়বস্তু বিভাগ সাজান' }
      },
      {
        id: 'epapers',
        href: '/admin/epapers',
        icon: ImageIcon,
        enLabel: 'E-Papers',
        bnLabel: 'ই-পেপার',
        description: { en: 'Digital newspaper editions', bn: 'ডিজিটাল সংবাদপত্র সংস্করণ' }
      },
      {
        id: 'videos',
        href: '/admin/videos',
        icon: Video,
        enLabel: 'Videos',
        bnLabel: 'ভিডিও',
        description: { en: 'Video content management', bn: 'ভিডিও কন্টেন্ট ব্যবস্থাপনা' }
      },
      {
        id: 'audio',
        href: '/admin/audio',
        icon: Headphones,
        enLabel: 'Audio Articles',
        bnLabel: 'অডিও নিবন্ধ',
        description: { en: 'Audio content management', bn: 'অডিও কন্টেন্ট ব্যবস্থাপনা' }
      },
      {
        id: 'breaking-news',
        href: '/admin/breaking-news',
        icon: Bell,
        enLabel: 'Breaking News',
        bnLabel: 'জরুরি সংবাদ',
        badge: 'Live',
        description: { en: 'Urgent news updates', bn: 'জরুরি সংবাদ আপডেট' }
      }
    ]
  },
  {
    id: 'users',
    enTitle: 'Users & Analytics',
    bnTitle: 'ব্যবহারকারী ও বিশ্লেষণ',
    items: [
      {
        id: 'users',
        href: '/admin/users',
        icon: Users,
        enLabel: 'User Management',
        bnLabel: 'ব্যবহারকারী ব্যবস্থাপনা',
        description: { en: 'Manage user accounts', bn: 'ব্যবহারকারী অ্যাকাউন্ট পরিচালনা' }
      },
      {
        id: 'user-dashboard',
        href: '/admin/user-dashboard',
        icon: LayoutDashboard,
        enLabel: 'User Dashboard',
        bnLabel: 'ব্যবহারকারী ড্যাশবোর্ড',
        description: { en: 'User analytics dashboard', bn: 'ব্যবহারকারী বিশ্লেষণ ড্যাশবোর্ড' }
      },
      {
        id: 'analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        enLabel: 'Analytics',
        bnLabel: 'বিশ্লেষণ',
        description: { en: 'Website analytics', bn: 'ওয়েবসাইট বিশ্লেষণ' }
      }
    ]
  },
  {
    id: 'moderation',
    enTitle: 'Content Moderation',
    bnTitle: 'কন্টেন্ট মডারেশন',
    items: [
      {
        id: 'comments',
        href: '/admin/comments',
        icon: MessageSquare,
        enLabel: 'Comments',
        bnLabel: 'মন্তব্য',
        description: { en: 'Moderate user comments', bn: 'ব্যবহারকারীর মন্তব্য সংযত' }
      },
      {
        id: 'trending-analytics',
        href: '/admin/trending-analytics',
        icon: TrendingUp,
        enLabel: 'Trending Analytics',
        bnLabel: 'ট্রেন্ডিং বিশ্লেষণ',
        description: { en: 'Trending content analysis', bn: 'ট্রেন্ডিং কন্টেন্ট বিশ্লেষণ' }
      },
      {
        id: 'advanced-algorithms',
        href: '/admin/advanced-algorithms',
        icon: Bot,
        enLabel: 'Advanced Algorithms',
        bnLabel: 'উন্নত অ্যালগরিদম',
        description: { en: 'AI and ML algorithms', bn: 'এআই এবং এমএল অ্যালগরিদম' }
      }
    ]
  },
  {
    id: 'seo',
    enTitle: 'SEO & Search',
    bnTitle: 'এসইও এবং সার্চ',
    items: [
      {
        id: 'seo',
        href: '/admin/seo',
        icon: Globe,
        enLabel: 'SEO Management',
        bnLabel: 'এসইও ব্যবস্থাপনা',
        description: { en: 'Search engine optimization', bn: 'সার্চ ইঞ্জিন অপটিমাইজেশন' }
      },
      {
        id: 'search',
        href: '/admin/search',
        icon: Search,
        enLabel: 'Search Management',
        bnLabel: 'সার্চ ব্যবস্থাপনা',
        description: { en: 'Search functionality management', bn: 'সার্চ কার্যকারিতা ব্যবস্থাপনা' }
      }
    ]
  },
  {
    id: 'communication',
    enTitle: 'Communication',
    bnTitle: 'যোগাযোগ',
    items: [
      {
        id: 'email-notifications',
        href: '/admin/email-notifications',
        icon: Mail,
        enLabel: 'Email & Notifications',
        bnLabel: 'ইমেইল ও বিজ্ঞপ্তি',
        description: { en: 'Email and notification management', bn: 'ইমেইল এবং বিজ্ঞপ্তি ব্যবস্থাপনা' }
      },
      {
        id: 'social-media',
        href: '/admin/social-media',
        icon: Share2,
        enLabel: 'Social Media',
        bnLabel: 'সোশ্যাল মিডিয়া',
        description: { en: 'Social media management', bn: 'সোশ্যাল মিডিয়া ব্যবস্থাপনা' }
      }
    ]
  },
  {
    id: 'system',
    enTitle: 'System Management',
    bnTitle: 'সিস্টেম ব্যবস্থাপনা',
    items: [
      {
        id: 'database',
        href: '/admin/database',
        icon: Database,
        enLabel: 'Database Management',
        bnLabel: 'ডাটাবেস ব্যবস্থাপনা',
        description: { en: 'Database monitoring and management', bn: 'ডাটাবেস পর্যবেক্ষণ এবং ব্যবস্থাপনা' }
      },
      {
        id: 'performance',
        href: '/admin/performance',
        icon: Activity,
        enLabel: 'Performance Monitoring',
        bnLabel: 'কর্মক্ষমতা পর্যবেক্ষণ',
        description: { en: 'System performance metrics', bn: 'সিস্টেম কর্মক্ষমতা মেট্রিক্স' }
      },
      {
        id: 'mobile-app',
        href: '/admin/mobile-app',
        icon: Smartphone,
        enLabel: 'Mobile App Management',
        bnLabel: 'মোবাইল অ্যাপ ব্যবস্থাপনা',
        description: { en: 'Mobile app configuration', bn: 'মোবাইল অ্যাপ কনফিগারেশন' }
      },
      {
        id: 'security',
        href: '/admin/security',
        icon: Key,
        enLabel: 'Security & Access Control',
        bnLabel: 'নিরাপত্তা ও অ্যাক্সেস নিয়ন্ত্রণ',
        description: { en: 'Security and access management', bn: 'নিরাপত্তা এবং অ্যাক্সেস ব্যবস্থাপনা' }
      }
    ]
  },
  {
    id: 'business',
    enTitle: 'Business',
    bnTitle: 'ব্যবসা',
    items: [
      {
        id: 'advertisements',
        href: '/admin/advertisements',
        icon: DollarSign,
        enLabel: 'Advertisement Management',
        bnLabel: 'বিজ্ঞাপন ব্যবস্থাপনা',
        description: { en: 'Ad management and revenue', bn: 'বিজ্ঞাপন ব্যবস্থাপনা এবং রাজস্ব' }
      },
      {
        id: 'weather',
        href: '/admin/weather',
        icon: Cloud,
        enLabel: 'Weather',
        bnLabel: 'আবহাওয়া',
        description: { en: 'Weather information management', bn: 'আবহাওয়া তথ্য ব্যবস্থাপনা' }
      }
    ]
  },
  {
    id: 'settings',
    enTitle: 'Settings & Configuration',
    bnTitle: 'সেটিংস এবং কনফিগারেশন',
    items: [
      {
        id: 'footer-pages',
        href: '/admin/footer-pages',
        icon: FileText,
        enLabel: 'Footer Pages',
        bnLabel: 'ফুটার পেজ',
        description: { en: 'Manage footer pages', bn: 'ফুটার পেজ ব্যবস্থাপনা' }
      },
      {
        id: 'settings',
        href: '/admin/settings',
        icon: Settings,
        enLabel: 'Settings',
        bnLabel: 'সেটিংস',
        description: { en: 'General settings', bn: 'সাধারণ সেটিংস' }
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
      {/* Header with Bangladesh Cultural Design */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 cultural-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">প</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold bangla-text">
                {t('admin-panel', 'Admin Panel', 'অ্যাডমিন প্যানেল')}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t('admin-subtitle', 'Content Management System', 'কন্টেন্ট ম্যানেজমেন্ট সিস্টেম')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="touch-target"
              aria-label={t('toggle-theme', 'Toggle Theme', 'থিম পরিবর্তন করুন')}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-6" role="navigation" aria-label={t('main-navigation', 'Main navigation', 'মূল নেভিগেশন')}>
          {navSections.map((section) => (
            <div key={section.id} className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t(`section-${section.id}`, section.enTitle, section.bnTitle)}
              </h3>
              <ul className="space-y-1" role="list">
                {section.items.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <li key={item.id} role="listitem">
                      <Link href={item.href}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start h-auto p-3 text-left touch-target micro-interaction ${
                            isActive 
                              ? 'admin-sidebar-item active bg-primary/10 text-primary dark:bg-primary/20' 
                              : 'admin-sidebar-item hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => isMobile && setSidebarOpen(false)}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700">
                              <item.icon className="h-4 w-4 shrink-0 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate bangla-text text-sm">
                                  {t(`nav-${item.id}`, item.enLabel, item.bnLabel)}
                                </span>
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-1 truncate bangla-text">
                                  {t(`desc-${item.id}`, item.description.en, item.description.bn)}
                                </p>
                              )}
                            </div>
                            {isActive && (
                              <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                            )}
                          </div>
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

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-medium text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.email || t('admin-user', 'Admin User', 'অ্যাডমিন ব্যবহারকারী')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('admin-role', 'Administrator', 'প্রশাসক')}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start h-10 touch-target interactive-element"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="bangla-text">
            {t('logout', 'Logout', 'লগ আউট')}
          </span>
        </Button>
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
                    {t('dashboard-title', 'প্রথম আলো Admin', 'প্রথম আলো অ্যাডমিন')}
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