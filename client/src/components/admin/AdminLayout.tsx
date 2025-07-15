import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  BarChart3,
  ImageIcon,
  Calendar,
  Bell,
  Tag,
  Video,
  Headphones,
  Cloud,
  Share2,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin-dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Content Management',
    icon: FileText,
    children: [
      { name: 'Articles', href: '/admin/articles', icon: FileText },
      { name: 'Categories', href: '/admin/categories', icon: Tag },
      { name: 'E-Papers', href: '/admin/epapers', icon: ImageIcon },
      { name: 'Videos', href: '/admin/videos', icon: Video },
      { name: 'Audio Articles', href: '/admin/audio', icon: Headphones },
    ],
  },
  {
    name: 'Breaking News',
    href: '/admin/breaking-news',
    icon: Bell,
    badge: 'Live',
  },
  {
    name: 'Users & Analytics',
    icon: Users,
    children: [
      { name: 'User Management', href: '/admin/users', icon: Users },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },

  {
    name: 'Social & Weather',
    icon: Share2,
    children: [
      { name: 'Social Media', href: '/admin/social', icon: Share2 },
      { name: 'Weather', href: '/admin/weather', icon: Cloud },
    ],
  },
  {
    name: 'Publishing',
    href: '/admin/publishing',
    icon: Calendar,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useSupabaseAuth();

  const isActivePath = (href: string) => {
    if (href === '/admin-dashboard') {
      return location === '/admin-dashboard';
    }
    return location.startsWith(href);
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
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              প্রথম আলো Admin
            </h1>
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
                      <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </div>
                      <ul className="ml-6 mt-1 space-y-1">
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
                        {item.badge && (
                          <Badge className="ml-auto" variant="destructive">
                            {item.badge}
                          </Badge>
                        )}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Welcome back, Admin
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}