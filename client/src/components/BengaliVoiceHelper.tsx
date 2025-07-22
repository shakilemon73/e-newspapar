import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Download, Check, AlertCircle, ExternalLink } from 'lucide-react';

export function BengaliVoiceHelper() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasBengaliVoice, setHasBengaliVoice] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        const bengaliVoices = availableVoices.filter(voice => 
          voice.lang.startsWith('bn') || 
          voice.lang.includes('bengali') ||
          voice.name.toLowerCase().includes('bengali') ||
          voice.name.toLowerCase().includes('bangla')
        );
        
        setHasBengaliVoice(bengaliVoices.length > 0);
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('বাংলাদেশ আমাদের স্বাধীন দেশ।');
      utterance.lang = 'bn-BD';
      speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>অসমর্থিত ব্রাউজার</AlertTitle>
        <AlertDescription>
          আপনার ব্রাউজার টেক্সট-টু-স্পিচ সাপোর্ট করে না।
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          বাংলা কণ্ঠস্বর সেটআপ
        </CardTitle>
        <CardDescription>
          সঠিক বাংলা উচ্চারণের জন্য বাংলা কণ্ঠস্বর ইন্সটল করুন
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasBengaliVoice ? (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertTitle>বাংলা কণ্ঠস্বর পাওয়া গেছে</AlertTitle>
            <AlertDescription>
              আপনার ব্রাউজারে বাংলা কণ্ঠস্বর ইনস্টল করা আছে। টেক্সট-টু-স্পিচ বাংলায় কাজ করবে।
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>বাংলা কণ্ঠস্বর নেই</AlertTitle>
            <AlertDescription>
              আপনার ব্রাউজারে বাংলা কণ্ঠস্বর ইন্সটল নেই। এখন Hindi বা English ব্যবহার হবে।
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold">বাংলা কণ্ঠস্বর ইন্সটল করার নিয়ম:</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-600">Chrome:</span>
              <div>
                Settings → Advanced → Languages → Speech → Add বাংলা
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="font-semibold text-orange-600">Firefox:</span>
              <div>
                about:preferences → General → Language and Appearance → Speech
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-800">Edge:</span>
              <div>
                Settings → Languages → Speech → Add language → Bengali
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={testVoice} size="sm">
            <Volume2 className="h-4 w-4 mr-2" />
            বাংলা টেস্ট করুন
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://support.google.com/chrome/answer/3220216', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Chrome সাহায্য
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p><strong>উইন্ডোজ ১০/১১:</strong> Settings → Time & Language → Speech → Add voices</p>
          <p><strong>ম্যাক:</strong> System Preferences → Accessibility → Speech → System Voice → Customize</p>
        </div>
      </CardContent>
    </Card>
  );
}