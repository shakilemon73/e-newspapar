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
  Bell
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
        icon: FileText,
        enLabel: 'Categories',
        bnLabel: 'বিভাগ',
        description: { en: 'Organize content categories', bn: 'বিষয়বস্তু বিভাগ সাজান' }
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
    enTitle: 'User Management',
    bnTitle: 'ব্যবহারকারী ব্যবস্থাপনা',
    items: [
      {
        id: 'users',
        href: '/admin/users',
        icon: Users,
        enLabel: 'Users',
        bnLabel: 'ব্যবহারকারী',
        description: { en: 'Manage user accounts', bn: 'ব্যবহারকারী অ্যাকাউন্ট পরিচালনা' }
      },
      {
        id: 'comments',
        href: '/admin/comments',
        icon: MessageSquare,
        enLabel: 'Comments',
        bnLabel: 'মন্তব্য',
        description: { en: 'Moderate user comments', bn: 'ব্যবহারকারীর মন্তব্য সংযত' }
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
        enLabel: 'Database',
        bnLabel: 'ডাটাবেস',
        description: { en: 'Database monitoring', bn: 'ডাটাবেস পর্যবেক্ষণ' }
      },
      {
        id: 'performance',
        href: '/admin/performance',
        icon: Zap,
        enLabel: 'Performance',
        bnLabel: 'কর্মক্ষমতা',
        description: { en: 'System performance metrics', bn: 'সিস্টেম কর্মক্ষমতা মেট্রিক্স' }
      },
      {
        id: 'security',
        href: '/admin/security',
        icon: Shield,
        enLabel: 'Security',
        bnLabel: 'নিরাপত্তা',
        description: { en: 'Security & access control', bn: 'নিরাপত্তা এবং অ্যাক্সেস নিয়ন্ত্রণ' }
      }
    ]
  },
  {
    id: 'business',
    enTitle: 'Business',
    bnTitle: 'ব্যবসা',
    items: [
      {
        id: 'analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        enLabel: 'Analytics',
        bnLabel: 'বিশ্লেষণ',
        description: { en: 'Website analytics', bn: 'ওয়েবসাইট বিশ্লেষণ' }
      },
      {
        id: 'advertisements',
        href: '/admin/advertisements',
        icon: DollarSign,
        enLabel: 'Advertisements',
        bnLabel: 'বিজ্ঞাপন',
        description: { en: 'Ad management', bn: 'বিজ্ঞাপন ব্যবস্থাপনা' }
      }
    ]
  }
];

export function EnhancedAdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t('admin-panel', 'Admin Panel', 'অ্যাডমিন প্যানেল')}
          </h2>
          <LanguageToggle />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t('admin-subtitle', 'Content Management System', 'কন্টেন্ট ম্যানেজমেন্ট সিস্টেম')}
        </p>
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
                          className={`w-full justify-start h-auto p-3 text-left ${
                            isActive 
                              ? 'bg-secondary text-secondary-foreground' 
                              : 'hover:bg-accent/10'
                          }`}
                          onClick={() => isMobile && setSidebarOpen(false)}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate">
                                  {t(`nav-${item.id}`, item.enLabel, item.bnLabel)}
                                </span>
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {t(`desc-${item.id}`, item.description.en, item.description.bn)}
                                </p>
                              )}
                            </div>
                            {isActive && (
                              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
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
          className="w-full justify-start h-10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t('logout', 'Logout', 'লগ আউট')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 h-10 w-10"
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
        <aside className="w-80 border-r bg-card">
          <NavContent />
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className={`${isMobile ? 'pt-16' : ''}`}>
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}