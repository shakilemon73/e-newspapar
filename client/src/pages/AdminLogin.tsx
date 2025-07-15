import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল প্রদান করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminLogin = () => {
  const { user, signIn, loading } = useSupabaseAuth();
  const { isAdmin } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);

  // Redirect if already logged in as admin
  if (user && isAdmin) {
    setLocation('/admin-dashboard');
    return null;
  }

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
      
      // Check if user has admin role after login
      // The useAdminAuth hook will update automatically
      setTimeout(() => {
        if (isAdmin) {
          setLocation('/admin-dashboard');
        } else {
          setLoginError('আপনার অ্যাডমিন অ্যাক্সেস নেই। কেবল অ্যাডমিনরা এই পেজে প্রবেশ করতে পারেন।');
        }
      }, 1000);
    } catch (error) {
      console.error('Admin login error:', error);
      setLoginError('লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
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