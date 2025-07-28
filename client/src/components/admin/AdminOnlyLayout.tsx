import { useState } from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Users, 
  Newspaper, 
  AlertCircle,
  Settings,
  BarChart3,
  LogOut,
  FolderOpen,
  Video,
  Radio,
  Share2,
  Cloud,
  PlusCircle,
  Activity
} from 'lucide-react';
import { Link } from 'wouter';

const navigation = [
  {
    name: 'Dashboard Overview',
    href: '/admin-dashboard',
    icon: Home,
  },
  {
    name: 'Content Management',
    icon: FileText,
    children: [
      { name: 'All Articles', href: '/admin/articles', icon: FileText },
      { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
      { name: 'Breaking News', href: '/admin/breaking-news', icon: AlertCircle },
    ],
  },
  {
    name: 'Media Management',
    icon: Video,
    children: [
      { name: 'E-Papers', href: '/admin/epapers', icon: Newspaper },
      { name: 'Videos', href: '/admin/videos', icon: Video },
      { name: 'Audio Articles', href: '/admin/audio', icon: Radio },
    ],
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Social & Weather',
    icon: Share2,
    children: [
      { name: 'Social Media', href: '/admin/social-media', icon: Share2 },
      { name: 'Weather', href: '/admin/weather', icon: Cloud },
    ],
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

interface AdminOnlyLayoutProps {
  children: React.ReactNode;
}

export function AdminOnlyLayout({ children }: AdminOnlyLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useSupabaseAuth();

  const isActivePath = (href: string) => {
    if (href === '/admin-dashboard') {
      return location === '/admin-dashboard';
    }
    return location.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/admin-login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Enhanced Mobile overlay with improved backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gradient-to-r from-black/60 via-black/50 to-black/40 backdrop-blur-md lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* World-Class Sidebar Design */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-r border-gray-200/80 dark:border-gray-700/80 transform transition-all duration-500 ease-out lg:translate-x-0 shadow-2xl shadow-gray-900/10",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Premium Admin Header */}
          <div className="p-6 lg:p-8 border-b border-gray-200/80 dark:border-gray-700/80 bg-gradient-to-r from-primary/5 via-primary/3 to-primary/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                    <span className="text-white font-bold text-xl">🛡️</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Admin Panel
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Content Management System
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Admin Status Indicator */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">System Online</span>
              </div>
            </div>
          </div>

          {/* World-Class Navigation */}
          <nav className="flex-1 p-6 lg:p-8 overflow-y-auto scrollbar-hide">
            <div className="space-y-3">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div className="mb-6">
                      {/* Category Header */}
                      <div className="flex items-center px-4 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                        <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                        <span className="font-bold">{item.name}</span>
                      </div>
                      
                      {/* Sub-navigation */}
                      <ul className="space-y-1">
                        {item.children.map((child) => (
                          <li key={child.name}>
                            <Link href={child.href}>
                              <span className={cn(
                                "group flex items-center px-4 py-3.5 text-sm rounded-xl transition-all duration-200 cursor-pointer touch-target relative overflow-hidden",
                                isActivePath(child.href)
                                  ? "bg-gradient-to-r from-primary/10 via-primary/8 to-primary/5 text-primary border border-primary/20 shadow-lg shadow-primary/10 font-semibold"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary hover:translate-x-1"
                              )}>
                                <child.icon className={cn(
                                  "mr-4 h-5 w-5 transition-all duration-200",
                                  isActivePath(child.href) 
                                    ? "text-primary scale-110" 
                                    : "text-gray-500 group-hover:text-primary group-hover:scale-105"
                                )} />
                                <span className="font-medium">{child.name}</span>
                                
                                {/* Active indicator */}
                                {isActivePath(child.href) && (
                                  <div className="ml-auto flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                                  </div>
                                )}
                                
                                {/* Hover effect background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10"></div>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <Link href={item.href}>
                      <span className={cn(
                        "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group min-h-[44px]",
                        isActivePath(item.href)
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:shadow-sm"
                      )}>
                        <item.icon className="mr-3 h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                        {isActivePath(item.href) && (
                          <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Enhanced User Profile & Quick Actions */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-medium text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            {/* Enhanced Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Link href="/admin/articles">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs min-h-[36px]">
                  <PlusCircle className="mr-2 h-3 w-3" />
                  New Article
                </Button>
              </Link>
              <Link href="/admin/breaking-news">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs min-h-[36px]">
                  <AlertCircle className="mr-2 h-3 w-3" />
                  Breaking News
                </Button>
              </Link>
            </div>
            
            {/* Enhanced Sign Out Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-xs min-h-[36px] hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-3 w-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:ml-80 flex flex-col min-h-screen">
        {/* Premium Top Header */}
        <div className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-700/80 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 lg:px-8 py-4 lg:py-5">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm" 
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block w-1 h-12 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium mt-1">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enhanced Header Actions */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-4 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">42</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Articles</div>
                </div>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">12</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Published</div>
                </div>
              </div>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* View Website */}
              <Link href="/">
                <Button variant="outline" size="sm" className="touch-target rounded-xl">
                  <span className="mr-2">🌐</span>
                  View Site
                </Button>
              </Link>
              
              {/* User Profile */}
              <div className="relative">
                <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 ring-2 ring-white dark:ring-gray-800">
                    <span className="text-sm font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Admin</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Online</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}