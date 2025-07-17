import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/use-supabase-auth";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Admin Pages
import AdminAccess from "@/pages/admin-access";
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
  const { user, loading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/admin-login');
    } else if (!loading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [loading, user, setLocation]);

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

  if (!user || user.user_metadata?.role !== 'admin') {
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
      <Route path="/admin-access" component={AdminAccess} />
      
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
      
      {/* Default redirect to dashboard for admin routes */}
      <Route path="/admin">
        <AdminRouteGuard>
          <AdminDashboard />
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
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <AdminRouter />
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}