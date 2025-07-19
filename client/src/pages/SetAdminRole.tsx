import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle } from 'lucide-react';

const SetAdminRole = () => {
  const { user, loading } = useSupabaseAuth();
  const [adminEmail, setAdminEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const setUserAsAdmin = async () => {
    if (!adminEmail.trim()) {
      setMessage('Please enter an email address');
      return;
    }

    setIsUpdating(true);
    setMessage('');
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminEmail.trim(),
          role: 'admin'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage(`Successfully set ${adminEmail} as admin!`);
        setAdminEmail('');
      } else {
        setMessage(result.error || 'Failed to set admin role');
      }
    } catch (error) {
      console.error('Error setting admin role:', error);
      setMessage('Error occurred while setting admin role');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Set Admin Role | প্রথম আলো</title>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Set Admin Role
              </CardTitle>
              <CardDescription>
                Set a user as admin for the Bengali News Website. This is a one-time setup utility.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert variant={success ? "default" : "destructive"} className="mb-4">
                  {success && <CheckCircle className="h-4 w-4" />}
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    User Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter user email to make admin"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={isUpdating}
                  />
                </div>

                <Button
                  onClick={setUserAsAdmin}
                  disabled={isUpdating || !adminEmail.trim()}
                  className="w-full"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Admin Role...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Set as Admin
                    </>
                  )}
                </Button>
              </div>

              {user && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <h3 className="font-medium mb-2">Current User Info:</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email: {user.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Role: {user.user_metadata?.role || 'user'}
                  </p>
                  {user.user_metadata?.role === 'admin' && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      ✓ You already have admin access
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SetAdminRole;