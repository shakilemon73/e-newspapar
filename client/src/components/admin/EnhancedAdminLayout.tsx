import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Badge } from '@/components/ui/badge';
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
  Activity,
  Bell,
  Search,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Zap,
  Brain,
  TrendingUp
} from 'lucide-react';
import { Link } from 'wouter';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/hooks/use-language';
import { uxEnhancer } from '@/lib/ux-enhancer';

const navigation = [
  {
    name: 'Dashboard Overview',
    href: '/admin-dashboard',
    icon: Home,
    description: 'Main dashboard with key metrics and quick actions',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    name: 'Content Management',
    icon: FileText,
    description: 'Manage articles, categories, and breaking news',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    children: [
      { 
        name: 'All Articles', 
        href: '/admin/articles', 
        icon: FileText,
        description: 'Create, edit, and manage all articles',
        shortcut: 'A'
      },
      { 
        name: 'Categories', 
        href: '/admin/categories', 
        icon: FolderOpen,
        description: 'Organize content with categories',
        shortcut: 'C'
      },
      { 
        name: 'Breaking News', 
        href: '/admin/breaking-news', 
        icon: AlertCircle,
        description: 'Manage urgent news updates',
        shortcut: 'B'
      },
    ],
  },
  {
    name: 'Media Management',
    icon: Video,
    description: 'Handle multimedia content and e-papers',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    children: [
      { 
        name: 'E-Papers', 
        href: '/admin/epapers', 
        icon: Newspaper,
        description: 'Upload and manage digital newspapers',
        shortcut: 'E'
      },
      { 
        name: 'Videos', 
        href: '/admin/videos', 
        icon: Video,
        description: 'Video content management',
        shortcut: 'V'
      },
      { 
        name: 'Audio Articles', 
        href: '/admin/audio', 
        icon: Radio,
        description: 'Audio content and podcasts',
        shortcut: 'U'
      },
    ],
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage user accounts and permissions',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    name: 'Social & Weather',
    icon: Share2,
    description: 'Social media integration and weather updates',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    children: [
      { 
        name: 'Social Media', 
        href: '/admin/social-media', 
        icon: Share2,
        description: 'Social media posts and integration',
        shortcut: 'S'
      },
      { 
        name: 'Weather', 
        href: '/admin/weather', 
        icon: Cloud,
        description: 'Weather information management',
        shortcut: 'W'
      },
    ],
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Detailed analytics and insights',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
  },
  {
    name: 'Advanced Algorithms',
    icon: Brain,
    description: 'Machine learning and AI-powered features',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    children: [
      { 
        name: 'Algorithm Management', 
        href: '/admin/advanced-algorithms', 
        icon: Brain,
        description: 'Configure and monitor AI algorithms',
        shortcut: 'G'
      },
      { 
        name: 'Trending Analytics', 
        href: '/admin/trending-analytics', 
        icon: TrendingUp,
        description: 'Real-time trending content analysis',
        shortcut: 'T'
      },
    ],
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration and preferences',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20'
  },
];

interface EnhancedAdminLayoutProps {
  children: React.ReactNode;
}

export function EnhancedAdminLayout({ children }: EnhancedAdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useSupabaseAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  // Auto-enhance new elements
  useEffect(() => {
    const timer = setTimeout(() => {
      uxEnhancer.enhance(document.body);
    }, 100);
    return () => clearTimeout(timer);
  }, [location]);

  const isActivePath = (href: string) => {
    if (href === '/admin-dashboard') {
      return location === '/admin-dashboard';
    }
    return location.startsWith(href);
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/admin-login';
  };

  const filteredNavigation = navigation.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.children?.some(child => 
      child.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile sidebar overlay */}
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
          {/* Enhanced Header */}
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
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search admin features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                          expandedItems.includes(item.name) || item.children.some(child => isActivePath(child.href))
                            ? `${item.bgColor} ${item.color} shadow-sm`
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs opacity-70 mt-0.5">{item.description}</div>
                          </div>
                        </div>
                        {expandedItems.includes(item.name) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </button>
                      {expandedItems.includes(item.name) && (
                        <ul className="ml-6 mt-2 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <Link href={child.href}>
                                <span className={cn(
                                  "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group",
                                  isActivePath(child.href)
                                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                )}>
                                  <div className="flex items-center">
                                    <child.icon className="mr-3 h-4 w-4" />
                                    <div>
                                      <div className="font-medium">{child.name}</div>
                                      <div className="text-xs opacity-70">{child.description}</div>
                                    </div>
                                  </div>
                                  {child.shortcut && (
                                    <Badge variant="secondary" className="text-xs">
                                      {child.shortcut}
                                    </Badge>
                                  )}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href}>
                      <span className={cn(
                        "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer group",
                        isActivePath(item.href)
                          ? `${item.bgColor} ${item.color} shadow-sm`
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      )}>
                        <item.icon className="mr-3 h-5 w-5" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs opacity-70 mt-0.5">{item.description}</div>
                        </div>
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Enhanced User Profile & Actions */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
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
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="p-1.5"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="p-1.5"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Link href="/admin/articles">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <PlusCircle className="mr-2 h-3 w-3" />
                  New Article
                </Button>
              </Link>
              <Link href="/admin/breaking-news">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Zap className="mr-2 h-3 w-3" />
                  Breaking News
                </Button>
              </Link>
            </div>
            
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

      {/* Enhanced Main Content */}
      <div className="lg:ml-72">
        {/* Enhanced Top Header */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-3"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your Bengali news website with advanced UX design principles
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Activity className="mr-2 h-4 w-4" />
                Live Stats
              </Button>
              
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
                <Badge variant="destructive" className="ml-1 text-xs">3</Badge>
              </Button>
              
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
              
              <Link href="/">
                <Button variant="ghost" size="sm">
                  View Website
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}