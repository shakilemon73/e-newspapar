import { useState } from 'react';
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

const registerSchema = z.object({
  name: z.string().min(2, 'নাম অন্তত ২ অক্ষরের হতে হবে'),
  email: z.string().email('সঠিক ইমেইল প্রদান করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'পাসওয়ার্ড মিলছে না',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { user, signUp, loading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (user) {
    setLocation('/');
    return null;
  }

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await signUp(values.email, values.password, {
        display_name: values.name,
      });
      setLocation('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>রেজিস্ট্রেশন | প্রথম আলো</title>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>নতুন অ্যাকাউন্ট তৈরি করুন</CardTitle>
              <CardDescription>
                সম্পূর্ণ ফিচার ব্যবহার করতে আপনার তথ্য দিয়ে রেজিস্ট্রেশন করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>নাম</FormLabel>
                        <FormControl>
                          <Input placeholder="আপনার নাম" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>পাসওয়ার্ড নিশ্চিত করুন</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="পাসওয়ার্ড পুনরায় টাইপ করুন" {...field} />
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
                    {loading ? 'রেজিস্ট্রেশন হচ্ছে...' : 'রেজিস্ট্রেশন করুন'}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    লগইন করুন
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

export default Register;