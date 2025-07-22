import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { SupabaseAdminAuthProvider } from "@/hooks/use-supabase-admin-auth";
import { AuthProvider as SupabaseAuthProvider } from "@/hooks/use-supabase-auth";
import { useSupabaseAdminAuth } from "@/hooks/use-supabase-admin-auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Admin Pages - Migrated to Direct Supabase API (Vercel Ready)
import EnhancedAdminAccess from "@/pages/EnhancedAdminAccess";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import ArticlesAdminPage from "@/pages/admin/ArticlesAdminPage";
import CategoriesAdminPage from "@/pages/admin/CategoriesAdminPage";
import EPapersAdminPage from "@/pages/admin/EPapersAdminPage";
import BreakingNewsAdminPage from "@/pages/admin/BreakingNewsAdminPage";
import UsersAdminPage from "@/pages/admin/UsersAdminPage";
import VideosAdminPage from "@/pages/admin/VideosAdminPage";
import AudioArticlesAdminPage from "@/pages/admin/AudioArticlesAdminPage";
import AnalyticsAdminPage from "@/pages/admin/AnalyticsAdminPage";
import SocialMediaAdminPage from "@/pages/admin/SocialMediaAdminPage";
import SettingsAdminPage from "@/pages/admin/SettingsAdminPage";
import WeatherAdminPage from "@/pages/admin/WeatherAdminPage";
import AdvancedAlgorithmsPage from "@/pages/admin/AdvancedAlgorithmsPage";
import TrendingAnalyticsPage from "@/pages/admin/TrendingAnalyticsPage";
import FooterPagesAdminPage from "@/pages/admin/FooterPagesAdminPage";
import UserDashboardAdminPage from "@/pages/admin/UserDashboardAdminPage";
import CommentManagementPage from "@/pages/admin/CommentManagementPage";
import SEOManagementPage from "@/pages/admin/SEOManagementPage";
import SearchManagementPage from "@/pages/admin/SearchManagementPage";
import DatabaseManagementPage from "@/pages/admin/DatabaseManagementPage";
import EmailNotificationPage from "@/pages/admin/EmailNotificationPage";
import PerformanceMonitoringPage from "@/pages/admin/PerformanceMonitoringPage";
import MobileAppManagementPage from "@/pages/admin/MobileAppManagementPage";
import AdvertisementManagementPage from "@/pages/admin/AdvertisementManagementPage";
import SecurityAccessControlPage from "@/pages/admin/SecurityAccessControlPage";

// Admin Not Found Component
function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-destructive">404</h1>
        <p className="text-xl text-muted-foreground">Admin Page Not Found</p>
        <p className="text-sm text-muted-foreground">
          The admin page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}

// Admin Route Protection
function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useSupabaseAdminAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAdmin) {
      setLocation('/admin-login');
    }
  }, [loading, isAdmin, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}

// Admin Router with Protected Routes
function AdminRouter() {
  const [location] = useLocation();

  return (
    <Switch>
      {/* Admin Access Portal - Secure Entry Point */}
      <Route path="/admin-access" component={EnhancedAdminAccess} />
      
      {/* Admin Login - Public */}
      <Route path="/admin-login" component={AdminLogin} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin-dashboard">
        <AdminRouteGuard>
          <AdminDashboard />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/articles">
        <AdminRouteGuard>
          <ArticlesAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/categories">
        <AdminRouteGuard>
          <CategoriesAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/epapers">
        <AdminRouteGuard>
          <EPapersAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/breaking-news">
        <AdminRouteGuard>
          <BreakingNewsAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/users">
        <AdminRouteGuard>
          <UsersAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/videos">
        <AdminRouteGuard>
          <VideosAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/audio">
        <AdminRouteGuard>
          <AudioArticlesAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/analytics">
        <AdminRouteGuard>
          <AnalyticsAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/social-media">
        <AdminRouteGuard>
          <SocialMediaAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/weather">
        <AdminRouteGuard>
          <WeatherAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/settings">
        <AdminRouteGuard>
          <SettingsAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/advanced-algorithms">
        <AdminRouteGuard>
          <AdvancedAlgorithmsPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/trending-analytics">
        <AdminRouteGuard>
          <TrendingAnalyticsPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/footer-pages">
        <AdminRouteGuard>
          <FooterPagesAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/user-dashboard">
        <AdminRouteGuard>
          <UserDashboardAdminPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/comments">
        <AdminRouteGuard>
          <CommentManagementPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/seo">
        <AdminRouteGuard>
          <SEOManagementPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/search">
        <AdminRouteGuard>
          <SearchManagementPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/database">
        <AdminRouteGuard>
          <DatabaseManagementPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/email-notifications">
        <AdminRouteGuard>
          <EmailNotificationPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/performance">
        <AdminRouteGuard>
          <PerformanceMonitoringPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/mobile-app">
        <AdminRouteGuard>
          <MobileAppManagementPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/advertisements">
        <AdminRouteGuard>
          <AdvertisementManagementPage />
        </AdminRouteGuard>
      </Route>
      
      <Route path="/admin/security">
        <AdminRouteGuard>
          <SecurityAccessControlPage />
        </AdminRouteGuard>
      </Route>
      
      {/* Default redirect to dashboard for admin routes */}
      <Route path="/admin">
        <AdminRouteGuard>
          <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground">Welcome to the admin portal. Please select a section from the navigation menu.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Content Management</h3>
                <p className="text-sm text-muted-foreground">Manage articles, categories, and breaking news</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">User Management</h3>
                <p className="text-sm text-muted-foreground">Monitor users, comments, and interactions</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">System Management</h3>
                <p className="text-sm text-muted-foreground">Database, performance, and security controls</p>
              </div>
            </div>
          </div>
        </AdminRouteGuard>
      </Route>
      
      <Route component={AdminNotFound} />
    </Switch>
  );
}

// Main Admin App
export default function AdminApp() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SiteSettingsProvider>
          <SupabaseAuthProvider>
            <SupabaseAdminAuthProvider>
              <div className="min-h-screen bg-background">
                <AdminRouter />
                <Toaster />
              </div>
            </SupabaseAdminAuthProvider>
          </SupabaseAuthProvider>
        </SiteSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}