import { useEffect } from 'react';
import { useLocation } from 'wouter';

const Login = () => {
  const [, setLocation] = useLocation();

  // Redirect to AuthPage immediately
  useEffect(() => {
    setLocation('/auth');
  }, [setLocation]);

  return null;
};

export default Login;