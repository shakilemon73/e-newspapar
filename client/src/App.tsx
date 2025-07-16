import { useLocation } from "wouter";
import AdminApp from "./AdminApp";
import UserApp from "./UserApp";
import SetAdminRole from "@/pages/SetAdminRole";

function App() {
  const [location] = useLocation();

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
