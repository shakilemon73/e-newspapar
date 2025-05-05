import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import ArticleDetail from "@/pages/ArticleDetail";
import EPaper from "@/pages/EPaper";
import Search from "@/pages/Search";
import AuthPage from "@/pages/auth-page";
import Profile from "@/pages/Profile";
import SavedArticles from "@/pages/SavedArticles";
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
      <Route path="/auth" component={AuthPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/saved-articles" component={SavedArticles} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
          <Toaster />
          <script type="text/javascript" src="https://replit.com/public/js/replit-badge-v3.js"></script>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
