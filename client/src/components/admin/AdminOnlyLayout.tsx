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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Admin Logo & Title */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">PA</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
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
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  {item.children ? (
                    <div>
                      <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </div>
                      <ul className="ml-6 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.name}>
                            <Link href={child.href}>
                              <span className={cn(
                                "flex items-center px-3 py-2 text-sm rounded-md transition-colors cursor-pointer",
                                isActivePath(child.href)
                                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              )}>
                                <child.icon className="mr-3 h-4 w-4" />
                                {child.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <Link href={item.href}>
                      <span className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                        isActivePath(item.href)
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile & Quick Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
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
            
            {/* Quick Action Button */}
            <Link href="/admin/articles">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs mb-2">
                <PlusCircle className="mr-2 h-3 w-3" />
                New Article
              </Button>
            </Link>
            
            {/* Sign Out Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-xs"
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
        {/* Top Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Admin Panel
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your Bengali news website
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Activity className="mr-2 h-4 w-4" />
                Live Stats
              </Button>
              
              <Link href="/">
                <Button variant="ghost" size="sm">
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