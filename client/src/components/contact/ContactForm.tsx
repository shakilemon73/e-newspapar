import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sendContactMessage } from '@/lib/supabase-api-direct';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "ত্রুটি",
        description: "অনুগ্রহ করে সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await sendContactMessage(formData);
      
      if (result.success) {
        toast({
          title: "সফল",
          description: "আপনার বার্তা পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        toast({
          title: "ত্রুটি",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "ত্রুটি",
        description: "বার্তা পাঠাতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Contact Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">যোগাযোগ করুন</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          আমাদের সাথে যোগাযোগ করুন। আপনার মতামত, প্রশ্ন বা পরামর্শ আমাদের কাছে গুরুত্বপূর্ণ।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>যোগাযোগের তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">ইমেইল</p>
                  <p className="text-sm text-muted-foreground">contact@bengalinews.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">ফোন</p>
                  <p className="text-sm text-muted-foreground">+৮৮০ ১৭০০ ০০০০০০</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">ঠিকানা</p>
                  <p className="text-sm text-muted-foreground">
                    ঢাকা, বাংলাদেশ
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">কার্যসময়</p>
                  <p className="text-sm text-muted-foreground">
                    রবি - বৃহস্পতি: ৯:০০ - ১৮:০০
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>সংবাদ পাঠান</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                কোনো গুরুত্বপূর্ণ সংবাদ জানতে পারলে আমাদের জানান। আমরা তা যাচাই করে প্রকাশ করব।
              </p>
              <Button className="w-full mt-4" variant="outline">
                সংবাদ পাঠান
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>আমাদের লিখুন</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">নাম *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="আপনার নাম লিখুন"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">ইমেইল *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">ফোন</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="আপনার ফোন নম্বর"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">বিষয় *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="বার্তার বিষয়"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">বার্তা *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="আপনার বার্তা লিখুন..."
                    rows={6}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}