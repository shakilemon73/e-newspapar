import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import AdminApp from "./AdminApp";
import UserApp from "./UserApp";
import SetAdminRole from "./pages/SetAdminRole";

function App() {
  const [location] = useLocation();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're running on client-side for proper routing
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading during hydration to prevent routing issues
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Route to separate admin application for enhanced security
  if (location.startsWith('/admin') || location === '/admin-login' || location === '/admin-access') {
    return <AdminApp />;
  }

  // Special admin setup route (temporary)
  if (location === '/set-admin-role') {
    return <SetAdminRole />;
  }

  // Default to user application for all other routes
  return <UserApp />;
}

export default App;
