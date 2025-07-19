import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, LogOut } from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল প্রদান করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminLogin = () => {
  const { user, signIn, signOut, loading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!loading && user) {
      if (user.user_metadata?.role === 'admin') {
        setLocation('/admin-dashboard');
      } else if (user && !loading) {
        // User is logged in but not an admin - show clear message
        setLoginError('আপনি একজন সাধারণ ব্যবহারকারী হিসেবে লগইন করেছেন। অ্যাডমিন অ্যাক্সেসের জন্য আপনাকে আগে লগআউট করতে হবে এবং অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করতে হবে।');
      }
    }
  }, [loading, user, setLocation]);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AdminLoginFormValues) => {
    try {
      setLoginError(null);
      await signIn(values.email, values.password);
      
      // After successful login, check the user role in the next render cycle
      // The useEffect will handle the proper redirection based on role
    } catch (error) {
      console.error('Admin login error:', error);
      setLoginError('লগইনে সমস্যা হয়েছে। দয়া করে আপনার অ্যাডমিন ইমেইল এবং পাসওয়ার্ড সঠিক কিনা যাচাই করুন।');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setLoginError(null);
      setLocation('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>অ্যাডমিন লগইন | প্রথম আলো</title>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                অ্যাডমিন লগইন
              </CardTitle>
              <CardDescription>
                অ্যাডমিন প্যানেলে প্রবেশের জন্য আপনার অ্যাডমিন অ্যাকাউন্ট ব্যবহার করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{loginError}</AlertDescription>
                  {user && user.user_metadata?.role !== 'admin' && (
                    <div className="mt-3">
                      <Button 
                        onClick={handleLogout} 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        লগআউট করুন
                      </Button>
                    </div>
                  )}
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>অ্যাডমিন ইমেইল</FormLabel>
                        <FormControl>
                          <Input placeholder="অ্যাডমিন ইমেইল এড্রেস" {...field} />
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
                          <Input type="password" placeholder="অ্যাডমিন পাসওয়ার্ড" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'লগইন হচ্ছে...' : 'অ্যাডমিন লগইন'}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-center">
                <Alert>
                  <AlertDescription className="text-sm">
                    এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য। সাধারণ ব্যবহারকারীদের জন্য{' '}
                    <a href="/login" className="text-primary hover:underline">
                      এখানে ক্লিক করুন
                    </a>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;