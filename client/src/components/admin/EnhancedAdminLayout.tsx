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
  Sun,
  Folder,
  Image,
  Newspaper,
  MonitorPlay,
  Mic,
  Eye,
  Star,
  Clock,
  BookOpen,
  Archive,
  Palette,
  Code
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

// COMPLETELY REDESIGNED CLEAR NAVIGATION
// Simple structure that's easy to understand and navigate
const navSections = [
  {
    id: 'main',
    enTitle: 'Main',
    bnTitle: 'প্রধান',
    items: [
      {
        id: 'dashboard',
        href: '/admin-dashboard',
        icon: LayoutDashboard,
        enLabel: 'Dashboard',
        bnLabel: 'ড্যাশবোর্ড'
      },
      {
        id: 'articles',
        href: '/admin/articles',
        icon: FileText,
        enLabel: 'Articles',
        bnLabel: 'নিবন্ধ'
      },
      {
        id: 'breaking-news',
        href: '/admin/breaking-news',
        icon: Zap,
        enLabel: 'Breaking News',
        bnLabel: 'ব্রেকিং নিউজ',
        badge: '3'
      }
    ]
  },
  {
    id: 'content',
    enTitle: 'Content Management',
    bnTitle: 'কন্টেন্ট ব্যবস্থাপনা',
    items: [
      {
        id: 'categories',
        href: '/admin/categories',
        icon: Folder,
        enLabel: 'Categories',
        bnLabel: 'বিভাগ'
      },
      {
        id: 'videos',
        href: '/admin/videos',
        icon: Video,
        enLabel: 'Videos',
        bnLabel: 'ভিডিও'
      },
      {
        id: 'audio-articles',
        href: '/admin/audio-articles',
        icon: Headphones,
        enLabel: 'Audio Articles',
        bnLabel: 'অডিও নিবন্ধ'
      },
      {
        id: 'epapers',
        href: '/admin/epapers',
        icon: Newspaper,
        enLabel: 'E-Papers',
        bnLabel: 'ই-পেপার'
      },
      {
        id: 'images',
        href: '/admin/images',
        icon: Image,
        enLabel: 'Images',
        bnLabel: 'ছবি'
      }
    ]
  },
  {
    id: 'engagement',
    enTitle: 'User Engagement',
    bnTitle: 'ব্যবহারকারী সম্পৃক্ততা',
    items: [
      {
        id: 'comments',
        href: '/admin/comments',
        icon: MessageSquare,
        enLabel: 'Comments',
        bnLabel: 'মন্তব্য'
      },
      {
        id: 'social-media',
        href: '/admin/social-media',
        icon: Share2,
        enLabel: 'Social Media',
        bnLabel: 'সামাজিক মিডিয়া'
      },
      {
        id: 'email-notifications',
        href: '/admin/email-notifications',
        icon: Mail,
        enLabel: 'Email Notifications',
        bnLabel: 'ইমেইল বিজ্ঞপ্তি'
      },
      {
        id: 'user-dashboard',
        href: '/admin/user-dashboard',
        icon: Users,
        enLabel: 'User Dashboard',
        bnLabel: 'ব্যবহারকারী ড্যাশবোর্ড'
      }
    ]
  },
  {
    id: 'analytics',
    enTitle: 'Analytics & Reports',
    bnTitle: 'বিশ্লেষণ ও প্রতিবেদন',
    items: [
      {
        id: 'analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        enLabel: 'Site Analytics',
        bnLabel: 'সাইট বিশ্লেষণ'
      },
      {
        id: 'trending',
        href: '/admin/trending-analytics',
        icon: TrendingUp,
        enLabel: 'Trending Topics',
        bnLabel: 'ট্রেন্ডিং বিষয়'
      },
      {
        id: 'performance',
        href: '/admin/performance',
        icon: Activity,
        enLabel: 'Performance',
        bnLabel: 'কর্মক্ষমতা'
      }
    ]
  },
  {
    id: 'marketing',
    enTitle: 'Marketing & SEO',
    bnTitle: 'মার্কেটিং ও এসইও',
    items: [
      {
        id: 'advertisements',
        href: '/admin/advertisements',
        icon: DollarSign,
        enLabel: 'Advertisements',
        bnLabel: 'বিজ্ঞাপন'
      },
      {
        id: 'seo',
        href: '/admin/seo',
        icon: Search,
        enLabel: 'SEO Management',
        bnLabel: 'এসইও ব্যবস্থাপনা'
      },
      {
        id: 'search-management',
        href: '/admin/search-management',
        icon: Eye,
        enLabel: 'Search Management',
        bnLabel: 'অনুসন্ধান ব্যবস্থাপনা'
      }
    ]
  },
  {
    id: 'system',
    enTitle: 'System & Security',
    bnTitle: 'সিস্টেম ও নিরাপত্তা',
    items: [
      {
        id: 'users',
        href: '/admin/users',
        icon: Users,
        enLabel: 'User Management',
        bnLabel: 'ব্যবহারকারী ব্যবস্থাপনা'
      },
      {
        id: 'security',
        href: '/admin/security',
        icon: Shield,
        enLabel: 'Security & Access',
        bnLabel: 'নিরাপত্তা ও অ্যাক্সেস'
      },
      {
        id: 'database',
        href: '/admin/database',
        icon: Database,
        enLabel: 'Database Management',
        bnLabel: 'ডাটাবেস ব্যবস্থাপনা'
      },
      {
        id: 'algorithms',
        href: '/admin/algorithms',
        icon: Bot,
        enLabel: 'Advanced Algorithms',
        bnLabel: 'উন্নত অ্যালগরিদম'
      }
    ]
  },
  {
    id: 'settings',
    enTitle: 'Settings & Config',
    bnTitle: 'সেটিংস ও কনফিগারেশন',
    items: [
      {
        id: 'weather',
        href: '/admin/weather',
        icon: Cloud,
        enLabel: 'Weather Management',
        bnLabel: 'আবহাওয়া ব্যবস্থাপনা'
      },
      {
        id: 'mobile-app',
        href: '/admin/mobile-app',
        icon: Smartphone,
        enLabel: 'Mobile App',
        bnLabel: 'মোবাইল অ্যাপ'
      },
      {
        id: 'footer-pages',
        href: '/admin/footer-pages',
        icon: BookOpen,
        enLabel: 'Footer Pages',
        bnLabel: 'ফুটার পৃষ্ঠা'
      },
      {
        id: 'settings',
        href: '/admin/settings',
        icon: Settings,
        enLabel: 'General Settings',
        bnLabel: 'সাধারণ সেটিংস'
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* SIMPLE AND CLEAR HEADER */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">প</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">
              {t('admin-panel', 'Admin Panel', 'অ্যাডমিন প্যানেল')}
            </h2>
          </div>
        </div>
      </div>

      {/* CLEAN NAVIGATION - Much easier to understand */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-3 space-y-6">
          {navSections.map((section) => (
            <div key={section.id} className="space-y-2">
              {/* Clear section titles */}
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3">
                {t(`section-${section.id}`, section.enTitle, section.bnTitle)}
              </h3>
              
              {/* Clean navigation items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.id} href={item.href}>
                      <div
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => isMobile && setSidebarOpen(false)}
                      >
                        {/* Clear icons */}
                        <div className={`p-2 rounded-md ${
                          isActive 
                            ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        
                        {/* Clear text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate">
                              {t(`nav-${item.id}`, item.enLabel, item.bnLabel)}
                            </span>
                            {item.badge && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {isActive && (
                          <ChevronRight className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* CLEAN USER SECTION */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('admin-role', 'Administrator', 'প্রশাসক')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 w-8 p-0 text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
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