import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getCompanyInfo, getTeamMembers } from '@/lib/supabase-api-direct';
import { Calendar, MapPin, Users, Award } from 'lucide-react';

interface CompanyInfo {
  id: number;
  name: string;
  description: string;
  mission?: string;
  vision?: string;
  founded_year?: number;
  location?: string;
  employee_count?: number;
  website?: string;
  logo_url?: string;
  established_date?: string;
}

interface TeamMember {
  id: number;
  name: string;
  position: string;
  department?: string;
  bio?: string;
  image_url?: string;
  email?: string;
  phone?: string;
  social_links?: any;
  is_featured: boolean;
  join_date?: string;
}

export default function AboutUs() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [company, team] = await Promise.all([
        getCompanyInfo(),
        getTeamMembers()
      ]);
      
      setCompanyInfo(company);
      setTeamMembers(team);
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">আমাদের সম্পর্কে</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম হিসেবে আমাদের যাত্রা ও লক্ষ্য
        </p>
      </div>

      {/* Company Overview */}
      {companyInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-6 w-6" />
              <span>{companyInfo.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed">{companyInfo.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companyInfo.mission && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">আমাদের লক্ষ্য</h3>
                  <p className="text-muted-foreground">{companyInfo.mission}</p>
                </div>
              )}
              
              {companyInfo.vision && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">আমাদের দৃষ্টিভঙ্গি</h3>
                  <p className="text-muted-foreground">{companyInfo.vision}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              {companyInfo.founded_year && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">প্রতিষ্ঠিত: {companyInfo.founded_year}</span>
                </div>
              )}
              
              {companyInfo.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{companyInfo.location}</span>
                </div>
              )}
              
              {companyInfo.employee_count && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm">{companyInfo.employee_count}+ কর্মী</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">নির্ভরযোগ্যতা</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              আমরা সত্য ও নির্ভুল সংবাদ প্রদানে প্রতিজ্ঞাবদ্ধ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">নিরপেক্ষতা</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              সকল ধরনের পক্ষপাতিত্ব থেকে মুক্ত থেকে সংবাদ পরিবেশন
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">দ্রুততা</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              সবার আগে সঠিক সংবাদ পৌঁছে দেওয়া
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Section */}
      {teamMembers.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-8">আমাদের দল</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers
              .filter(member => member.is_featured)
              .map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      {member.image_url ? (
                        <img
                          src={member.image_url}
                          alt={member.name}
                          className="w-24 h-24 rounded-full mx-auto object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-primary font-medium">{member.position}</p>
                        {member.department && (
                          <Badge variant="secondary" className="mt-1">
                            {member.department}
                          </Badge>
                        )}
                      </div>
                      
                      {member.bio && (
                        <p className="text-sm text-muted-foreground text-center">
                          {member.bio}
                        </p>
                      )}
                      
                      {member.join_date && (
                        <p className="text-xs text-muted-foreground">
                          যোগদান: {new Date(member.join_date).toLocaleDateString('bn-BD')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">যোগাযোগ করুন</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            আমাদের সাথে যোগাযোগ করতে চান? আমরা আপনার কথা শুনতে আগ্রহী।
          </p>
          <div className="flex justify-center space-x-4">
            <span className="text-sm">ইমেইল: contact@bengalinews.com</span>
            <span className="text-sm">ফোন: +৮৮০ ১৭০০ ০০০০০০</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}