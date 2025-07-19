import { Helmet } from 'react-helmet';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateSocialMetaTags, getMetaTagsForHelmet } from '@/lib/social-media-meta';
import { Facebook, Twitter, MessageCircle, Send, Instagram, ExternalLink, Copy, CheckCircle } from 'lucide-react';

/**
 * Social Media Test Page
 * This page allows testing and previewing social media meta tags
 * for Facebook, Twitter, WhatsApp, Telegram, Instagram, and other platforms
 */
const SocialMediaTest = () => {
  const [customTitle, setCustomTitle] = useState(' - সোশ্যাল মিডিয়া টেস্ট');
  const [customDescription, setCustomDescription] = useState('সোশ্যাল মিডিয়া শেয়ারিং ফিচার টেস্ট করার জন্য এই পেজটি ব্যবহার করুন। WhatsApp, Telegram, Instagram, Facebook এবং Twitter এ লিংক শেয়ার করে দেখুন।');
  const [customImage, setCustomImage] = useState('/og-default-image.svg');
  const [copied, setCopied] = useState(false);

  // Generate social media meta tags with custom values
  const socialMetaTags = generateSocialMetaTags({
    title: customTitle,
    description: customDescription,
    image: customImage,
    url: '/social-media-test',
    type: 'website'
  });

  const { metaElements, linkElements } = getMetaTagsForHelmet(socialMetaTags);

  // Get current page URL for sharing
  const currentUrl = `${window.location.origin}/social-media-test`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Social media sharing URLs
  const socialShareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(customTitle)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${customTitle} - ${currentUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(customTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
  };

  // Debugging tools URLs
  const debugUrls = {
    facebook: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(currentUrl)}`,
    twitter: `https://cards-dev.twitter.com/validator?q=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(currentUrl)}`
  };

  return (
    <>
      <Helmet>
        <title>{socialMetaTags.title}</title>
        {metaElements.map((meta, index) => 
          meta.property ? (
            <meta key={index} property={meta.property} content={meta.content} />
          ) : (
            <meta key={index} name={meta.name} content={meta.content} />
          )
        )}
        {linkElements.map((link, index) => (
          <link key={index} rel={link.rel} href={link.href} />
        ))}
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 font-hind">সোশ্যাল মিডিয়া প্রিভিউ টেস্ট</h1>
          <p className="text-lg text-muted-foreground">
            WhatsApp, Telegram, Instagram, Facebook, Twitter এবং অন্যান্য প্ল্যাটফর্মে লিংক শেয়ার করার জন্য টেস্ট পেজ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>মেটা ট্যাগ কনফিগারেশন</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">শিরোনাম</Label>
                  <Input
                    id="title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="পেজের শিরোনাম লিখুন"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">বর্ণনা</Label>
                  <Textarea
                    id="description"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="পেজের বর্ণনা লিখুন (১৬০ অক্ষরের মধ্যে)"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {customDescription.length}/160 অক্ষর
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="image">ছবির URL</Label>
                  <Input
                    id="image"
                    value={customImage}
                    onChange={(e) => setCustomImage(e.target.value)}
                    placeholder="ছবির লিংক (1200x630px সাইজ ভালো হবে)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Current URL */}
            <Card>
              <CardHeader>
                <CardTitle>শেয়ার করার লিংক</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input value={currentUrl} readOnly />
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  এই লিংকটি কপি করে সোশ্যাল মিডিয়ায় শেয়ার করুন
                </p>
              </CardContent>
            </Card>

            {/* Social Sharing Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>সোশ্যাল মিডিয়ায় শেয়ার করুন</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => window.open(socialShareUrls.facebook, '_blank')}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  
                  <Button 
                    onClick={() => window.open(socialShareUrls.twitter, '_blank')}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  
                  <Button 
                    onClick={() => window.open(socialShareUrls.whatsapp, '_blank')}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                  
                  <Button 
                    onClick={() => window.open(socialShareUrls.telegram, '_blank')}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Send className="w-4 h-4" />
                    Telegram
                  </Button>
                  
                  <Button 
                    onClick={() => window.open(socialShareUrls.linkedin, '_blank')}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    LinkedIn
                  </Button>
                  
                  <Button 
                    onClick={() => navigator.share?.({ title: customTitle, text: customDescription, url: currentUrl })}
                    className="flex items-center gap-2"
                    variant="outline"
                    disabled={!navigator.share}
                  >
                    <Instagram className="w-4 h-4" />
                    অন্যান্য
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Debug Tools */}
            <Card>
              <CardHeader>
                <CardTitle>ডিবাগ টুলস</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  এই টুলস ব্যবহার করে দেখুন প্রিভিউ সঠিক দেখাচ্ছে কি না:
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => window.open(debugUrls.facebook, '_blank')}
                    className="w-full justify-start"
                    variant="outline"
                    size="sm"
                  >
                    Facebook Sharing Debugger
                  </Button>
                  
                  <Button 
                    onClick={() => window.open(debugUrls.twitter, '_blank')}
                    className="w-full justify-start"
                    variant="outline"
                    size="sm"
                  >
                    Twitter Card Validator
                  </Button>
                  
                  <Button 
                    onClick={() => window.open(debugUrls.linkedin, '_blank')}
                    className="w-full justify-start"
                    variant="outline"
                    size="sm"
                  >
                    LinkedIn Post Inspector
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Meta Tags Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>জেনারেট হওয়া মেটা ট্যাগস</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <code className="text-sm">
                    <div className="space-y-1">
                      <div>&lt;title&gt;{socialMetaTags.title}&lt;/title&gt;</div>
                      {metaElements.map((meta, index) => (
                        <div key={index}>
                          &lt;meta {meta.property ? `property="${meta.property}"` : `name="${meta.name}"`} content="{meta.content}" /&gt;
                        </div>
                      ))}
                      {linkElements.map((link, index) => (
                        <div key={index}>
                          &lt;link rel="{link.rel}" href="{link.href}" /&gt;
                        </div>
                      ))}
                    </div>
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Preview Cards */}
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Facebook/WhatsApp/Telegram প্রিভিউ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      {customImage ? (
                        <img src={customImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-500">ছবি নেই</div>
                      )}
                    </div>
                    <div className="p-3 border-t">
                      <div className="text-sm text-gray-600 uppercase tracking-wide"></div>
                      <div className="font-semibold text-gray-900 mt-1">{customTitle}</div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">{customDescription}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Twitter কার্ড প্রিভিউ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      {customImage ? (
                        <img src={customImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-500">ছবি নেই</div>
                      )}
                    </div>
                    <div className="p-3 border-t">
                      <div className="font-semibold text-gray-900">{customTitle}</div>
                      <div className="text-sm text-gray-600 mt-1">{customDescription}</div>
                      <div className="text-sm text-gray-500 mt-2">🔗 prothomalo.com</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>টেস্ট করার নির্দেশনা</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">প্ল্যাটফর্ম স্পেসিফিক টেস্ট:</h3>
                <ul className="space-y-2 text-sm">
                  <li><strong>WhatsApp:</strong> লিংক কপি করে কোনো চ্যাটে পেস্ট করুন</li>
                  <li><strong>Telegram:</strong> লিংক কোনো গ্রুপ বা চ্যাটে শেয়ার করুন</li>
                  <li><strong>Instagram:</strong> Stories-এ লিংক স্টিকার ব্যবহার করুন</li>
                  <li><strong>Facebook:</strong> পোস্ট বা মেসেঞ্জারে লিংক শেয়ার করুন</li>
                  <li><strong>Twitter:</strong> টুইট করুন বা DM পাঠান</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">যাচাই করার বিষয়:</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ সঠিক শিরোনাম দেখাচ্ছে</li>
                  <li>✅ বর্ণনা সম্পূর্ণ দেখাচ্ছে</li>
                  <li>✅ ছবি লোড হচ্ছে (1200x630px)</li>
                  <li>✅ সাইটের নাম "" দেখাচ্ছে</li>
                  <li>✅ URL সঠিক আছে</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SocialMediaTest;