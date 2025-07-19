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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল প্রদান করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'নাম অন্তত ২ অক্ষরের হতে হবে'),
  email: z.string().email('সঠিক ইমেইল প্রদান করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'পাসওয়ার্ড মিলছে না',
  path: ['confirmPassword'],
});

const forgotPasswordSchema = z.object({
  email: z.string().email('সঠিক ইমেইল প্রদান করুন'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const AuthPage = () => {
  const [location, setLocation] = useLocation();
  const { user, signIn, signUp, resetPassword, loading } = useSupabaseAuth();
  
  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location === '/register') return 'register';
    if (location === '/login') return 'login';
    return 'login'; // default
  };
  
  const [activeTab, setActiveTab] = useState<string>(getActiveTab());

  // Update tab when route changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location]);

  // Redirect if already logged in to dashboard
  useEffect(() => {
    if (user) {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password);
      // Redirect handled by useEffect when user state changes
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      await signUp(values.email, values.password, {
        name: values.name,
      });
      // Redirect handled by useEffect when user state changes
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  const onForgotPasswordSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await resetPassword(values.email);
      forgotPasswordForm.reset();
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>অ্যাকাউন্ট | প্রথম আলো</title>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Left column: Auth forms */}
          <div className="w-full md:w-1/2 max-w-md mx-auto">
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              setLocation(`/${value}`);
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">লগইন</TabsTrigger>
                <TabsTrigger value="register">রেজিস্ট্রেশন</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>লগইন করুন</CardTitle>
                    <CardDescription>
                      আপনার একাউন্টে প্রবেশ করতে ইমেইল এবং পাসওয়ার্ড দিন
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
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
                          control={loginForm.control}
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
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button
                      variant="link"
                      onClick={() => setActiveTab('forgot-password')}
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>নতুন অ্যাকাউন্ট তৈরি করুন</CardTitle>
                    <CardDescription>
                      সম্পূর্ণ ফিচার ব্যবহার করতে আপনার তথ্য দিয়ে রেজিস্ট্রেশন করুন
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
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
                          control={registerForm.control}
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
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>পাসওয়ার্ড</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="নতুন পাসওয়ার্ড"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>পাসওয়ার্ড নিশ্চিত করুন</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="পাসওয়ার্ড আবার লিখুন"
                                  {...field}
                                />
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
                          {loading ? 'অপেক্ষা করুন...' : 'রেজিস্ট্রেশন করুন'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="forgot-password">
                <Card>
                  <CardHeader>
                    <CardTitle>পাসওয়ার্ড রিসেট করুন</CardTitle>
                    <CardDescription>
                      আপনার ইমেইল এড্রেসে পাসওয়ার্ড রিসেট লিংক পাঠানো হবে
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...forgotPasswordForm}>
                      <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={forgotPasswordForm.control}
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
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loading}
                        >
                          {loading ? 'অপেক্ষা করুন...' : 'রিসেট লিংক পাঠান'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button
                      variant="link"
                      onClick={() => setActiveTab('login')}
                    >
                      লগইন পেজে ফিরে যান
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column: Hero content */}
          <div className="w-full md:w-1/2">
            <div className="bg-muted/30 dark:bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 font-hind">আপনার নিউজ, আপনার পছন্দ</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium font-hind">ব্যক্তিগতকৃত সংবাদ</h3>
                    <p className="text-muted-foreground">আপনার পছন্দ অনুযায়ী সংবাদ দেখুন</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium font-hind">পড়ার তালিকা</h3>
                    <p className="text-muted-foreground">আপনার পছন্দের আর্টিকেল সংরক্ষণ করুন</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium font-hind">ব্রেকিং নিউজ বিজ্ঞপ্তি</h3>
                    <p className="text-muted-foreground">গুরুত্বপূর্ণ সংবাদের জন্য বিজ্ঞপ্তি পান</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium font-hind">মন্তব্য এবং আলোচনা</h3>
                    <p className="text-muted-foreground">সংবাদে আপনার মতামত প্রকাশ করুন</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;