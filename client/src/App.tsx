import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import ArticleDetail from "@/pages/ArticleDetail";
import EPaper from "@/pages/EPaper";
import Search from "@/pages/Search";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminLogin from "@/pages/AdminLogin";
import AuthPage from "@/pages/auth-page";
import Profile from "@/pages/Profile";
import SavedArticles from "@/pages/SavedArticles";
import ReadingHistory from "@/pages/ReadingHistory";
import AdminPage from "@/pages/AdminPage";
import AdminDashboard from "@/pages/AdminDashboard";
import UserDashboard from "@/pages/UserDashboard";
import SetAdminRole from "@/pages/SetAdminRole";
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
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/use-supabase-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/article/:slug" component={ArticleDetail} />
      <Route path="/epaper" component={EPaper} />
      <Route path="/search" component={Search} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/saved-articles" component={SavedArticles} />
      <Route path="/reading-history" component={ReadingHistory} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/set-admin-role" component={SetAdminRole} />
      <Route path="/admin/articles" component={ArticlesAdminPage} />
      <Route path="/admin/categories" component={CategoriesAdminPage} />
      <Route path="/admin/epapers" component={EPapersAdminPage} />
      <Route path="/admin/breaking-news" component={BreakingNewsAdminPage} />
      <Route path="/admin/users" component={UsersAdminPage} />
      <Route path="/admin/videos" component={VideosAdminPage} />
      <Route path="/admin/audio" component={AudioArticlesAdminPage} />
      <Route path="/admin/analytics" component={AnalyticsAdminPage} />
      <Route path="/admin/social-media" component={SocialMediaAdminPage} />
      <Route path="/admin/settings" component={SettingsAdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminRouteHandler />
        <Toaster />
        <script type="text/javascript" src="https://replit.com/public/js/replit-badge-v3.js"></script>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AdminRouteHandler() {
  const [location] = useLocation();
  
  // Check if current route is admin-related
  const isAdminRoute = location.startsWith('/admin') && location !== '/admin-login';
  
  if (isAdminRoute) {
    // Admin routes - no website header/footer
    return (
      <div className="min-h-screen bg-background">
        <Router />
      </div>
    );
  }
  
  // Regular website routes - with header/footer
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

export default App;
