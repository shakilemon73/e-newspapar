import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  Menu,
  Sun,
  Moon,
  Globe,
  Home,
  ChevronDown,
  Activity,
  TrendingUp,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface EnhancedAdminHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function EnhancedAdminHeader({ onMenuToggle, isSidebarOpen }: EnhancedAdminHeaderProps) {
  const [location] = useLocation();
  const { user, logout } = useSupabaseAuth();
  const { t, language, setLanguage } = useLanguage();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  // Don Norman's Discoverability - Clear visual affordances
  const quickStats = [
    { 
      icon: Users, 
      value: '1,247', 
      label: t('active-users', 'Active Users', 'সক্রিয় ব্যবহারকারী'),
      color: 'text-green-600',
      trend: '+12%'
    },
    { 
      icon: FileText, 
      value: '89', 
      label: t('articles-today', 'Articles Today', 'আজকের নিবন্ধ'),
      color: 'text-blue-600',
      trend: '+5%'
    },
    { 
      icon: TrendingUp, 
      value: '2.4M', 
      label: t('page-views', 'Page Views', 'পেজ ভিউ'),
      color: 'text-purple-600',
      trend: '+18%'
    },
    { 
      icon: AlertCircle, 
      value: '3', 
      label: t('pending-reviews', 'Pending Reviews', 'অপেক্ষমান পর্যালোচনা'),
      color: 'text-orange-600',
      trend: '-2'
    }
  ];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Luke Wroblewski's Mobile-First - Responsive header design
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section - Logo and Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t('toggle-menu', 'Toggle Menu', 'মেনু টগল করুন')}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Link href="/admin-dashboard">
              <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">প</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('admin-dashboard', 'Admin Dashboard', 'অ্যাডমিন ড্যাশবোর্ড')}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('news-management', 'News Management', 'সংবাদ ব্যবস্থাপনা')}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Center Section - Search (Hidden on mobile) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('search-placeholder', 'Search articles, users, settings...', 'নিবন্ধ, ব্যবহারকারী, সেটিংস অনুসন্ধান করুন...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Globe className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'বাং' : 'EN'}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('bn')}>
                বাংলা
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={t('toggle-theme', 'Toggle Theme', 'থিম পরিবর্তন করুন')}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={t('notifications', 'Notifications', 'বিজ্ঞপ্তি')}
          >
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || 'User'} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-red-500 text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || 'Admin User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>{t('profile', 'Profile', 'প্রোফাইল')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('settings', 'Settings', 'সেটিংস')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Home className="mr-2 h-4 w-4" />
                <span>{t('view-site', 'View Site', 'সাইট দেখুন')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout', 'Log out', 'লগআউট')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats Bar - Aarron Walter's Emotional Design */}
      <div className="hidden lg:flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-md bg-gray-100 dark:bg-gray-700", stat.color)}>
                <stat.icon className="h-3 w-3" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                  <span className={cn("text-xs font-medium", 
                    stat.trend.startsWith('+') ? 'text-green-600' : 
                    stat.trend.startsWith('-') ? 'text-red-600' : 'text-gray-500'
                  )}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('live-status', 'Live', 'লাইভ')}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {t('server-status', 'All Systems Operational', 'সব সিস্টেম চালু')}
          </Badge>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('search-placeholder', 'Search...', 'অনুসন্ধান করুন...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800"
          />
        </div>
      </div>
    </header>
  );
}