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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile sidebar overlay with backdrop blur */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 lg:translate-x-0 shadow-xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Enhanced Admin Logo & Title */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">PA</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    প্রথম আলো Management
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  {item.children ? (
                    <div>
                      <div className="flex items-center px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                        <item.icon className="mr-3 h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <ul className="ml-6 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.name}>
                            <Link href={child.href}>
                              <span className={cn(
                                "flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 cursor-pointer group min-h-[44px]",
                                isActivePath(child.href)
                                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:shadow-sm"
                              )}>
                                <child.icon className="mr-3 h-4 w-4" />
                                <span className="font-medium">{child.name}</span>
                                {isActivePath(child.href) && (
                                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
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
                </li>
              ))}
            </ul>
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

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Enhanced Top Header */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-3 min-h-[44px] min-w-[44px]"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your Bengali news website with enhanced UX design
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="hidden md:flex min-h-[44px]">
                <Activity className="mr-2 h-4 w-4" />
                Live Stats
              </Button>
              
              <Button variant="outline" size="sm" className="min-h-[44px]">
                <AlertCircle className="h-4 w-4" />
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">3</span>
              </Button>
              
              <Link href="/">
                <Button variant="ghost" size="sm" className="min-h-[44px]">
                  View Website
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}