import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Share2, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Bookmark,
  Play,
  Pause,
  Volume2,
  Moon,
  Sun,
  Grid3X3,
  List,
  Calendar,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  ExternalLink,
  Maximize2,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface EPaper {
  id: number;
  title: string;
  publish_date: string;
  pdf_url: string;
  image_url?: string;
  is_latest: boolean;
  created_at: string;
  view_count?: number;
}

interface ViewerSettings {
  darkMode: boolean;
  zoomLevel: number;
  autoRead: boolean;
  showThumbnails: boolean;
  viewMode: 'single' | 'spread' | 'scroll';
  readingSpeed: number;
}

const AdvancedEPaperViewer = () => {
  const { toast } = useToast();
  const [epapers, setEpapers] = useState<EPaper[]>([]);
  const [selectedEPaper, setSelectedEPaper] = useState<EPaper | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [settings, setSettings] = useState<ViewerSettings>({
    darkMode: false,
    zoomLevel: 100,
    autoRead: false,
    showThumbnails: true,
    viewMode: 'single',
    readingSpeed: 150
  });
  const [savedEPapers, setSavedEPapers] = useState<Set<number>>(new Set());
  const [isReading, setIsReading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const viewerRef = useRef<HTMLDivElement>(null);

  // Load e-papers from Supabase
  useEffect(() => {
    fetchEPapers();
  }, []);

  const fetchEPapers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('epapers')
        .select('*')
        .order('publish_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEpapers(data || []);
      
      // Auto-select latest e-paper
      if (data && data.length > 0) {
        setSelectedEPaper(data[0]);
      }
    } catch (error) {
      console.error('Error fetching e-papers:', error);
      toast({
        title: "ত্রুটি",
        description: "ই-পেপার লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter e-papers based on search and date
  const filteredEPapers = epapers.filter(epaper => {
    const matchesSearch = epaper.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || epaper.publish_date.startsWith(selectedDate);
    return matchesSearch && matchesDate;
  });

  // Handle e-paper selection
  const handleEPaperSelect = async (epaper: EPaper) => {
    setSelectedEPaper(epaper);
    setCurrentPage(1);
    
    // Track view
    try {
      await supabase
        .from('epapers')
        .update({ view_count: (epaper.view_count || 0) + 1 })
        .eq('id', epaper.id);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = (epaperId: number) => {
    setSavedEPapers(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(epaperId)) {
        newSaved.delete(epaperId);
        toast({
          title: "বুকমার্ক সরানো হয়েছে",
          description: "ই-পেপার বুকমার্ক থেকে সরানো হয়েছে",
        });
      } else {
        newSaved.add(epaperId);
        toast({
          title: "বুকমার্ক যোগ করা হয়েছে",
          description: "ই-পেপার বুকমার্কে সংরক্ষিত হয়েছে",
        });
      }
      return newSaved;
    });
  };

  // Handle sharing
  const handleShare = async (epaper: EPaper) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: epaper.title,
          text: `${epaper.title} - Bengali News E-Paper`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "লিঙ্ক কপি হয়েছে",
        description: "ই-পেপারের লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে",
      });
    }
  };

  // Handle auto-read toggle
  const toggleAutoRead = () => {
    setIsReading(!isReading);
    setSettings(prev => ({ ...prev, autoRead: !isReading }));
    
    if (!isReading) {
      toast({
        title: "অটো রিডিং শুরু",
        description: "ই-পেপার স্বয়ংক্রিয়ভাবে পড়া হবে",
      });
    }
  };

  // Handle download
  const handleDownload = (epaper: EPaper) => {
    if (epaper.pdf_url) {
      const link = document.createElement('a');
      link.href = epaper.pdf_url;
      link.download = `${epaper.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "ডাউনলোড শুরু",
        description: "ই-পেপার ডাউনলোড হচ্ছে",
      });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${settings.darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ই-পেপার
              </h1>
              <nav className="hidden md:flex items-center space-x-6">
                <Button variant="ghost" size="sm">আজকের সংস্করণ</Button>
                <Button variant="ghost" size="sm">আর্কাইভ</Button>
                <Button variant="ghost" size="sm">জনপ্রিয়</Button>
              </nav>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ই-পেপার খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              >
                {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, showThumbnails: !prev.showThumbnails }))}
              >
                {settings.showThumbnails ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
              
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: E-Paper List */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>সংস্করণসমূহ</span>
                  <Badge variant="secondary">{filteredEPapers.length}</Badge>
                </CardTitle>
                <CardDescription>
                  সব ই-পেপার সংস্করণ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredEPapers.map((epaper) => (
                      <Card
                        key={epaper.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedEPaper?.id === epaper.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => handleEPaperSelect(epaper)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm line-clamp-2">
                                {epaper.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(epaper.publish_date), 'PPP', { locale: bn })}
                              </p>
                              {epaper.is_latest && (
                                <Badge variant="default" className="mt-1 text-xs">
                                  সর্বশেষ
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookmark(epaper.id);
                                }}
                              >
                                <Bookmark 
                                  className={`h-4 w-4 ${
                                    savedEPapers.has(epaper.id) ? 'fill-current text-yellow-500' : ''
                                  }`} 
                                />
                              </Button>
                              {epaper.view_count && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {epaper.view_count}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Viewer */}
          <div className="lg:col-span-3">
            {selectedEPaper ? (
              <Card className="h-fit">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {selectedEPaper.title}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(selectedEPaper.publish_date), 'PPPP', { locale: bn })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(selectedEPaper)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        ডাউনলোড
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(selectedEPaper)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        শেয়ার
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Viewer Controls */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSettings(prev => ({ 
                            ...prev, 
                            zoomLevel: Math.max(50, prev.zoomLevel - 25) 
                          }))}
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium w-12 text-center">
                          {settings.zoomLevel}%
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSettings(prev => ({ 
                            ...prev, 
                            zoomLevel: Math.min(200, prev.zoomLevel + 25) 
                          }))}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Separator orientation="vertical" className="h-6" />
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={isReading ? "default" : "outline"}
                          size="sm"
                          onClick={toggleAutoRead}
                        >
                          {isReading ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <span className="text-sm">অটো রিড</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium px-3">
                        পৃষ্ঠা {currentPage}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* PDF Viewer */}
                  <div 
                    ref={viewerRef}
                    className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900"
                    style={{ height: '800px' }}
                  >
                    {selectedEPaper.pdf_url ? (
                      <iframe
                        src={`${selectedEPaper.pdf_url}#page=${currentPage}&zoom=${settings.zoomLevel}`}
                        className="w-full h-full"
                        title={selectedEPaper.title}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-muted-foreground">PDF ফাইল উপলব্ধ নেই</p>
                          <Button 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => window.open(selectedEPaper.image_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            বিকল্প দেখুন
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reader Feedback */}
                  <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4 mr-1" />
                          পছন্দ
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          মন্তব্য
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedEPaper.view_count || 0} বার দেখা হয়েছে
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">ই-পেপার নির্বাচন করুন</h3>
                    <p className="text-muted-foreground">
                      বাম পাশের তালিকা থেকে একটি ই-পেপার নির্বাচন করুন
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedEPaperViewer;