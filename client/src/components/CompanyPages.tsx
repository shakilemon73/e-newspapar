import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Globe
} from 'lucide-react';
import SEO from '@/components/SEO';
import { getCompanyInfo, getTeamMembers, type CompanyInfo, type TeamMember } from '@/lib/supabase-api-direct';

// About Us Page Component
export function AboutUsPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoading(true);
        const data = await getCompanyInfo();
        setCompanyInfo(data);
      } catch (err) {
        console.error('Error fetching company info:', err);
        setError('কোম্পানির তথ্য লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !companyInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">তথ্য পাওয়া যায়নি</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {error || 'কোম্পানির তথ্য পাওয়া যায়নি'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${companyInfo.company_name} - আমাদের সম্পর্কে`}
        description={companyInfo.description}
        keywords="আমাদের সম্পর্কে, কোম্পানি, বাংলা সংবাদ"
        url="/about"
        type="website"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            আমাদের সম্পর্কে
          </h1>

          {/* Company Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>{companyInfo.company_name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {companyInfo.description}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">প্রতিষ্ঠিত</p>
                  <p className="font-medium">{companyInfo.founded_year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ঠিকানা</p>
                  <p className="font-medium">{companyInfo.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>আমাদের মিশন</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  {companyInfo.mission}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>আমাদের ভিশন</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  {companyInfo.vision}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* History */}
          {companyInfo.history && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>আমাদের ইতিহাস</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  {companyInfo.history}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>যোগাযোগের তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{companyInfo.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{companyInfo.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span>{companyInfo.website}</span>
                  </div>
                </div>
                
                {companyInfo.social_media && (
                  <div>
                    <p className="text-sm font-medium mb-2">সোশ্যাল মিডিয়া</p>
                    <div className="flex space-x-2">
                      {companyInfo.social_media.facebook && (
                        <Button variant="outline" size="sm">
                          <Facebook className="w-4 h-4" />
                        </Button>
                      )}
                      {companyInfo.social_media.twitter && (
                        <Button variant="outline" size="sm">
                          <Twitter className="w-4 h-4" />
                        </Button>
                      )}
                      {companyInfo.social_media.instagram && (
                        <Button variant="outline" size="sm">
                          <Instagram className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// Team Page Component  
export function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const data = await getTeamMembers();
        setTeamMembers(data);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('টিম সদস্যদের তথ্য লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">তথ্য পাওয়া যায়নি</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="আমাদের টিম - দক্ষ পেশাদার"
        description="আমাদের অভিজ্ঞ টিম সদস্যদের সাথে পরিচিত হন যারা প্রতিদিন নির্ভরযোগ্য সংবাদ পরিবেশন করেন।"
        keywords="টিম, কর্মী, সংবাদকর্মী, সম্পাদক"
        url="/team"
        type="website"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            আমাদের টিম
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            আমাদের দক্ষ ও অভিজ্ঞ টিম সদস্যরা প্রতিদিন আপনাদের জন্য নির্ভরযোগ্য সংবাদ পরিবেশন করেন।
          </p>

          {teamMembers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={member.photo_url || '/placeholder-300x300.svg'}
                      alt={member.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-300x300.svg';
                      }}
                    />
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                      {member.position}
                    </p>
                    
                    <Badge variant="outline" className="mb-3">
                      {member.department}
                    </Badge>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                      {member.bio}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>যোগদান: {formatDate(member.join_date)}</span>
                      </div>
                      
                      {member.email && (
                        <Button variant="ghost" size="sm" className="p-1">
                          <Mail className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">কোনো টিম সদস্য পাওয়া যায়নি</h2>
              <p className="text-gray-600 dark:text-gray-400">
                টিম সদস্যদের তথ্য শীঘ্রই যোগ করা হবে।
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Contact Page Component
export function ContactPage() {
  return (
    <>
      <SEO
        title="যোগাযোগ - আমাদের সাথে যোগাযোগ করুন"
        description="আমাদের সাথে যোগাযোগ করুন। ফোন, ইমেইল বা সরাসরি অফিসে এসে যোগাযোগ করতে পারেন।"
        keywords="যোগাযোগ, ফোন, ইমেইল, ঠিকানা"
        url="/contact"
        type="website"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            যোগাযোগ
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>যোগাযোগের তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">ঠিকানা</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      ঢাকা, বাংলাদেশ
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">ফোন</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      +880-1234-567890
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">ইমেইল</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      info@bengalinews.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">অফিস সময়</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      সকাল ৯টা - সন্ধ্যা ৬টা (রবি-বৃহস্পতিবার)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Office Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>অফিসের অবস্থান</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">
                      মানচিত্র শীঘ্রই যোগ করা হবে
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Contact Form Placeholder */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>দ্রুত যোগাযোগ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  যোগাযোগ ফর্ম শীঘ্রই যোগ করা হবে
                </p>
                <p className="text-sm text-gray-400">
                  এখনকার জন্য উপরের ইমেইল বা ফোন নম্বরে যোগাযোগ করুন
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}