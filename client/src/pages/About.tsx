import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, Award, Target, Phone, Mail, MapPin } from 'lucide-react';
import { DateFormatter } from '@/components/DateFormatter';
import SEO from '@/components/SEO';
import supabase from '@/lib/supabase';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  department: string;
  bio: string;
  image_url: string;
  email: string;
  phone: string;
  join_date: string;
  is_featured: boolean;
}

interface CompanyInfo {
  id: number;
  section: string;
  title: string;
  content: string;
  display_order: number;
  updated_at: string;
}

export default function About() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch team members from Supabase
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .order('is_featured', { ascending: false });

        if (teamError) {
          console.error('Error fetching team members:', teamError);
          // Use fallback data if table doesn't exist
          setTeamMembers([
            {
              id: 1,
              name: 'মতিউর রহমান',
              position: 'সম্পাদক ও প্রকাশক',
              department: 'সম্পাদকীয়',
              bio: 'র সম্পাদক ও প্রকাশক। দীর্ঘ ৩০ বছরের সাংবাদিকতা অভিজ্ঞতা রয়েছে।',
              image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              email: 'editor@prothomalo.com',
              phone: '০২-৮৩৪৮৮৬৭',
              join_date: '2000-01-01',
              is_featured: true
            },
            {
              id: 2,
              name: 'আনিসুল হক',
              position: 'নির্বাহী সম্পাদক',
              department: 'সম্পাদকীয়',
              bio: 'সাহিত্যিক ও সাংবাদিক। র নির্বাহী সম্পাদক হিসেবে দায়িত্ব পালন করছেন।',
              image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              email: 'anisul@prothomalo.com',
              phone: '০২-৮৩৪৮৮৬৮',
              join_date: '2005-03-15',
              is_featured: true
            },
            {
              id: 3,
              name: 'ফিরোজ চৌধুরী',
              position: 'সহযোগী সম্পাদক',
              department: 'সম্পাদকীয়',
              bio: 'খেলাধুলা ও সংস্কৃতি বিভাগের দায়িত্বে রয়েছে। ২০ বছরের অভিজ্ঞতা রয়েছে।',
              image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
              email: 'firoz@prothomalo.com',
              phone: '০২-৮৩৪৮৮৬৯',
              join_date: '2010-07-20',
              is_featured: false
            }
          ]);
        } else {
          setTeamMembers(teamData || []);
        }

        // Fetch company information from Supabase
        const { data: companyData, error: companyError } = await supabase
          .from('company_info')
          .select('*')
          .order('display_order', { ascending: true });

        if (companyError) {
          console.error('Error fetching company info:', companyError);
          // Use fallback data if table doesn't exist
          setCompanyInfo([
            {
              id: 1,
              section: 'mission',
              title: 'আমাদের লক্ষ্য',
              content: 'র লক্ষ্য হলো বাংলাদেশের জনগণের কাছে সত্য, নিরপেক্ষ ও সময়োপযোগী সংবাদ পৌঁছে দেওয়া। আমরা গণতান্ত্রিক মূল্যবোধ, মানবাধিকার এবং সামাজিক ন্যায়বিচারের পক্ষে কাজ করি।',
              display_order: 1,
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              section: 'vision',
              title: 'আমাদের দৃষ্টিভঙ্গি',
              content: 'একটি শিক্ষিত, সচেতন ও প্রগতিশীল বাংলাদেশ গড়ে তোলায় অবদান রাখা। আমরা চাই সমাজের প্রতিটি স্তরে সচেতনতা বৃদ্ধি এবং গণতান্ত্রিক চর্চার বিকাশ।',
              display_order: 2,
              updated_at: new Date().toISOString()
            },
            {
              id: 3,
              section: 'values',
              title: 'আমাদের মূল্যবোধ',
              content: 'সত্যতা, নিরপেক্ষতা, জবাবদিহিতা এবং সামাজিক দায়বদ্ধতা আমাদের মূল মূল্যবোধ। আমরা পেশাদারিত্ব বজায় রেখে কাজ করি এবং সকল ধরনের দুর্নীতি ও অনৈতিকতার বিরুদ্ধে অবস্থান নিই।',
              display_order: 3,
              updated_at: new Date().toISOString()
            },
            {
              id: 4,
              section: 'history',
              title: 'আমাদের ইতিহাস',
              content: ' ১৯৯৮ সালে প্রতিষ্ঠিত হয় এবং দ্রুত বাংলাদেশের অন্যতম জনপ্রিয় দৈনিক পত্রিকা হিসেবে স্থান করে নেয়। আমরা বাংলাদেশের গণতান্ত্রিক আন্দোলন, মুক্তিযুদ্ধের চেতনা এবং সামাজিক অগ্রগতির সাথে জড়িত থেকেছি।',
              display_order: 4,
              updated_at: new Date().toISOString()
            }
          ]);
        } else {
          setCompanyInfo(companyData || []);
        }

      } catch (err) {
        console.error('Error fetching about data:', err);
        setError('পেজ লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'mission':
        return <Target className="h-5 w-5 text-blue-500" />;
      case 'vision':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'values':
        return <Award className="h-5 w-5 text-green-500" />;
      case 'history':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <Users className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-32 bg-gray-200 rounded-full w-32 mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                পুনরায় চেষ্টা করুন
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="আমাদের সম্পর্কে - Bengali News"
        description="জানুন Bengali News সম্পর্কে। আমাদের দল, মিশন এবং দৃষ্টিভঙ্গি সম্পর্কে বিস্তারিত তথ্য।"
        image="/og-image.svg"
        url="/about"
        type="website"
        keywords="about us, সম্পর্কে, team, টিম, mission, vision, Bengali News"
        tags={["about", "team", "company", "বাংলা সংবাদ"]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">পরিচিতি</h1>
            <p className="text-gray-600"> সম্পর্কে জানুন</p>
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {companyInfo.map((info) => (
            <Card key={info.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getSectionIcon(info.section)}
                  {info.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {info.content}
                </p>
                <div className="text-sm text-gray-500">
                  সর্বশেষ আপডেট: <DateFormatter date={info.updated_at} />
                </div>
              </CardContent>
            </Card>
            ))}
        </div>

        {/* Team Members */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            আমাদের দল
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-24 h-24 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      {member.is_featured && (
                        <Badge className="absolute -top-2 -right-2 bg-blue-500">
                          প্রধান
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{member.position}</p>
                    <p className="text-sm text-gray-600 mb-4">{member.bio}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 justify-center">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{member.phone}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        যোগদান: <DateFormatter date={member.join_date} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              যোগাযোগের ঠিকানা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">প্রধান কার্যালয়</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">১৯/এ, মমতাজ প্যালেস, পুরানা পল্টন, ঢাকা-১০০০</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">০২-৮৩৪৮৮৬৭</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">info@prothomalo.com</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">অফিস সময়</h3>
                <div className="space-y-1 text-sm">
                  <p>সোমবার - শুক্রবার: সকাল ৯টা - সন্ধ্যা ৬টা</p>
                  <p>শনিবার: সকাল ৯টা - দুপুর ২টা</p>
                  <p>রবিবার: বন্ধ</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}