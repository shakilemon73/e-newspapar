import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  bn: {
    // Dashboard
    'dashboard.title': 'অ্যাডমিন ড্যাশবোর্ড',
    'dashboard.welcome': 'স্বাগতম',
    'dashboard.overview': 'ওভারভিউ',
    'dashboard.statistics': 'পরিসংখ্যান',
    'dashboard.recentActivity': 'সাম্প্রতিক কার্যকলাপ',
    'dashboard.quickActions': 'দ্রুত কার্যকলাপ',
    
    // Content Management
    'content.title': 'কন্টেন্ট ব্যবস্থাপনা',
    'content.articles': 'নিবন্ধসমূহ',
    'content.categories': 'ক্যাটাগরি',
    'content.epapers': 'ই-পেপার',
    'content.videos': 'ভিডিও',
    'content.audio': 'অডিও নিবন্ধ',
    'content.breakingNews': 'ব্রেকিং নিউজ',
    'content.addNew': 'নতুন যোগ করুন',
    'content.edit': 'সম্পাদনা',
    'content.delete': 'মুছে ফেলুন',
    'content.publish': 'প্রকাশ করুন',
    'content.draft': 'খসড়া',
    
    // Users
    'users.title': 'ব্যবহারকারী ব্যবস্থাপনা',
    'users.all': 'সকল ব্যবহারকারী',
    'users.admins': 'অ্যাডমিনবৃন্দ',
    'users.active': 'সক্রিয় ব্যবহারকারী',
    'users.total': 'মোট ব্যবহারকারী',
    
    // Statistics
    'stats.totalArticles': 'মোট নিবন্ধ',
    'stats.totalUsers': 'মোট ব্যবহারকারী',
    'stats.totalViews': 'মোট ভিউ',
    'stats.todayViews': 'আজকের ভিউ',
    'stats.publishedToday': 'আজ প্রকাশিত',
    'stats.activeUsers': 'সক্রিয় ব্যবহারকারী',
    
    // Navigation
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.content': 'কন্টেন্ট',
    'nav.users': 'ব্যবহারকারী',
    'nav.analytics': 'বিশ্লেষণ',
    'nav.settings': 'সেটিংস',
    'nav.logout': 'লগআউট',
    
    // Actions
    'action.save': 'সংরক্ষণ',
    'action.cancel': 'বাতিল',
    'action.confirm': 'নিশ্চিত করুন',
    'action.loading': 'লোড হচ্ছে...',
    'action.success': 'সফল',
    'action.error': 'ত্রুটি',
    'action.view': 'দেখুন',
    'action.manage': 'পরিচালনা',
    
    // Status
    'status.published': 'প্রকাশিত',
    'status.draft': 'খসড়া',
    'status.active': 'সক্রিয়',
    'status.inactive': 'নিষ্ক্রিয়',
    'status.featured': 'ফিচার্ড',
    
    // Time
    'time.today': 'আজ',
    'time.yesterday': 'গতকাল',
    'time.thisWeek': 'এই সপ্তাহ',
    'time.thisMonth': 'এই মাস',
  },
  en: {
    // Dashboard
    'dashboard.title': 'Admin Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.overview': 'Overview',
    'dashboard.statistics': 'Statistics',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.quickActions': 'Quick Actions',
    
    // Content Management
    'content.title': 'Content Management',
    'content.articles': 'Articles',
    'content.categories': 'Categories',
    'content.epapers': 'E-Papers',
    'content.videos': 'Videos',
    'content.audio': 'Audio Articles',
    'content.breakingNews': 'Breaking News',
    'content.addNew': 'Add New',
    'content.edit': 'Edit',
    'content.delete': 'Delete',
    'content.publish': 'Publish',
    'content.draft': 'Draft',
    
    // Users
    'users.title': 'User Management',
    'users.all': 'All Users',
    'users.admins': 'Administrators',
    'users.active': 'Active Users',
    'users.total': 'Total Users',
    
    // Statistics
    'stats.totalArticles': 'Total Articles',
    'stats.totalUsers': 'Total Users',
    'stats.totalViews': 'Total Views',
    'stats.todayViews': "Today's Views",
    'stats.publishedToday': 'Published Today',
    'stats.activeUsers': 'Active Users',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.content': 'Content',
    'nav.users': 'Users',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.confirm': 'Confirm',
    'action.loading': 'Loading...',
    'action.success': 'Success',
    'action.error': 'Error',
    'action.view': 'View',
    'action.manage': 'Manage',
    
    // Status
    'status.published': 'Published',
    'status.draft': 'Draft',
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.featured': 'Featured',
    
    // Time
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.thisWeek': 'This Week',
    'time.thisMonth': 'This Month',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('bn');

  useEffect(() => {
    const saved = localStorage.getItem('admin-language') as Language;
    if (saved && (saved === 'bn' || saved === 'en')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('admin-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}