import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Book, Trophy, Activity } from 'lucide-react';
import { getUserReadingHistory, getUserStats } from '@/lib/supabase-api-direct';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';

interface UserProfile {
  id?: number;
  user_id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  phone?: string;
  occupation?: string;
  gender?: string;
  date_of_birth?: string;
  social_links?: any;
  created_at?: string;
  updated_at?: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string;
  published_at: string;
  view_count: number;
  category_id?: number;
  categories?: { name: string; slug: string };
}

export const SimpleUserProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [readingHistory, setReadingHistory] = useState<Article[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

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

      console.log('Attempting to save profile:', profileToSave);
      
      // Try INSERT first, then UPDATE if it fails
      let data, error;
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from('user_profiles')
          .update({
            first_name: profileToSave.first_name,
            last_name: profileToSave.last_name,
            bio: profileToSave.bio,
            avatar_url: profileToSave.avatar_url,
            location: profileToSave.location,
            website: profileToSave.website,
            phone: profile.phone || null,
            occupation: profile.occupation || null,
            gender: profile.gender || null,
            date_of_birth: profile.date_of_birth || null,
            social_links: profileToSave.social_links,
            updated_at: profileToSave.updated_at
          })
          .eq('user_id', user.id)
          .select();
        
        data = result.data;
        error = result.error;
      } else {
        // Insert new profile with all fields
        const result = await supabase
          .from('user_profiles')
          .insert({
            ...profileToSave,
            phone: profile.phone || null,
            occupation: profile.occupation || null,
            gender: profile.gender || null,
            date_of_birth: profile.date_of_birth || null
          })
          .select();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Profile save error details:', error);
        toast({
          title: "সংরক্ষণ ত্রুটি",
          description: `প্রোফাইল সংরক্ষণে সমস্যা: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('Profile saved successfully:', data);

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

  // Fetch reading history
  const fetchReadingHistory = async () => {
    if (!user?.id) return;
    
    try {
      setHistoryLoading(true);
      const history = await getUserReadingHistory(user.id, 10);
      setReadingHistory(history);
    } catch (error) {
      console.error('Error fetching reading history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    if (!user?.id) return;
    
    try {
      setStatsLoading(true);
      const stats = await getUserStats(user.id);
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchUserProfile();
      setLoading(false);
      
      // Fetch additional data after user is loaded
      if (user?.id) {
        await Promise.all([
          fetchReadingHistory(),
          fetchUserStats()
        ]);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchReadingHistory();
      fetchUserStats();
    }
  }, [user?.id]);

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
          <TabsTrigger value="history">পড়ার ইতিহাস</TabsTrigger>
          <TabsTrigger value="achievements">অর্জনসমূহ</TabsTrigger>
          <TabsTrigger value="activity">কার্যকলাপ</TabsTrigger>
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
                  <Label htmlFor="occupation">পেশা</Label>
                  <Input
                    id="occupation"
                    value={profile.occupation || ''}
                    onChange={(e) => updateProfile('occupation', e.target.value)}
                    placeholder="আপনার পেশা"
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
              {/* Gender and Date of Birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">লিঙ্গ</Label>
                  <select 
                    id="gender"
                    value={profile.gender || ''} 
                    onChange={(e) => updateProfile('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="male">পুরুষ</option>
                    <option value="female">মহিলা</option>
                    <option value="other">অন্যান্য</option>
                  </select>
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

        {/* Reading History */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                পড়ার ইতিহাস
              </CardTitle>
              <CardDescription>আপনি সাম্প্রতিক যে সংবাদগুলি পড়েছেন</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">পড়ার ইতিহাস লোড হচ্ছে...</span>
                </div>
              ) : readingHistory.length > 0 ? (
                <div className="space-y-4">
                  {readingHistory.map((article, index) => (
                    <div key={article.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {article.image_url && (
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {article.categories?.name} • {getRelativeTimeInBengali(article.published_at)}
                        </p>
                        {article.excerpt && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Book className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">এখনও কোনো সংবাদ পড়া হয়নি</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    সংবাদ পড়লে এখানে ইতিহাস দেখাবে
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                অর্জনসমূহ
              </CardTitle>
              <CardDescription>আপনার পড়ার অগ্রগতি এবং অর্জনসমূহ</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">অর্জনসমূহ লোড হচ্ছে...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Book className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium">পড়া সংবাদ</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{userStats?.totalReadArticles || 0}</p>
                    <p className="text-sm text-muted-foreground">মোট সংবাদ পড়েছেন</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <h4 className="font-medium">লাইক দিয়েছেন</h4>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{userStats?.totalLikes || 0}</p>
                    <p className="text-sm text-muted-foreground">সংবাদে লাইক</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium">বুকমার্ক</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{userStats?.totalBookmarks || 0}</p>
                    <p className="text-sm text-muted-foreground">সংরক্ষিত সংবাদ</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-purple-500" />
                      <h4 className="font-medium">মন্তব্য</h4>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{userStats?.totalComments || 0}</p>
                    <p className="text-sm text-muted-foreground">মন্তব্য করেছেন</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                কার্যকলাপ
              </CardTitle>
              <CardDescription>আপনার সাম্প্রতিক কার্যকলাপের তালিকা</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user && (
                  <>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Book className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">সদস্য হয়েছেন</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    </div>
                    
                    {readingHistory.length > 0 && (
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Activity className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">সর্বশেষ সংবাদ পড়েছেন</p>
                          <p className="text-xs text-muted-foreground">
                            "{readingHistory[0]?.title?.substring(0, 50)}..."
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {userStats?.totalInteractions > 0 && (
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">মোট ইন্টারঅ্যাকশন</p>
                          <p className="text-xs text-muted-foreground">
                            {userStats.totalInteractions} বার সংবাদের সাথে যোগাযোগ করেছেন
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleUserProfile;