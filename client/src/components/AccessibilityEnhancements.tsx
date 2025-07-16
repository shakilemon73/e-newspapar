import React, { useState, useEffect } from 'react';
import { 
  Type, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  ZoomIn, 
  ZoomOut, 
  Pause, 
  Play, 
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  Contrast,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface AccessibilitySettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  contrast: string;
  textToSpeech: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  dyslexiaFriendly: boolean;
  colorBlindFriendly: boolean;
}

// Reading Focus Mode Component
export const ReadingFocusMode: React.FC<{ isActive: boolean; onToggle: () => void }> = ({ 
  isActive, 
  onToggle 
}) => {
  useEffect(() => {
    if (isActive) {
      document.body.classList.add('reading-focus-mode');
      // Hide non-essential elements
      const elements = document.querySelectorAll('header, nav, footer, aside, .ads, .social-media');
      elements.forEach(el => {
        (el as HTMLElement).style.opacity = '0.3';
        (el as HTMLElement).style.pointerEvents = 'none';
      });
    } else {
      document.body.classList.remove('reading-focus-mode');
      const elements = document.querySelectorAll('header, nav, footer, aside, .ads, .social-media');
      elements.forEach(el => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.pointerEvents = 'auto';
      });
    }
  }, [isActive]);

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className="flex items-center space-x-2"
    >
      <Eye className="w-4 h-4" />
      <span>{isActive ? 'ফোকাস মোড বন্ধ' : 'ফোকাস মোড'}</span>
    </Button>
  );
};

// Text-to-Speech Component
export const TextToSpeechControls: React.FC<{ text: string }> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.lang = 'bn-BD';
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const pause = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={isPlaying ? (isPaused ? resume : pause) : speak}
        disabled={!('speechSynthesis' in window)}
        className="flex items-center space-x-2"
      >
        {isPlaying ? (
          isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        <span>
          {isPlaying ? (isPaused ? 'চালিয়ে যান' : 'বিরতি') : 'শুনুন'}
        </span>
      </Button>
      
      {isPlaying && (
        <Button
          variant="outline"
          size="sm"
          onClick={stop}
          className="flex items-center space-x-2"
        >
          <VolumeX className="w-4 h-4" />
          <span>বন্ধ</span>
        </Button>
      )}
    </div>
  );
};

// Accessibility Settings Panel
export const AccessibilityPanel: React.FC = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    fontFamily: 'system',
    lineHeight: 1.6,
    contrast: 'normal',
    textToSpeech: false,
    reducedMotion: false,
    highContrast: false,
    dyslexiaFriendly: false,
    colorBlindFriendly: false,
  });

  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const applySettings = () => {
    const root = document.documentElement;
    
    // Apply font size
    root.style.setProperty('--reading-font-size', `${settings.fontSize}px`);
    
    // Apply font family
    const fontMap = {
      'system': 'system-ui, -apple-system, sans-serif',
      'serif': 'Georgia, serif',
      'sans-serif': 'Arial, sans-serif',
      'bengali': 'SolaimanLipi, Arial, sans-serif',
      'dyslexia': 'OpenDyslexic, Arial, sans-serif'
    };
    root.style.setProperty('--reading-font-family', fontMap[settings.fontFamily as keyof typeof fontMap]);
    
    // Apply line height
    root.style.setProperty('--reading-line-height', settings.lineHeight.toString());
    
    // Apply contrast
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    
    // Apply dyslexia-friendly styling
    if (settings.dyslexiaFriendly) {
      document.body.classList.add('dyslexia-friendly');
    } else {
      document.body.classList.remove('dyslexia-friendly');
    }
    
    // Apply color-blind friendly styling
    if (settings.colorBlindFriendly) {
      document.body.classList.add('color-blind-friendly');
    } else {
      document.body.classList.remove('color-blind-friendly');
    }
  };

  useEffect(() => {
    applySettings();
  }, [settings]);

  const resetSettings = () => {
    setSettings({
      fontSize: 16,
      fontFamily: 'system',
      lineHeight: 1.6,
      contrast: 'normal',
      textToSpeech: false,
      reducedMotion: false,
      highContrast: false,
      dyslexiaFriendly: false,
      colorBlindFriendly: false,
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>সহায়তা</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">পড়ার সহায়তা</h3>
            <Button variant="ghost" size="sm" onClick={resetSettings}>
              <RotateCcw className="w-4 h-4 mr-1" />
              রিসেট
            </Button>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label>টেক্সট আকার: {settings.fontSize}px</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Slider
                value={[settings.fontSize]}
                onValueChange={(value) => updateSetting('fontSize', value[0])}
                max={24}
                min={12}
                step={1}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 2))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label>টেক্সট ফন্ট</Label>
            <Select value={settings.fontFamily} onValueChange={(value) => updateSetting('fontFamily', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">সিস্টেম</SelectItem>
                <SelectItem value="serif">সেরিফ</SelectItem>
                <SelectItem value="sans-serif">সান্স সেরিফ</SelectItem>
                <SelectItem value="bengali">বাংলা</SelectItem>
                <SelectItem value="dyslexia">ডিসলেক্সিয়া বান্ধব</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <Label>লাইনের দূরত্ব: {settings.lineHeight}</Label>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={(value) => updateSetting('lineHeight', value[0])}
              max={2.5}
              min={1.2}
              step={0.1}
              className="flex-1"
            />
          </div>

          {/* Accessibility Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast">উচ্চ কনট্রাস্ট</Label>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion">কম অ্যানিমেশন</Label>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="dyslexia-friendly">ডিসলেক্সিয়া বান্ধব</Label>
              <Switch
                id="dyslexia-friendly"
                checked={settings.dyslexiaFriendly}
                onCheckedChange={(checked) => updateSetting('dyslexiaFriendly', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="color-blind-friendly">রঙ অন্ধত্ব বান্ধব</Label>
              <Switch
                id="color-blind-friendly"
                checked={settings.colorBlindFriendly}
                onCheckedChange={(checked) => updateSetting('colorBlindFriendly', checked)}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Reading Progress Bar
export const ReadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-muted/20 z-50">
      <div 
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Reading Time Estimator
export const ReadingTimeEstimator: React.FC<{ content: string }> = ({ content }) => {
  const wordsPerMinute = 200; // Average reading speed in Bengali
  const wordCount = content.split(' ').length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  return (
    <Badge variant="secondary" className="flex items-center space-x-1">
      <Type className="w-3 h-3" />
      <span>{readingTime} মিনিট পড়ার সময়</span>
    </Badge>
  );
};

// Article Accessibility Toolbar
export const ArticleAccessibilityToolbar: React.FC<{ 
  content: string;
  onBookmark?: () => void;
  onShare?: () => void;
}> = ({ content, onBookmark, onShare }) => {
  const [focusMode, setFocusMode] = useState(false);

  return (
    <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border p-3 z-40">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <ReadingTimeEstimator content={content} />
          <ReadingFocusMode isActive={focusMode} onToggle={() => setFocusMode(!focusMode)} />
          <TextToSpeechControls text={content} />
        </div>
        
        <div className="flex items-center space-x-3">
          <AccessibilityPanel />
          {onBookmark && (
            <Button variant="outline" size="sm" onClick={onBookmark}>
              <Badge className="w-4 h-4 mr-1" />
              সংরক্ষণ
            </Button>
          )}
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Badge className="w-4 h-4 mr-1" />
              শেয়ার
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export {
  ReadingFocusMode,
  TextToSpeechControls,
  AccessibilityPanel,
  ReadingProgressBar,
  ReadingTimeEstimator,
  ArticleAccessibilityToolbar
};