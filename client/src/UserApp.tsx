import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/use-supabase-auth";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { AutoStorageCleanup } from "@/components/StorageCleanupButton";
import "@/lib/app-initialization"; // Initialize enhanced storage system
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import ArticleDetail from "@/pages/ArticleDetail";
import VideoDetail from "@/pages/VideoDetail";
import AudioDetail from "@/pages/AudioDetail";
import Videos from "@/pages/Videos";
import AudioArticles from "@/pages/AudioArticles";
import EPaper from "@/pages/EPaper";
import Search from "@/pages/Search";
import AdvancedSearch from "@/pages/AdvancedSearch";
import PersonalizedRecommendations from "@/pages/PersonalizedRecommendations";
import UserAnalytics from "@/pages/UserAnalytics";
import SocialMediaTest from "@/pages/SocialMediaTest";
import UnusedTablesDemo from "@/pages/UnusedTablesDemo";
import UserEngagement from "@/pages/UserEngagement";

// User Authentication Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthPage from "@/pages/auth-page";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import SavedArticles from "@/pages/SavedArticles";
import ReadingHistory from "@/pages/ReadingHistory";
import Tag from "@/pages/Tag";

// Footer Pages
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Polls from "@/pages/Polls";
import EditorialPolicy from "@/pages/EditorialPolicy";
import Advertisement from "@/pages/Advertisement";
import Archive from "@/pages/Archive";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

// User Router - Only for regular users and public content
function UserRouter() {
  return (
    <Switch>
      {/* Public Content Routes */}
      <Route path="/" component={Home} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/article/:slug" component={ArticleDetail} />
      <Route path="/video/:slug" component={VideoDetail} />
      <Route path="/audio/:slug" component={AudioDetail} />
      <Route path="/tag/:slug" component={Tag} />
      <Route path="/videos" component={Videos} />
      <Route path="/audio-articles" component={AudioArticles} />
      <Route path="/epaper" component={EPaper} />
      <Route path="/search" component={Search} />
      <Route path="/advanced-search" component={AdvancedSearch} />
      <Route path="/recommendations" component={PersonalizedRecommendations} />
      <Route path="/user-analytics" component={UserAnalytics} />
      <Route path="/user-engagement" component={UserEngagement} />
      <Route path="/social-media-test" component={SocialMediaTest} />
      <Route path="/unused-tables-demo" component={UnusedTablesDemo} />
      
      {/* User Authentication Routes - Consolidated to AuthPage */}
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/profile" component={Profile} />
      <Route path="/saved-articles" component={SavedArticles} />
      <Route path="/reading-history" component={ReadingHistory} />
      
      {/* Footer Pages */}
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/polls" component={Polls} />
      <Route path="/editorial-policy" component={EditorialPolicy} />
      <Route path="/advertisement" component={Advertisement} />
      <Route path="/archive" component={Archive} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

// Main User App with Header and Footer
export default function UserApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SiteSettingsProvider>
          <AutoStorageCleanup />
          <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow">
              <UserRouter />
            </main>
            <Footer />
            <Toaster />
          </div>
        </SiteSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}