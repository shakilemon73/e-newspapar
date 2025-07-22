import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface UserProfile {
  id?: number;
  user_id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  social_links?: any;
  created_at?: string;
  updated_at?: string;
}

export const SimpleUserProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Get current user
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    return user;
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      }

      // If no profile exists, create default profile
      if (!data) {
        const defaultProfile: Partial<UserProfile> = {
          user_id: user.id,
          first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          bio: '',
          location: '',
          website: '',
          social_links: {},
        };

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setProfile(defaultProfile as UserProfile);
        } else {
          setProfile(newProfile);
        }
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

  // Save profile
  const saveProfile = async () => {
    if (!profile || !user) return;

    try {
      setSaving(true);

      // Only save fields that exist in the database
      const profileToSave = {
        user_id: user.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        location: profile.location || '',
        website: profile.website || '',
        social_links: profile.social_links || {},
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileToSave, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Profile save error details:', error);
        throw error;
      }

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

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchUserProfile();
      setLoading(false);
    };

    initialize();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">প্রোফাইল লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">প্রোফাইল</h1>
          <p className="text-muted-foreground">প্রোফাইল দেখার জন্য অনুগ্রহ করে লগইন করুন।</p>
          <Button 
            onClick={() => window.location.href = '/login'} 
            className="mt-4"
          >
            লগইন করুন
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const fullName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile.first_name || profile.last_name || '';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">প্রোফাইল সম্পাদনা</h1>
          <p className="text-muted-foreground">আপনার ব্যক্তিগত তথ্য পরিবর্তন করুন</p>
        </div>
        <Button onClick={saveProfile} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />সংরক্ষণ হচ্ছে...</> : 'সংরক্ষণ করুন'}
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">ব্যক্তিগত তথ্য</TabsTrigger>
          <TabsTrigger value="categories" disabled>পছন্দসই বিভাগ</TabsTrigger>
          <TabsTrigger value="preferences" disabled>পঠন পছন্দসমূহ</TabsTrigger>
          <TabsTrigger value="privacy" disabled>গোপনীয়তা</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
              <CardDescription>আপনার মৌলিক তথ্য সম্পাদনা করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {profile.first_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="avatar-url">প্রোফাইল ছবি URL</Label>
                  <Input
                    id="avatar-url"
                    value={profile.avatar_url || ''}
                    onChange={(e) => updateProfile('avatar_url', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">প্রথম নাম</Label>
                  <Input
                    id="first-name"
                    value={profile.first_name || ''}
                    onChange={(e) => updateProfile('first_name', e.target.value)}
                    placeholder="আপনার প্রথম নাম"
                  />
                </div>

                <div>
                  <Label htmlFor="last-name">শেষ নাম</Label>
                  <Input
                    id="last-name"
                    value={profile.last_name || ''}
                    onChange={(e) => updateProfile('last_name', e.target.value)}
                    placeholder="আপনার শেষ নাম"
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
                  <Label htmlFor="website">ওয়েবসাইট</Label>
                  <Input
                    id="website"
                    value={profile.website || ''}
                    onChange={(e) => updateProfile('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <Label>ইমেইল</Label>
                <Input value={user.email || ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">ইমেইল পরিবর্তন করা যাবে না</p>
              </div>

              {/* Bio */}
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

              {/* Member Since */}
              <div>
                <Label>সদস্য হয়েছেন</Label>
                <Input 
                  value={user.created_at ? new Date(user.created_at).toLocaleDateString('bn-BD') : ''} 
                  disabled 
                  className="bg-muted" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder tabs */}
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>পছন্দসই বিভাগসমূহ</CardTitle>
              <CardDescription>এই ফিচারটি শীঘ্রই আসছে</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  পছন্দসই বিভাগ নির্বাচনের ফিচারটি শীঘ্রই যোগ করা হবে
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>পঠন পছন্দসমূহ</CardTitle>
              <CardDescription>এই ফিচারটি শীঘ্রই আসছে</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  পড়ার পছন্দ সেটিংস শীঘ্রই যোগ করা হবে
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>গোপনীয়তা</CardTitle>
              <CardDescription>এই ফিচারটি শীঘ্রই আসছে</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  গোপনীয়তা সেটিংস শীঘ্রই যোগ করা হবে
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleUserProfile;