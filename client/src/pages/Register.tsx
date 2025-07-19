import { useEffect } from 'react';
import { useLocation } from 'wouter';

const Register = () => {
  const [, setLocation] = useLocation();

  // Redirect to AuthPage with register tab
  useEffect(() => {
    setLocation('/register');
  }, [setLocation]);

  return null;
};

export default Register;