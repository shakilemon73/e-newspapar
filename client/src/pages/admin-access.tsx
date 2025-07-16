import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, AlertCircle } from 'lucide-react';

// Secure admin access portal
export default function AdminAccess() {
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  // Secure access code verification
  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    // Simple access code verification (in production, use proper authentication)
    if (accessCode === 'admin2025') {
      setLocation('/admin-login');
    } else {
      setError('Invalid access code. Access denied.');
    }
    
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Admin Access Portal
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Restricted access area. Authorization required.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleAccessSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accessCode" className="text-slate-700 dark:text-slate-300">
                Access Code
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="accessCode"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter admin access code"
                  className="pl-10 border-slate-300 dark:border-slate-600"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white"
            >
              {isVerifying ? 'Verifying...' : 'Verify Access'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This is a secure administration area.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unauthorized access is prohibited.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}