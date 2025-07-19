import React, { useState, useEffect } from 'react';
import { Bell, BookOpen, Clock, TrendingUp, Star, Heart, MessageCircle, Share2, Eye, Users, Calendar, Filter, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// Enhanced Article Card with UX improvements
interface EnhancedArticleCardProps {
  article: {
    id: number;
    title: string;
    excerpt: string;
    image_url: string;
    published_at: string;
    category_name: string;
    view_count?: number;
    reading_time?: number;
    engagement_score?: number;
  };
  showEngagement?: boolean;
  showReadingTime?: boolean;
  compact?: boolean;
}

export const EnhancedArticleCard: React.FC<EnhancedArticleCardProps> = ({ 
  article, 
  showEngagement = false, 
  showReadingTime = true,
  compact = false 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    setShareCount(prev => prev + 1);
    // Implement share functionality
  };

  return (
    <Card className={`group hover:shadow-md transition-all duration-200 ${compact ? 'p-3' : 'p-4'}`}>
      <div className={`flex ${compact ? 'space-x-3' : 'space-x-4'}`}>
        {/* Image */}
        <div className={`flex-shrink-0 ${compact ? 'w-20 h-20' : 'w-24 h-24'}`}>
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {article.category_name}
            </Badge>
            {showEngagement && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                <span>{article.view_count || 0}</span>
              </div>
            )}
          </div>

          <h3 className={`font-semibold text-foreground group-hover:text-primary transition-colors ${compact ? 'text-sm' : 'text-base'} line-clamp-2`}>
            {article.title}
          </h3>

          {!compact && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {article.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(article.published_at).toLocaleDateString('bn-BD')}
              </span>
              {showReadingTime && (
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {article.reading_time || 5} মিনিট
                </span>
              )}
            </div>

            {/* Engagement Actions */}
            {showEngagement && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`p-1 h-auto ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={`p-1 h-auto ${isBookmarked ? 'text-blue-500' : 'text-muted-foreground'}`}
                >
                  <BookOpen className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="p-1 h-auto text-muted-foreground"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Enhanced Content Discovery Widget
export const ContentDiscoveryWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trending');
  
  // Fetch trending topics from API
  const { data: trendingTopics = [] } = useQuery({
    queryKey: ['/api/trending-topics'],
    queryFn: () => fetch('/api/trending-topics?limit=5').then(res => res.json()),
  });

  // Fetch popular authors from API
  const { data: popularAuthors = [] } = useQuery({
    queryKey: ['/api/popular-authors'],
    queryFn: () => fetch('/api/popular-authors?limit=3').then(res => res.json()),
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          আবিষ্কার করুন
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trending">ট্রেন্ডিং</TabsTrigger>
            <TabsTrigger value="authors">লেখক</TabsTrigger>
            <TabsTrigger value="topics">বিষয়</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending" className="space-y-3">
            {trendingTopics.map((topic: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-accent/10 rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{topic.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {topic.count}
                  </Badge>
                </div>
                <div className="flex items-center">
                  {topic.growth > 15 && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {topic.growth < 5 && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                  {topic.growth >= 5 && topic.growth <= 15 && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="authors" className="space-y-3">
            {popularAuthors.map((author, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-accent/10 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{author.name}</p>
                    <p className="text-xs text-muted-foreground">{author.articles} টি নিবন্ধ</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{author.followers}</span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="topics" className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {['রাজনীতি', 'খেলা', 'বিনোদন', 'প্রযুক্তি', 'স্বাস্থ্য', 'শিক্ষা'].map((topic) => (
                <Button key={topic} variant="outline" size="sm" className="justify-start">
                  {topic}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Enhanced Reading Progress Indicator
export const ReadingProgressIndicator: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-background/20">
      <div 
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Enhanced User Engagement Panel
export const UserEngagementPanel: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState('medium');

  const engagementStats = {
    articlesRead: 47,
    timeSpent: 125, // minutes
    streak: 12, // days
    achievements: 3
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="w-5 h-5 mr-2" />
          আপনার পড়ার পরিসংখ্যান
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reading Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{engagementStats.articlesRead}</div>
            <div className="text-sm text-muted-foreground">পড়া নিবন্ধ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{engagementStats.timeSpent}</div>
            <div className="text-sm text-muted-foreground">মিনিট</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{engagementStats.streak}</div>
            <div className="text-sm text-muted-foreground">দিনের ধারা</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{engagementStats.achievements}</div>
            <div className="text-sm text-muted-foreground">অর্জন</div>
          </div>
        </div>

        <Separator />

        {/* Reading Preferences */}
        <div className="space-y-4">
          <h4 className="font-semibold">পড়ার পছন্দ</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">বিজ্ঞপ্তি</Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="autoplay">অটো-প্লে</Label>
              <Switch
                id="autoplay"
                checked={autoPlay}
                onCheckedChange={setAutoPlay}
              />
            </div>
            
            <div className="space-y-2">
              <Label>পড়ার গতি</Label>
              <Select value={readingSpeed} onValueChange={setReadingSpeed}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">ধীর</SelectItem>
                  <SelectItem value="medium">মধ্যম</SelectItem>
                  <SelectItem value="fast">দ্রুত</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>সাপ্তাহিক লক্ষ্য</Label>
            <span className="text-sm text-muted-foreground">15/20 নিবন্ধ</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Article Actions Bar
export const ArticleActionsBar: React.FC<{ articleId: number }> = ({ articleId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-40">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <Button
            variant={isLiked ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className="flex items-center space-x-2"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>পছন্দ</span>
          </Button>
          
          <Button
            variant={isBookmarked ? "default" : "outline"}
            size="sm"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="flex items-center space-x-2"
          >
            <BookOpen className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>সংরক্ষণ</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>মন্তব্য</span>
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Share2 className="w-4 h-4" />
          <span>শেয়ার</span>
        </Button>
      </div>
    </div>
  );
};

// Enhanced Filter Panel
export const EnhancedFilterPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState('week');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            ফিল্টার
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>তারিখ পরিসীমা</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">আজ</SelectItem>
                <SelectItem value="week">এই সপ্তাহ</SelectItem>
                <SelectItem value="month">এই মাস</SelectItem>
                <SelectItem value="year">এই বছর</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>বিভাগ</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব বিভাগ</SelectItem>
                <SelectItem value="politics">রাজনীতি</SelectItem>
                <SelectItem value="sports">খেলা</SelectItem>
                <SelectItem value="international">আন্তর্জাতিক</SelectItem>
                <SelectItem value="economy">অর্থনীতি</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>সাজানো</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">সর্বশেষ</SelectItem>
                <SelectItem value="popular">জনপ্রিয়</SelectItem>
                <SelectItem value="trending">ট্রেন্ডিং</SelectItem>
                <SelectItem value="most-read">সবচেয়ে পড়া</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Components are already exported individually above