import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Database, Cookie, UserCheck, AlertTriangle } from 'lucide-react';
import { DateFormatter } from '@/components/DateFormatter';
import supabase from '@/lib/supabase';

interface PolicySection {
  id: number;
  title: string;
  content: string;
  section_type: string;
  is_active: boolean;
  display_order: number;
  updated_at: string;
}

export default function PrivacyPolicy() {
  const [policySections, setPolicySections] = useState<PolicySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch privacy policy sections from Supabase
        const { data, error } = await supabase
          .from('privacy_policy_sections')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching privacy policy:', error);
          // Use fallback data if table doesn't exist
          setPolicySections([
            {
              id: 1,
              title: 'তথ্য সংগ্রহ',
              content: 'আমরা শুধুমাত্র প্রয়োজনীয় ব্যক্তিগত তথ্য সংগ্রহ করি যা আমাদের সেবা প্রদানের জন্য আবশ্যক। এই তথ্যগুলির মধ্যে রয়েছে:\n\n• নাম এবং যোগাযোগের তথ্য\n• ইমেইল ঠিকানা\n• ফোন নম্বর\n• ব্রাউজিং হিস্ট্রি এবং পছন্দ\n• কুকিজ এবং ব্যবহারের তথ্য\n\nআমরা আপনার সুস্পষ্ট সম্মতি ছাড়া কোনো সংবেদনশীল তথ্য সংগ্রহ করি না।',
              section_type: 'collection',
              is_active: true,
              display_order: 1,
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              title: 'তথ্য ব্যবহার',
              content: 'আমরা আপনার ব্যক্তিগত তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করি:\n\n• আপনাকে সর্বোত্তম সেবা প্রদান করা\n• আপনার অ্যাকাউন্ট পরিচালনা করা\n• ব্যক্তিগতকৃত সংবাদ এবং বিষয়বস্তু প্রদান করা\n• আমাদের সেবার মান উন্নত করা\n• আইনি প্রয়োজন পূরণ করা\n\nআমরা কখনো আপনার তথ্য বিক্রি বা ভাড়া দেই না।',
              section_type: 'usage',
              is_active: true,
              display_order: 2,
              updated_at: new Date().toISOString()
            },
            {
              id: 3,
              title: 'তথ্য সুরক্ষা',
              content: 'আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষার জন্য শিল্পের সর্বোচ্চ মানের নিরাপত্তা ব্যবস্থা প্রয়োগ করি:\n\n• SSL এনক্রিপশন প্রযুক্তি\n• নিরাপদ সার্ভার এবং ডেটাবেস\n• নিয়মিত নিরাপত্তা পরীক্ষা\n• অনুমোদিত কর্মীদের সীমিত প্রবেশাধিকার\n• নিয়মিত ব্যাকআপ এবং পুনরুদ্ধার ব্যবস্থা\n\nতবে, ইন্টারনেটে কোনো ডেটা ট্রান্সমিশন সম্পূর্ণ নিরাপদ নয়।',
              section_type: 'security',
              is_active: true,
              display_order: 3,
              updated_at: new Date().toISOString()
            },
            {
              id: 4,
              title: 'কুকিজ এবং ট্র্যাকিং',
              content: 'আমাদের ওয়েবসাইট কুকিজ এবং অনুরূপ প্রযুক্তি ব্যবহার করে:\n\n• আপনার পছন্দ মনে রাখা\n• সাইটের কর্মক্ষমতা উন্নত করা\n• ব্যবহারের পরিসংখ্যান সংগ্রহ করা\n• ব্যক্তিগতকৃত বিজ্ঞাপন প্রদান করা\n\nআপনি যেকোনো সময় আপনার ব্রাউজার সেটিংস থেকে কুকিজ নিয়ন্ত্রণ করতে পারেন।',
              section_type: 'cookies',
              is_active: true,
              display_order: 4,
              updated_at: new Date().toISOString()
            },
            {
              id: 5,
              title: 'তৃতীয় পক্ষের সেবা',
              content: 'আমরা আমাদের সেবার মান উন্নত করতে বিশ্বস্ত তৃতীয় পক্ষের সেবা ব্যবহার করি:\n\n• গুগল অ্যানালিটিক্স - ওয়েবসাইট পরিসংখ্যানের জন্য\n• সামাজিক মাধ্যম প্ল্যাটফর্ম - শেয়ারিং এবং এম্বেডিং\n• পেমেন্ট প্রসেসর - নিরাপদ লেনদেনের জন্য\n• ইমেইল সেবা - যোগাযোগের জন্য\n\nএই সেবাগুলির নিজস্ব গোপনীয়তা নীতি রয়েছে।',
              section_type: 'third_party',
              is_active: true,
              display_order: 5,
              updated_at: new Date().toISOString()
            },
            {
              id: 6,
              title: 'আপনার অধিকার',
              content: 'আপনার ব্যক্তিগত তথ্য সম্পর্কে আপনার নিম্নলিখিত অধিকার রয়েছে:\n\n• আপনার তথ্য দেখা এবং সংশোধন করা\n• আপনার অ্যাকাউন্ট মুছে ফেলা\n• তথ্য প্রক্রিয়াকরণে আপত্তি জানানো\n• তথ্য পোর্টেবিলিটি\n• সম্মতি প্রত্যাহার করা\n\nএই অধিকারগুলি ব্যবহার করতে আমাদের সাথে যোগাযোগ করুন।',
              section_type: 'rights',
              is_active: true,
              display_order: 6,
              updated_at: new Date().toISOString()
            }
          ]);
        } else {
          setPolicySections(data || []);
        }
      } catch (err) {
        console.error('Error fetching privacy policy:', err);
        setError('গোপনীয়তা নীতি লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'collection':
        return <Database className="h-5 w-5 text-blue-500" />;
      case 'usage':
        return <Eye className="h-5 w-5 text-green-500" />;
      case 'security':
        return <Shield className="h-5 w-5 text-purple-500" />;
      case 'cookies':
        return <Cookie className="h-5 w-5 text-orange-500" />;
      case 'third_party':
        return <UserCheck className="h-5 w-5 text-indigo-500" />;
      case 'rights':
        return <Lock className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
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
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-500" />
            গোপনীয়তা নীতি
          </h1>
          <p className="text-gray-600">
            আমরা আপনার ব্যক্তিগত তথ্যের গোপনীয়তা এবং নিরাপত্তাকে অগ্রাধিকার দিই
          </p>
        </div>

        {/* Last Updated Info */}
        <Card className="mb-8 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-700">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">সর্বশেষ আপডেট</p>
                <p className="text-sm">
                  এই গোপনীয়তা নীতি সর্বশেষ <DateFormatter date={new Date().toISOString()} /> তারিখে আপডেট করা হয়েছে।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Sections */}
        <div className="space-y-6">
          {policySections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getSectionIcon(section.section_type)}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    সর্বশেষ আপডেট: <DateFormatter date={section.updated_at} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card className="mt-12 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              গোপনীয়তা সংক্রান্ত যোগাযোগ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                আমাদের গোপনীয়তা নীতি সম্পর্কে কোনো প্রশ্ন বা উদ্বেগ থাকলে আমাদের সাথে যোগাযোগ করুন:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">ইমেইল</p>
                  <p className="text-sm text-gray-600">privacy@prothomalo.com</p>
                </div>
                <div>
                  <p className="font-medium">ফোন</p>
                  <p className="text-sm text-gray-600">০২-৮৩৪৮৮৬৭</p>
                </div>
                <div>
                  <p className="font-medium">ঠিকানা</p>
                  <p className="text-sm text-gray-600">
                    ১৯/এ, মমতাজ প্যালেস, পুরানা পল্টন, ঢাকা-১০০০
                  </p>
                </div>
                <div>
                  <p className="font-medium">অফিস সময়</p>
                  <p className="text-sm text-gray-600">সকাল ৯টা - সন্ধ্যা ৬টা</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="mt-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-800 mb-2">গুরুত্বপূর্ণ বিজ্ঞপ্তি</h3>
                <p className="text-sm text-orange-700">
                  আমাদের গোপনীয়তা নীতি সময়ে সময়ে আপডেট হতে পারে। কোনো পরিবর্তন হলে আমরা 
                  এই পৃষ্ঠায় নতুন তারিখ সহ আপডেট প্রকাশ করব। আমরা আপনাকে নিয়মিত এই নীতি 
                  পর্যালোচনা করার পরামর্শ দিই।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}