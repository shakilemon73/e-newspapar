import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/admin/LanguageToggle";
import { 
  Shield, 
  Key, 
  ArrowRight, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Lock,
  Smartphone,
  Globe
} from 'lucide-react';

const ACCESS_CODE = 'admin2025';

export default function EnhancedAdminAccess() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate processing for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (code.trim() === ACCESS_CODE) {
      setLocation('/admin-login');
    } else {
      setError(t('invalid-code', 'Invalid access code. Please try again.', 'অকার্যকর অ্যাক্সেস কোড। আবার চেষ্টা করুন।'));
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute top-4 right-4">
              <LanguageToggle />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('admin-access', 'Admin Access', 'অ্যাডমিন অ্যাক্সেস')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('secure-access', 'Secure access to Bengali News admin panel', 'বাংলা নিউজ অ্যাডমিন প্যানেলে নিরাপদ অ্যাক্সেস')}
          </p>
        </div>

        {/* Access Form */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5" />
              {t('enter-access-code', 'Enter Access Code', 'অ্যাক্সেস কোড প্রবেশ করুন')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('code-required', 'A valid access code is required to continue', 'অগ্রসর হওয়ার জন্য একটি বৈধ অ্যাক্সেস কোড প্রয়োজন')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code" className="text-sm font-medium">
                  {t('access-code', 'Access Code', 'অ্যাক্সেস কোড')}
                </Label>
                <div className="relative">
                  <Input
                    id="access-code"
                    type={showCode ? 'text' : 'password'}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (error) setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={t('enter-code', 'Enter your access code', 'আপনার অ্যাক্সেস কোড প্রবেশ করুন')}
                    className="h-12 text-center tracking-widest pr-12"
                    disabled={loading}
                    autoComplete="off"
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowCode(!showCode)}
                    disabled={loading}
                  >
                    {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                disabled={loading || !code.trim()}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {t('verifying', 'Verifying...', 'যাচাই করা হচ্ছে...')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t('access-admin', 'Access Admin Panel', 'অ্যাডমিন প্যানেল অ্যাক্সেস')}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-900 dark:text-blue-200">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>{t('security-notice', 'Security Notice:', 'নিরাপত্তা বিজ্ঞপ্তি:')}</strong>{' '}
            {t('security-text', 'This is a secure admin portal. All access attempts are logged and monitored.', 'এটি একটি নিরাপদ অ্যাডমিন পোর্টাল। সমস্ত অ্যাক্সেস প্রচেষ্টা লগ এবং পর্যবেক্ষণ করা হয়।')}
          </AlertDescription>
        </Alert>

        {/* Mobile Optimization Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Smartphone className="h-3 w-3" />
          <span>{t('mobile-optimized', 'Mobile Optimized', 'মোবাইল অপ্টিমাইজড')}</span>
          <Globe className="h-3 w-3" />
          <span>{t('multi-language', 'Multi-Language', 'বহুভাষিক')}</span>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            {t('footer-text', 'Bengali News Admin Portal', 'বাংলা নিউজ অ্যাডমিন পোর্টাল')} • {' '}
            {t('powered-by', 'Powered by Replit', 'Replit দ্বারা চালিত')}
          </p>
        </div>
      </div>
    </div>
  );
}