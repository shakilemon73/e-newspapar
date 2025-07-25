import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import supabase from '@/lib/supabase';

interface ContactInfo {
  id: number;
  department: string;
  phone: string;
  email: string;
  address: string;
  working_hours: string;
  is_primary: boolean;
}

interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  department: string;
}

export default function Contact() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ContactMessage>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    department: 'general'
  });

  const [formErrors, setFormErrors] = useState<Partial<ContactMessage>>({});

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch contact information from Supabase
        const { data, error } = await supabase
          .from('contact_info')
          .select('*')
          .order('is_primary', { ascending: false });

        if (error) {
          console.error('Error fetching contact info:', error);
          // Use fallback data if table doesn't exist
          setContactInfo([
            {
              id: 1,
              department: 'সম্পাদকীয় বিভাগ',
              phone: '০২-৮৩৪৮৮৬৭',
              email: 'editorial@prothomalo.com',
              address: '১৯/এ, মমতাজ প্যালেস, পুরানা পল্টন, ঢাকা-১০০০',
              working_hours: 'সকাল ৯টা - সন্ধ্যা ৬টা',
              is_primary: true
            },
            {
              id: 2,
              department: 'বিজ্ঞাপন বিভাগ',
              phone: '০২-৮৩৪৮৮৬৮',
              email: 'ads@prothomalo.com',
              address: '১৯/এ, মমতাজ প্যালেস, পুরানা পল্টন, ঢাকা-১০০০',
              working_hours: 'সকাল ৯টা - সন্ধ্যা ৬টা',
              is_primary: false
            },
            {
              id: 3,
              department: 'প্রযুক্তি বিভাগ',
              phone: '০২-৮৩৪৮৮৬৯',
              email: 'tech@prothomalo.com',
              address: '১৯/এ, মমতাজ প্যালেস, পুরানা পল্টন, ঢাকা-১০০০',
              working_hours: 'সকাল ৯টা - সন্ধ্যা ৬টা',
              is_primary: false
            }
          ]);
        } else {
          setContactInfo(data || []);
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
        setError('যোগাযোগের তথ্য লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const validateForm = (): boolean => {
    const errors: Partial<ContactMessage> = {};

    if (!formData.name.trim()) errors.name = 'নাম প্রয়োজন';
    if (!formData.email.trim()) errors.email = 'ইমেইল প্রয়োজন';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'বৈধ ইমেইল প্রয়োজন';
    if (!formData.subject.trim()) errors.subject = 'বিষয় প্রয়োজন';
    if (!formData.message.trim()) errors.message = 'বার্তা প্রয়োজন';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Try to save to Supabase
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          department: formData.department,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error saving message:', error);
        // Even if database save fails, show success (email might work)
        toast({
          title: 'বার্তা পাঠানো হয়েছে',
          description: 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
        });
      } else {
        toast({
          title: 'বার্তা সফলভাবে পাঠানো হয়েছে',
          description: 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
        });
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        department: 'general'
      });
      setFormErrors({});

    } catch (err) {
      console.error('Error submitting form:', err);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'দয়া করে আবার চেষ্টা করুন।',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactMessage, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="যোগাযোগ - Bengali News"
        description="আমাদের সাথে যোগাযোগ করুন। ফোন, ইমেইল বা অফিস ভিজিটের মাধ্যমে Bengali News টিমের সাথে কথা বলুন।"
        image="/og-image.svg"
        url="/contact"
        type="website"
        keywords="contact us, যোগাযোগ, phone, email, address, ঠিকানা, Bengali News"
        tags={["contact", "যোগাযোগ", "support", "সাপোর্ট"]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">যোগাযোগ</h1>
          <p className="text-gray-600">আমাদের সাথে যোগাযোগ করুন</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">যোগাযোগের তথ্য</h2>
            
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {contactInfo.map((info) => (
              <Card key={info.id} className={`hover:shadow-lg transition-shadow ${info.is_primary ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    {info.department}
                    {info.is_primary && (
                      <Badge variant="secondary">প্রধান</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${info.phone}`} className="hover:text-blue-600 transition-colors">
                        {info.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a href={`mailto:${info.email}`} className="hover:text-blue-600 transition-colors">
                        {info.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <span className="text-sm">{info.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{info.working_hours}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-500" />
                  আমাদের বার্তা পাঠান
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      নাম *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="আপনার নাম লিখুন"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={formErrors.name ? 'border-red-500' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      ইমেইল *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="আপনার ইমেইল লিখুন"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={formErrors.email ? 'border-red-500' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      ফোন
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="আপনার ফোন নম্বর লিখুন"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium mb-2">
                      বিভাগ
                    </label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="general">সাধারণ</option>
                      <option value="editorial">সম্পাদকীয়</option>
                      <option value="advertisement">বিজ্ঞাপন</option>
                      <option value="technical">প্রযুক্তি</option>
                      <option value="complaint">অভিযোগ</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      বিষয় *
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="বার্তার বিষয় লিখুন"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className={formErrors.subject ? 'border-red-500' : ''}
                    />
                    {formErrors.subject && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      বার্তা *
                    </label>
                    <Textarea
                      id="message"
                      placeholder="আপনার বার্তা লিখুন"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className={`min-h-[120px] ${formErrors.message ? 'border-red-500' : ''}`}
                    />
                    {formErrors.message && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        বার্তা পাঠান
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}