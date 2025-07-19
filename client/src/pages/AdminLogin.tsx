import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useSupabaseAdminAuth } from '@/hooks/use-supabase-admin-auth';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, LogOut, Loader2 } from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল প্রদান করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminLogin = () => {
  const { isAdmin, loading, loginAsAdmin, logout } = useSupabaseAdminAuth();
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!loading && isAdmin) {
      setLocation('/admin-dashboard');
    }
  }, [loading, isAdmin, setLocation]);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AdminLoginFormValues) => {
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      
      await loginAsAdmin(values.email, values.password);
      
      // Small delay to allow state to update
      setTimeout(() => {
        if (isAdmin) {
          setLocation('/admin-dashboard');
        } else {
          setLoginError('আপনার অ্যাকাউন্টে অ্যাডমিন অনুমতি নেই। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।');
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('Admin login error:', error);
      setLoginError(error.message || 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // If user is already logged in as admin, show logout option
  if (isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">অ্যাডমিন প্যানেল</CardTitle>
            <CardDescription>
              আপনি সফলভাবে অ্যাডমিন হিসেবে লগইন করেছেন
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setLocation('/admin-dashboard')}
              className="w-full"
              size="lg"
            >
              ড্যাশবোর্ডে যান
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              লগআউট
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>অ্যাডমিন লগইন | প্রথম আলো</title>
        <meta name="description" content="প্রথম আলো অ্যাডমিন প্যানেল লগইন" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">অ্যাডমিন লগইন</CardTitle>
            <CardDescription>
              অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার তথ্য দিন
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ইমেইল</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="your@email.com"
                          disabled={isLoggingIn}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>পাসওয়ার্ড</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoggingIn}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      লগইন হচ্ছে...
                    </>
                  ) : (
                    'লগইন করুন'
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                সাধারণ ব্যবহারকারী হিসেবে লগইন করতে{' '}
                <button
                  onClick={() => setLocation('/auth?tab=login')}
                  className="text-blue-600 hover:underline"
                >
                  এখানে ক্লিক করুন
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminLogin;