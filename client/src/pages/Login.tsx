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
import { Link } from 'wouter';

const loginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল প্রদান করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { user, signIn, loading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password);
      setLocation('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>লগইন | প্রথম আলো</title>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>লগইন করুন</CardTitle>
              <CardDescription>
                আপনার একাউন্টে প্রবেশ করতে ইমেইল এবং পাসওয়ার্ড দিন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ইমেইল</FormLabel>
                        <FormControl>
                          <Input placeholder="আপনার ইমেইল এড্রেস" {...field} />
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
                          <Input type="password" placeholder="আপনার পাসওয়ার্ড" {...field} />
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
                    {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  নতুন ব্যবহারকারী?{' '}
                  <Link href="/register" className="text-primary hover:underline">
                    রেজিস্ট্রেশন করুন
                  </Link>
                </p>
                <p className="text-sm">
                  <Link href="/forgot-password" className="text-primary hover:underline">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Login;