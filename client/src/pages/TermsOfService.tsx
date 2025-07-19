import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Scale, AlertTriangle, CheckCircle, XCircle, Users, Shield } from 'lucide-react';
import { DateFormatter } from '@/components/DateFormatter';
import supabase from '@/lib/supabase';

interface TermsSection {
  id: number;
  title: string;
  content: string;
  section_type: string;
  is_active: boolean;
  display_order: number;
  updated_at: string;
}

export default function TermsOfService() {
  const [termsSections, setTermsSections] = useState<TermsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTermsOfService = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch terms of service sections from Supabase
        const { data, error } = await supabase
          .from('terms_of_service_sections')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching terms of service:', error);
          // Use fallback data if table doesn't exist
          setTermsSections([
            {
              id: 1,
              title: 'স্বীকৃতি ও সম্মতি',
              content: ' ওয়েবসাইট (www.prothomalo.com) ব্যবহার করে আপনি এই ব্যবহারের শর্তাবলী মেনে নিতে সম্মত হন। আপনি যদি এই শর্তাবলীর সাথে একমত না হন, তাহলে দয়া করে এই ওয়েবসাইট ব্যবহার করবেন না।\n\nএই শর্তাবলী আপনার এবং র মধ্যে একটি আইনি চুক্তি গঠন করে। আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার রাখি।',
              section_type: 'acceptance',
              is_active: true,
              display_order: 1,
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              title: 'ব্যবহারের নিয়ম',
              content: 'আপনি এই ওয়েবসাইট ব্যবহার করতে পারবেন যদি আপনি:\n\n• ১৮ বছর বা তার বেশি বয়সী হন\n• বৈধ ব্যক্তিগত তথ্য প্রদান করেন\n• আইনি এবং নৈতিক উদ্দেশ্যে ব্যবহার করেন\n• অন্যদের অধিকার এবং গোপনীয়তা সম্মান করেন\n\nনিষিদ্ধ ব্যবহার:\n• অবৈধ কার্যকলাপ\n• স্প্যামিং বা হ্যারাসমেন্ট\n• ভুয়া তথ্য প্রচার\n• কপিরাইট লঙ্ঘন\n• ভাইরাস বা ক্ষতিকর কোড আপলোড',
              section_type: 'usage',
              is_active: true,
              display_order: 2,
              updated_at: new Date().toISOString()
            },
            {
              id: 3,
              title: 'বুদ্ধিবৃত্তিক সম্পত্তি',
              content: ' ওয়েবসাইটের সকল বিষয়বস্তু, নিবন্ধ, ছবি, ভিডিও, লোগো এবং ডিজাইন র মালিকানাধীন বা লাইসেন্সপ্রাপ্ত। এই সামগ্রী কপিরাইট এবং অন্যান্য বুদ্ধিবৃত্তিক সম্পত্তি আইন দ্বারা সুরক্ষিত।\n\nআপনি পারবেন:\n• ব্যক্তিগত ব্যবহারের জন্য পড়া এবং দেখা\n• সামাজিক মাধ্যমে শেয়ার করা (সঠিক সূত্র উল্লেখ সহ)\n• উদ্ধৃতি প্রদান করা (সীমিত অংশ)\n\nআপনি পারবেন না:\n• বাণিজ্যিক উদ্দেশ্যে ব্যবহার করা\n• পুনঃপ্রকাশ বা বিতরণ করা\n• পরিবর্তন বা সম্পাদনা করা',
              section_type: 'intellectual_property',
              is_active: true,
              display_order: 3,
              updated_at: new Date().toISOString()
            },
            {
              id: 4,
              title: 'ব্যবহারকারী বিষয়বস্তু',
              content: 'আপনি যখন আমাদের ওয়েবসাইটে মন্তব্য, পর্যালোচনা বা অন্যান্য বিষয়বস্তু জমা দেন, তখন আপনি নিশ্চিত করছেন যে:\n\n• আপনার বিষয়বস্তু মূল এবং আপনার নিজস্ব\n• এটি কোনো তৃতীয় পক্ষের অধিকার লঙ্ঘন করে না\n• এটি আপত্তিজনক বা অবৈধ নয়\n• আপনি আমাদের এটি ব্যবহার করার অনুমতি দিচ্ছেন\n\nআমরা যেকোনো সময় যেকোনো ব্যবহারকারী বিষয়বস্তু সরানোর অধিকার রাখি। আপনি আপনার জমা দেওয়া বিষয়বস্তুর জন্য সম্পূর্ণভাবে দায়বদ্ধ।',
              section_type: 'user_content',
              is_active: true,
              display_order: 4,
              updated_at: new Date().toISOString()
            },
            {
              id: 5,
              title: 'দায়বদ্ধতার সীমাবদ্ধতা',
              content: ' এবং এর কর্মচারীরা নিম্নলিখিত বিষয়ে দায়বদ্ধ নয়:\n\n• ওয়েবসাইট ব্যবহারের ফলে কোনো ক্ষতি\n• তথ্যের নির্ভুলতা বা সম্পূর্ণতা\n• তৃতীয় পক্ষের ওয়েবসাইট বা সেবা\n• প্রযুক্তিগত সমস্যা বা বিঘ্ন\n• ব্যবহারকারীদের মধ্যে বিরোধ\n\nআমরা "যেমন আছে" ভিত্তিতে সেবা প্রদান করি। আপনি নিজ দায়িত্বে ওয়েবসাইট ব্যবহার করেন।',
              section_type: 'liability',
              is_active: true,
              display_order: 5,
              updated_at: new Date().toISOString()
            },
            {
              id: 6,
              title: 'অ্যাকাউন্ট বন্ধ এবং সমাপ্তি',
              content: 'আমরা যেকোনো সময় নিম্নলিখিত কারণে আপনার অ্যাকাউন্ট বন্ধ করতে পারি:\n\n• শর্তাবলী লঙ্ঘন\n• অবৈধ বা অনৈতিক কার্যকলাপ\n• নিষ্ক্রিয়তা দীর্ঘ সময়ের জন্য\n• প্রযুক্তিগত বা আইনি কারণ\n\nআপনিও যেকোনো সময় আপনার অ্যাকাউন্ট বন্ধ করতে পারেন। অ্যাকাউন্ট বন্ধ হলে আপনার সকল ডেটা মুছে ফেলা হবে।',
              section_type: 'termination',
              is_active: true,
              display_order: 6,
              updated_at: new Date().toISOString()
            },
            {
              id: 7,
              title: 'প্রযোজ্য আইন এবং বিরোধ নিষ্পত্তি',
              content: 'এই শর্তাবলী বাংলাদেশের আইন অনুসারে পরিচালিত হবে। যেকোনো বিরোধ বাংলাদেশের আদালতে নিষ্পত্তি হবে।\n\nবিরোধ নিষ্পত্তির পদ্ধতি:\n• প্রথমে আমাদের সাথে সরাসরি যোগাযোগ করুন\n• মধ্যস্থতার মাধ্যমে সমাধানের চেষ্টা করুন\n• প্রয়োজনে আইনি পদক্ষেপ নিন\n\nআমরা শান্তিপূর্ণ সমাধানে বিশ্বাস করি এবং যেকোনো সমস্যার সমাধানে সহযোগিতা করব।',
              section_type: 'governing_law',
              is_active: true,
              display_order: 7,
              updated_at: new Date().toISOString()
            }
          ]);
        } else {
          setTermsSections(data || []);
        }
      } catch (err) {
        console.error('Error fetching terms of service:', err);
        setError('ব্যবহারের শর্তাবলী লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchTermsOfService();
  }, []);

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'acceptance':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'usage':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'intellectual_property':
        return <Shield className="h-5 w-5 text-purple-500" />;
      case 'user_content':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'liability':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'termination':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'governing_law':
        return <Scale className="h-5 w-5 text-indigo-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSectionColor = (sectionType: string) => {
    switch (sectionType) {
      case 'acceptance':
        return 'bg-green-50 border-green-200';
      case 'usage':
        return 'bg-blue-50 border-blue-200';
      case 'intellectual_property':
        return 'bg-purple-50 border-purple-200';
      case 'user_content':
        return 'bg-orange-50 border-orange-200';
      case 'liability':
        return 'bg-red-50 border-red-200';
      case 'termination':
        return 'bg-gray-50 border-gray-200';
      case 'governing_law':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[...Array(7)].map((_, i) => (
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
            <Scale className="h-8 w-8 text-blue-500" />
            ব্যবহারের শর্তাবলী
          </h1>
          <p className="text-gray-600">
             ওয়েবসাইট ব্যবহারের নিয়ম ও শর্তাবলী
          </p>
        </div>

        {/* Effective Date */}
        <Card className="mb-8 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">কার্যকর তারিখ</p>
                <p className="text-sm">
                  এই শর্তাবলী <DateFormatter date={new Date().toISOString()} /> তারিখ থেকে কার্যকর।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-6">
          {termsSections.map((section, index) => (
            <Card key={section.id} className={`${getSectionColor(section.section_type)} border-l-4`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getSectionIcon(section.section_type)}
                    <span className="text-gray-500 text-sm font-normal">
                      {(index + 1).toString().padStart(2, '0')}.
                    </span>
                    {section.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {section.section_type}
                  </Badge>
                </div>
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

        {/* Agreement Section */}
        <Card className="mt-12 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              সম্মতি প্রদান
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                 ওয়েবসাইট ব্যবহার করে আপনি উপরোক্ত সকল শর্তাবলীতে সম্মত হচ্ছেন। 
                আপনি যদি এই শর্তাবলীর সাথে একমত না হন, তাহলে দয়া করে এই ওয়েবসাইট ব্যবহার করবেন না।
              </p>
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <p className="text-sm text-gray-600">
                  <strong>মনে রাখবেন:</strong> এই শর্তাবলী একটি আইনগত চুক্তি। আপনি এই ওয়েবসাইট 
                  ব্যবহার করলে আপনি এই চুক্তিতে আবদ্ধ থাকবেন।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-6 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              যোগাযোগ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                এই শর্তাবলী সম্পর্কে কোনো প্রশ্ন বা উদ্বেগ থাকলে আমাদের সাথে যোগাযোগ করুন:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">আইনি বিভাগ</p>
                  <p className="text-sm text-gray-600">legal@prothomalo.com</p>
                </div>
                <div>
                  <p className="font-medium">গ্রাহক সেবা</p>
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

        {/* Version Info */}
        <Card className="mt-6 border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <div className="text-sm">
                <p>
                  সংস্করণ: ১.০ | সর্বশেষ সংশোধন: <DateFormatter date={new Date().toISOString()} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}