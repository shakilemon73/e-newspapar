import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, FileText, Phone, Mail, Calendar, TrendingUp, Users, Target } from 'lucide-react';
import { DateFormatter } from '@/components/DateFormatter';
import supabase from '@/lib/supabase';

interface AdPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
}

interface AdRate {
  id: number;
  category: string;
  position: string;
  size: string;
  rate_per_day: number;
  rate_per_week: number;
  rate_per_month: number;
  discount_percentage: number;
  updated_at: string;
}

export default function Advertisement() {
  const [adPackages, setAdPackages] = useState<AdPackage[]>([]);
  const [adRates, setAdRates] = useState<AdRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch advertisement packages from Supabase
        const { data: packageData, error: packageError } = await supabase
          .from('ad_packages')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (packageError) {
          console.error('Error fetching ad packages:', packageError);
          // Use fallback data if table doesn't exist
          setAdPackages([
            {
              id: 1,
              name: 'বেসিক প্যাকেজ',
              description: 'ছোট ব্যবসার জন্য উপযুক্ত বিজ্ঞাপন প্যাকেজ',
              price: 5000,
              duration: '১ সপ্তাহ',
              features: [
                'হোম পেজে সাইডবার বিজ্ঞাপন',
                'দৈনিক ৫০০০ ভিউ গ্যারান্টি',
                'মোবাইল অপটিমাইজেশন'
              ],
              is_popular: false,
              is_active: true
            },
            {
              id: 2,
              name: 'স্ট্যান্ডার্ড প্যাকেজ',
              description: 'মাঝারি ব্যবসার জন্য সবচেয়ে জনপ্রিয় প্যাকেজ',
              price: 15000,
              duration: '১ মাস',
              features: [
                'হোম পেজে ব্যানার বিজ্ঞাপন',
                'দৈনিক ১৫০০০ ভিউ গ্যারান্টি',
                'সকল পেজে প্রদর্শন',
                'এনালিটিক্স রিপোর্ট'
              ],
              is_popular: true,
              is_active: true
            },
            {
              id: 3,
              name: 'প্রিমিয়াম প্যাকেজ',
              description: 'বড় ব্র্যান্ডের জন্য সর্বোচ্চ এক্সপোজার প্যাকেজ',
              price: 40000,
              duration: '১ মাস',
              features: [
                'হোম পেজে টপ ব্যানার',
                'দৈনিক ৫০০০০ ভিউ গ্যারান্টি',
                'সকল পেজে প্রাইমারি প্রদর্শন',
                'বিস্তারিত এনালিটিক্স',
                'কাস্টম ডিজাইন সাপোর্ট'
              ],
              is_popular: false,
              is_active: true
            }
          ]);
        } else {
          setAdPackages(packageData || []);
        }

        // Fetch advertisement rates from Supabase
        const { data: rateData, error: rateError } = await supabase
          .from('ad_rates')
          .select('*')
          .order('category', { ascending: true });

        if (rateError) {
          console.error('Error fetching ad rates:', rateError);
          // Use fallback data if table doesn't exist
          setAdRates([
            {
              id: 1,
              category: 'ব্যানার বিজ্ঞাপন',
              position: 'হোম পেজ টপ',
              size: '728x90',
              rate_per_day: 1000,
              rate_per_week: 6000,
              rate_per_month: 20000,
              discount_percentage: 20,
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              category: 'সাইডবার বিজ্ঞাপন',
              position: 'রাইট সাইডবার',
              size: '300x250',
              rate_per_day: 500,
              rate_per_week: 3000,
              rate_per_month: 10000,
              discount_percentage: 15,
              updated_at: new Date().toISOString()
            },
            {
              id: 3,
              category: 'মোবাইল বিজ্ঞাপন',
              position: 'মোবাইল ব্যানার',
              size: '320x50',
              rate_per_day: 300,
              rate_per_week: 1800,
              rate_per_month: 6000,
              discount_percentage: 10,
              updated_at: new Date().toISOString()
            }
          ]);
        } else {
          setAdRates(rateData || []);
        }

      } catch (err) {
        console.error('Error fetching ad data:', err);
        setError('বিজ্ঞাপনের তথ্য লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchAdData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">বিজ্ঞাপন</h1>
          <p className="text-gray-600">তে আপনার ব্যবসার প্রচার করুন</p>
        </div>

        {/* Advertisement Packages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-500" />
            বিজ্ঞাপন প্যাকেজ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adPackages.map((pkg) => (
              <Card key={pkg.id} className={`relative hover:shadow-lg transition-shadow ${pkg.is_popular ? 'ring-2 ring-blue-500' : ''}`}>
                {pkg.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">জনপ্রিয়</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    {pkg.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {formatPrice(pkg.price)}
                    </div>
                    <div className="text-sm text-gray-500">{pkg.duration}</div>
                  </div>
                  <div className="space-y-2 mb-6">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full">
                    প্যাকেজ নির্বাচন করুন
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Advertisement Rates */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            বিজ্ঞাপনের হার
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adRates.map((rate) => (
              <Card key={rate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    {rate.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">অবস্থান:</span>
                      <span className="font-medium">{rate.position}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">আকার:</span>
                      <Badge variant="outline">{rate.size}</Badge>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">দৈনিক হার:</span>
                        <span className="font-bold text-green-600">{formatPrice(rate.rate_per_day)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">সাপ্তাহিক হার:</span>
                        <span className="font-bold text-blue-600">{formatPrice(rate.rate_per_week)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">মাসিক হার:</span>
                        <span className="font-bold text-purple-600">{formatPrice(rate.rate_per_month)}</span>
                      </div>
                      {rate.discount_percentage > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600">ছাড়:</span>
                          <Badge variant="secondary" className="text-green-600">
                            {rate.discount_percentage}%
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      সর্বশেষ আপডেট: <DateFormatter date={rate.updated_at} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Advertise With Us */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-orange-500" />
            কেন তে বিজ্ঞাপন দিবেন?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">বিস্তৃত পাঠকসংখ্যা</h3>
                    <p className="text-sm text-gray-600">দৈনিক ৫ লক্ষ+ ভিজিটর</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  বাংলাদেশের সবচেয়ে জনপ্রিয় সংবাদপত্রের একটি হিসেবে আমাদের রয়েছে বিস্তৃত পাঠকসংখ্যা। 
                  আপনার ব্যবসার সঠিক টার্গেট অডিয়েন্সের কাছে পৌঁছান।
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">সাশ্রয়ী মূল্য</h3>
                    <p className="text-sm text-gray-600">প্রতিযোগিতামূলক রেট</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  আমাদের বিজ্ঞাপনের হার অত্যন্ত প্রতিযোগিতামূলক। ছোট থেকে বড় সব ধরনের ব্যবসার জন্য 
                  উপযুক্ত প্যাকেজ রয়েছে।
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-500" />
              বিজ্ঞাপনের জন্য যোগাযোগ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">ফোন</p>
                    <p className="text-sm text-gray-600">০২-৮৩৪৮৮৬৮</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">ইমেইল</p>
                    <p className="text-sm text-gray-600">ads@prothomalo.com</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">অফিস সময়</p>
                    <p className="text-sm text-gray-600">সকাল ৯টা - সন্ধ্যা ৬টা</p>
                  </div>
                </div>
                <Button className="w-full">
                  এখনই যোগাযোগ করুন
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}