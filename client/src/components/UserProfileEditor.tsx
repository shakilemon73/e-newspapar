import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';

interface UserProfile {
  user_id: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  phone?: string;
  website?: string;
  date_of_birth?: string;
  gender?: string;
  occupation?: string;
  favorite_categories?: string[];
  reading_preferences?: {
    language: string;
    font_size: string;
    dark_mode: boolean;
    notifications: boolean;
    email_digest: boolean;
    auto_bookmark: boolean;
  };
  privacy_settings?: {
    profile_visible: boolean;
    activity_visible: boolean;
    reading_history_visible: boolean;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const UserProfileEditor = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Get current user
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no profile exists, create default profile
      if (!data) {
        const defaultProfile: Partial<UserProfile> = {
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          reading_preferences: {
            language: 'bn',
            font_size: 'medium',
            dark_mode: false,
            notifications: true,
            email_digest: false,
            auto_bookmark: false
          },
          privacy_settings: {
            profile_visible: true,
            activity_visible: true,
            reading_history_visible: false
          },
          favorite_categories: []
        };

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "ত্রুটি",
        description: "প্রোফাইল লোড করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Save profile
  const saveProfile = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const user = await getCurrentUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "সফল",
        description: "প্রোফাইল সংরক্ষণ হয়েছে",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "ত্রুটি",
        description: "প্রোফাইল সংরক্ষণে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Update profile field
  const updateProfile = (field: string, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Update nested field
  const updateNestedField = (parentField: string, field: string, value: any) => {
    setProfile(prev => prev ? {
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof UserProfile] as any || {}),
        [field]: value
      }
    } : null);
  };

