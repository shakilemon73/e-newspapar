import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { DateFormatter } from '@/components/DateFormatter';
import supabase from '@/lib/supabase';

interface Policy {
  id: number;
  title: string;
  content: string;
  category: string;
  priority: number;
  is_active: boolean;
  updated_at: string;
}

interface Guideline {
  id: number;
  title: string;
  description: string;
  category: string;
  is_mandatory: boolean;
  created_at: string;
}

export default function EditorialPolicy() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch editorial policies from Supabase
        const { data: policyData, error: policyError } = await supabase
          .from('editorial_policies')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: true });

        if (policyError) {
          console.error('Error fetching policies:', policyError);
          // Use fallback data if table doesn't exist
          setPolicies([
            {
              id: 1,
              title: 'সম্পাদকীয় স্বাধীনতা',
              content: ' সম্পূর্ণ সম্পাদকীয় স্বাধীনতায় বিশ্বাস করে। আমাদের সাংবাদিকরা কোনো বাহ্যিক চাপ বা প্রভাব ছাড়াই তাদের কাজ সম্পন্ন করেন। আমরা সত্য প্রকাশে প্রতিশ্রুতিবদ্ধ এবং কোনো রাজনৈতিক বা অর্থনৈতিক স্বার্থের কাছে মাথা নত করি না।',
              category: 'independence',
              priority: 1,
              is_active: true,
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              title: 'সত্যতা ও নিরপেক্ষতা',
              content: 'আমাদের সকল সংবাদ সত্যতা যাচাইয়ের মাধ্যমে প্রকাশিত হয়। আমরা নিরপেক্ষ দৃষ্টিভঙ্গি বজায় রাখি এবং সব পক্ষের মতামত প্রকাশ করার চেষ্টা করি। গুজব বা অযাচাইকৃত তথ্য প্রকাশ করা হয় না।',
              category: 'accuracy',
              priority: 2,
              is_active: true,
              updated_at: new Date().toISOString()
            },
            {
              id: 3,
              title: 'মানবাধিকার ও মর্যাদা',
              content: 'আমরা সকল মানুষের মানবাধিকার ও মর্যাদাকে সম্মান করি। আমাদের সংবাদে কোনো জাতি, ধর্ম, বর্ণ, লিঙ্গ বা সামাজিক অবস্থানের ভিত্তিতে বৈষম্য করা হয় না। সংবাদ পরিবেশনায় মানবিক মূল্যবোধ বজায় রাখা হয়।',
              category: 'ethics',
              priority: 3,
              is_active: true,
              updated_at: new Date().toISOString()
            },
            {
              id: 4,
              title: 'গোপনীয়তা ও সূত্র সুরক্ষা',
              content: 'আমরা সংবাদ সূত্রের গোপনীয়তা রক্ষা করি এবং প্রয়োজনে সূত্র প্রকাশ না করার অধিকার সংরক্ষণ করি। ব্যক্তিগত তথ্য প্রকাশে সতর্কতা অবলম্বন করা হয় এবং জনস্বার্থের বিষয়ে মনোযোগ দেওয়া হয়।',
              category: 'privacy',
              priority: 4,
              is_active: true,
              updated_at: new Date().toISOString()
            }
          ]);
        } else {
          setPolicies(policyData || []);
        }

        // Fetch editorial guidelines from Supabase
        const { data: guidelineData, error: guidelineError } = await supabase
          .from('editorial_guidelines')
          .select('*')
          .order('created_at', { ascending: false });

        if (guidelineError) {
          console.error('Error fetching guidelines:', guidelineError);
          // Use fallback data if table doesn't exist
          setGuidelines([
            {
              id: 1,
              title: 'তথ্য যাচাই',
              description: 'প্রতিটি সংবাদ প্রকাশের আগে কমপক্ষে দুটি নির্ভরযোগ্য সূত্র থেকে তথ্য যাচাই করতে হবে।',
              category: 'verification',
              is_mandatory: true,
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              title: 'ভাষা ও উপস্থাপনা',
              description: 'সংবাদে সহজ, স্পষ্ট ও শুদ্ধ বাংলা ভাষা ব্যবহার করতে হবে। অশালীন বা উস্কানিমূলক ভাষা পরিহার করতে হবে।',
              category: 'language',
              is_mandatory: true,
              created_at: new Date().toISOString()
            },
            {
              id: 3,
              title: 'ছবি ও গ্রাফিক্স',
              description: 'সংবাদের সাথে প্রাসঙ্গিক এবং নির্ভরযোগ্য ছবি ব্যবহার করতে হবে। ছবি সম্পাদনা করা হলে তা উল্লেখ করতে হবে।',
              category: 'media',
              is_mandatory: false,
              created_at: new Date().toISOString()
            },
            {
              id: 4,
              title: 'প্রতিক্রিয়া ও সংশোধন',
              description: 'কোনো ভুল তথ্য প্রকাশিত হলে দ্রুত সংশোধন করতে হবে এবং সংশ্লিষ্ট পক্ষের প্রতিক্রিয়া নিতে হবে।',
              category: 'correction',
              is_mandatory: true,
              created_at: new Date().toISOString()
            }
          ]);
        } else {
          setGuidelines(guidelineData || []);
        }

      } catch (err) {
        console.error('Error fetching policy data:', err);
        setError('সম্পাদকীয় নীতিমালা লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyData();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'independence':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'accuracy':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'ethics':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'privacy':
        return <Shield className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
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
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
          <h1 className="text-4xl font-bold mb-4">সম্পাদকীয় নীতিমালা</h1>
          <p className="text-gray-600">র সম্পাদকীয় নীতি ও নির্দেশনা</p>
        </div>

        {/* Editorial Policies */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            মূল নীতিমালা
          </h2>
          
          {policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(policy.category)}
                  {policy.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                  {policy.content}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    অগ্রাধিকার: {policy.priority}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    সর্বশেষ আপডেট: <DateFormatter date={policy.updated_at} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Editorial Guidelines */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            সম্পাদকীয় নির্দেশনা
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.map((guideline) => (
              <Card key={guideline.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getCategoryIcon(guideline.category)}
                      {guideline.title}
                    </span>
                    {guideline.is_mandatory && (
                      <Badge variant="destructive">বাধ্যতামূলক</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {guideline.description}
                  </p>
                  <div className="text-sm text-gray-500">
                    তৈরি: <DateFormatter date={guideline.created_at} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <Card className="mt-12 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">গুরুত্বপূর্ণ নোট</h3>
                <p className="text-sm text-gray-700">
                  এই নীতিমালা নিয়মিত পর্যালোচনা ও আপডেট করা হয়। সকল কর্মচারী এবং সংশ্লিষ্ট ব্যক্তিদের 
                  এই নীতিমালা মেনে চলা বাধ্যতামূলক। কোনো প্রশ্ন বা পরামর্শ থাকলে সম্পাদকীয় বিভাগের সাথে যোগাযোগ করুন।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}