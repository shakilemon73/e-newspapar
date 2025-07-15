import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'নাম অন্তত ২ অক্ষরের হতে হবে'),
  email: z.string().email('সঠিক ইমেইল প্রদান করুন').optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'বর্তমান পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  newPassword: z.string().min(6, 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'পাসওয়ার্ড মিলছে না',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const { user, loading, session } = useSupabaseAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      setLocation('/auth');
    }
  }, [loading, user, setLocation]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      // Update user profile via Supabase
      const { data, error } = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
        }),
      }).then(res => res.json());

      if (error) {
        throw new Error(error);
      }

      toast({
        title: 'প্রোফাইল আপডেট সফল',
        description: 'আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে',
      });
    } catch (error: any) {
      toast({
        title: 'প্রোফাইল আপডেট ব্যর্থ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsUpdating(true);
    try {
      // Update password via Supabase
      const { data, error } = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      }).then(res => res.json());

      if (error) {
        throw new Error(error);
      }

      toast({
        title: 'পাসওয়ার্ড আপডেট সফল',
        description: 'আপনার পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে',
      });
      
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: 'পাসওয়ার্ড আপডেট ব্যর্থ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>প্রোফাইল | প্রথম আলো</title>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* User Info Card */}
            <Card className="w-full md:w-1/3">
              <CardHeader className="pb-0">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name || user?.email || 'User'} />
                    <AvatarFallback className="text-2xl bg-accent text-white">
                      {(user?.user_metadata?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-center text-xl">
                  {user?.user_metadata?.name || 'ব্যবহারকারী'}
                </CardTitle>
                <CardDescription className="text-center">
                  {user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-medium mb-1">সদস্যতা</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user?.created_at || '').toLocaleDateString('bn-BD')} থেকে সদস্য
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-medium mb-1">সর্বশেষ লগইন</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user?.last_sign_in_at || '').toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Tabs */}
            <div className="w-full md:w-2/3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">প্রোফাইল</TabsTrigger>
                  <TabsTrigger value="password">পাসওয়ার্ড</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>প্রোফাইল সেটিংস</CardTitle>
                      <CardDescription>
                        আপনার প্রোফাইল তথ্য আপডেট করুন
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                          <FormField
                            control={profileForm.control}
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
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ইমেইল</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="আপনার ইমেইল" 
                                    disabled={true} 
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  ইমেইল পরিবর্তন করা যাবে না
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'আপডেট হচ্ছে...' : 'প্রোফাইল আপডেট করুন'}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="password">
                  <Card>
                    <CardHeader>
                      <CardTitle>পাসওয়ার্ড পরিবর্তন</CardTitle>
                      <CardDescription>
                        আপনার একাউন্টের পাসওয়ার্ড পরিবর্তন করুন
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>বর্তমান পাসওয়ার্ড</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="আপনার বর্তমান পাসওয়ার্ড" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>নতুন পাসওয়ার্ড</FormLabel>
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
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>পাসওয়ার্ড নিশ্চিত করুন</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="নতুন পাসওয়ার্ড আবার লিখুন" 
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
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Reading Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle>পঠন পছন্দসমূহ</CardTitle>
              <CardDescription>
                আপনার পঠন পছন্দ সম্পর্কিত সেটিংস
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">পছন্দসই বিভাগসমূহ</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    আপনার পছন্দসই বিভাগসমূহ নির্বাচন করুন। এগুলো আপনার হোমপেজে ও ব্যক্তিগতকৃত সুপারিশে প্রাধান্য পাবে।
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* Will be populated from API */}
                    <div className="bg-accent/10 hover:bg-accent/20 border border-border rounded-full px-4 py-1 text-sm cursor-pointer transition">
                      রাজনীতি
                    </div>
                    <div className="bg-muted hover:bg-accent/20 border border-border rounded-full px-4 py-1 text-sm cursor-pointer transition">
                      খেলা
                    </div>
                    <div className="bg-muted hover:bg-accent/20 border border-border rounded-full px-4 py-1 text-sm cursor-pointer transition">
                      আন্তর্জাতিক
                    </div>
                    <div className="bg-accent/10 hover:bg-accent/20 border border-border rounded-full px-4 py-1 text-sm cursor-pointer transition">
                      বিনোদন
                    </div>
                    <div className="bg-muted hover:bg-accent/20 border border-border rounded-full px-4 py-1 text-sm cursor-pointer transition">
                      অর্থনীতি
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <h3 className="font-medium mb-2">ফন্ট সাইজ</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">ছোট</span>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      defaultValue="2"
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm">বড়</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>পছন্দসমূহ সংরক্ষণ করুন</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;