  // Toggle favorite category
  const toggleFavoriteCategory = (categoryId: number) => {
    setProfile(prev => {
      if (!prev) return null;
      
      const currentFavorites = prev.favorite_categories || [];
      const categoryIdStr = categoryId.toString();
      
      const newFavorites = currentFavorites.includes(categoryIdStr)
        ? currentFavorites.filter(id => id !== categoryIdStr)
        : [...currentFavorites, categoryIdStr];

      return { ...prev, favorite_categories: newFavorites };
    });
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchCategories()
      ]);
      setLoading(false);
    };

    initialize();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">প্রোফাইল সম্পাদনা</h1>
          <p className="text-muted-foreground">আপনার ব্যক্তিগত তথ্য এবং পছন্দসমূহ পরিবর্তন করুন</p>
        </div>
        <Button onClick={saveProfile} disabled={saving}>
          {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">ব্যক্তিগত তথ্য</TabsTrigger>
          <TabsTrigger value="categories">পছন্দসই বিভাগ</TabsTrigger>
          <TabsTrigger value="preferences">পঠন পছন্দসমূহ</TabsTrigger>
          <TabsTrigger value="privacy">গোপনীয়তা</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
              <CardDescription>আপনার ব্যক্তিগত বিবরণ সম্পাদনা করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {profile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar-url">প্রোফাইল ছবি URL</Label>
                  <Input
                    id="avatar-url"
                    value={profile.avatar_url || ''}
                    onChange={(e) => updateProfile('avatar_url', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full-name">পূর্ণ নাম</Label>
                  <Input
                    id="full-name"
                    value={profile.full_name || ''}
                    onChange={(e) => updateProfile('full_name', e.target.value)}
                    placeholder="আপনার পূর্ণ নাম"
                  />
                </div>

                <div>
                  <Label htmlFor="location">অবস্থান</Label>
                  <Input
                    id="location"
                    value={profile.location || ''}
                    onChange={(e) => updateProfile('location', e.target.value)}
                    placeholder="শহর, দেশ"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">ফোন নম্বর</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                    placeholder="+880xxxxxxxxxx"
                  />
                </div>

                <div>
                  <Label htmlFor="website">ওয়েবসাইট</Label>
                  <Input
                    id="website"
                    value={profile.website || ''}
                    onChange={(e) => updateProfile('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <Label htmlFor="occupation">পেশা</Label>
                  <Input
                    id="occupation"
                    value={profile.occupation || ''}
                    onChange={(e) => updateProfile('occupation', e.target.value)}
                    placeholder="আপনার পেশা"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">লিঙ্গ</Label>
                  <Select 
                    value={profile.gender || ''} 
                    onValueChange={(value) => updateProfile('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">পুরুষ</SelectItem>
                      <SelectItem value="female">মহিলা</SelectItem>
                      <SelectItem value="other">অন্যান্য</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">জীবনী</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => updateProfile('bio', e.target.value)}
                  placeholder="আপনার সম্পর্কে কিছু লিখুন..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="date-of-birth">জন্ম তারিখ</Label>
                <Input
                  id="date-of-birth"
                  type="date"
                  value={profile.date_of_birth || ''}
                  onChange={(e) => updateProfile('date_of_birth', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorite Categories */}
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>পছন্দসই বিভাগসমূহ</CardTitle>
              <CardDescription>আপনার আগ্রহের বিষয়গুলি নির্বাচন করুন</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((category) => {
                  const isSelected = profile.favorite_categories?.includes(category.id.toString());
                  return (
                    <div
                      key={category.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-border hover:border-blue-300'
                      }`}
                      onClick={() => toggleFavoriteCategory(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.name}</span>
                        {isSelected && (
                          <Badge variant="secondary" className="ml-2">
                            নির্বাচিত
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                নির্বাচিত বিভাগ: {profile.favorite_categories?.length || 0}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reading Preferences */}
        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>পঠন পছন্দসমূহ</CardTitle>
              <CardDescription>আপনার পড়ার অভিজ্ঞতা কাস্টমাইজ করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>ভাষা</Label>
                  <Select 
                    value={profile.reading_preferences?.language || 'bn'} 
                    onValueChange={(value) => updateNestedField('reading_preferences', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bn">বাংলা</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>ফন্ট সাইজ</Label>
                  <Select 
                    value={profile.reading_preferences?.font_size || 'medium'} 
                    onValueChange={(value) => updateNestedField('reading_preferences', 'font_size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">ছোট</SelectItem>
                      <SelectItem value="medium">মাঝারি</SelectItem>
                      <SelectItem value="large">বড়</SelectItem>
                      <SelectItem value="xl">অতি বড়</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>ডার্ক মোড</Label>
                    <p className="text-sm text-muted-foreground">অন্ধকার থিম ব্যবহার করুন</p>
                  </div>
                  <Switch
                    checked={profile.reading_preferences?.dark_mode || false}
                    onCheckedChange={(checked) => updateNestedField('reading_preferences', 'dark_mode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>নোটিফিকেশন</Label>
                    <p className="text-sm text-muted-foreground">নতুন নিবন্ধের জন্য অ্যালার্ট পান</p>
                  </div>
                  <Switch
                    checked={profile.reading_preferences?.notifications || false}
                    onCheckedChange={(checked) => updateNestedField('reading_preferences', 'notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>ইমেইল ডাইজেস্ট</Label>
                    <p className="text-sm text-muted-foreground">সাপ্তাহিক নিউজলেটার পান</p>
                  </div>
                  <Switch
                    checked={profile.reading_preferences?.email_digest || false}
                    onCheckedChange={(checked) => updateNestedField('reading_preferences', 'email_digest', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>অটো বুকমার্ক</Label>
                    <p className="text-sm text-muted-foreground">পড়া নিবন্ধ স্বয়ংক্রিয়ভাবে সংরক্ষণ করুন</p>
                  </div>
                  <Switch
                    checked={profile.reading_preferences?.auto_bookmark || false}
                    onCheckedChange={(checked) => updateNestedField('reading_preferences', 'auto_bookmark', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>গোপনীয়তা সেটিংস</CardTitle>
              <CardDescription>আপনার তথ্যের গোপনীয়তা নিয়ন্ত্রণ করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>প্রোফাইল দৃশ্যমানতা</Label>
                  <p className="text-sm text-muted-foreground">অন্যরা আপনার প্রোফাইল দেখতে পারবে</p>
                </div>
                <Switch
                  checked={profile.privacy_settings?.profile_visible !== false}
                  onCheckedChange={(checked) => updateNestedField('privacy_settings', 'profile_visible', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>কার্যকলাপ দৃশ্যমানতা</Label>
                  <p className="text-sm text-muted-foreground">অন্যরা আপনার কার্যকলাপ দেখতে পারবে</p>
                </div>
                <Switch
                  checked={profile.privacy_settings?.activity_visible !== false}
                  onCheckedChange={(checked) => updateNestedField('privacy_settings', 'activity_visible', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>পড়ার ইতিহাস দৃশ্যমানতা</Label>
                  <p className="text-sm text-muted-foreground">অন্যরা আপনার পড়ার ইতিহাস দেখতে পারবে</p>
                </div>
                <Switch
                  checked={profile.privacy_settings?.reading_history_visible || false}
                  onCheckedChange={(checked) => updateNestedField('privacy_settings', 'reading_history_visible', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfileEditor;