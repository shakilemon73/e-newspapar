import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ReadingHistoryItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  category: Category;
  last_read_at: string;
  read_count: number;
}

const ReadingHistory = () => {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      setLocation('/auth');
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchReadingHistory = async () => {
      try {
        setLoading(true);
        
        // Get the session token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('আপনি লগইন অবস্থায় নেই');
          return;
        }
        
        const token = session.access_token;
        
        // Fetch reading history
        const response = await fetch('/api/reading-history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('পড়ার ইতিহাস লোড করতে সমস্যা হয়েছে');
        }
        
        const data = await response.json();
        setHistory(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'পড়ার ইতিহাস লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching reading history:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchReadingHistory();
    }
  }, [user]);

  const getRelativeTimeInBengali = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const distance = formatDistanceToNow(date, { addSuffix: true });
      
      // Convert English numbers to Bengali
      return distance.replace(/\d+/g, (match) => {
        const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return match.split('').map(digit => {
          const num = parseInt(digit);
          return isNaN(num) ? digit : bengaliNumerals[num];
        }).join('');
      });
    } catch (e) {
      return 'অজানা সময়';
    }
  };

  const getReadCountInBengali = (count: number) => {
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return count.toString().split('').map(digit => bengaliNumerals[parseInt(digit)]).join('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>পড়ার ইতিহাস | প্রথম আলো</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 font-hind">পড়ার ইতিহাস</h1>
          
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
              {error}
            </div>
          ) : null}
          
          {history.length === 0 && !error ? (
            <div className="bg-muted/30 p-8 rounded-lg text-center">
              <h3 className="text-xl mb-2 font-hind">কোন পড়ার ইতিহাস নেই</h3>
              <p className="mb-4 text-muted-foreground">
                আপনি এখনও কোন আর্টিকেল পড়েননি। আর্টিকেল পড়ার পর এই পাতায় তা দেখাবে।
              </p>
              <Button asChild>
                <Link href="/">নতুন আর্টিকেল দেখুন</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="recent">সম্প্রতি পড়েছেন</TabsTrigger>
                  <TabsTrigger value="mostread">বেশি পড়েছেন</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recent" className="space-y-4">
                  {history
                    .sort((a, b) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime())
                    .map((item) => (
                      <HistoryCard key={item.id} item={item} />
                    ))}
                </TabsContent>
                
                <TabsContent value="mostread" className="space-y-4">
                  {history
                    .sort((a, b) => b.read_count - a.read_count)
                    .map((item) => (
                      <HistoryCard key={item.id} item={item} />
                    ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const HistoryCard = ({ item }: { item: ReadingHistoryItem }) => {
  const getRelativeTimeInBengali = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const distance = formatDistanceToNow(date, { addSuffix: true });
      
      // Convert English numbers to Bengali
      return distance.replace(/\d+/g, (match) => {
        const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return match.split('').map(digit => {
          const num = parseInt(digit);
          return isNaN(num) ? digit : bengaliNumerals[num];
        }).join('');
      });
    } catch (e) {
      return 'অজানা সময়';
    }
  };

  const getReadCountInBengali = (count: number) => {
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return count.toString().split('').map(digit => bengaliNumerals[parseInt(digit)]).join('');
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-40 md:h-full object-cover"
          />
        </div>
        <div className="md:w-3/4 p-4 md:p-6 flex flex-col">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <Link
                href={`/category/${item.category.slug}`}
                className="text-sm font-medium text-accent hover:underline mb-1 inline-block"
              >
                {item.category.name}
              </Link>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{getRelativeTimeInBengali(item.last_read_at)}</span>
              </div>
            </div>
            <CardTitle className="text-xl">
              <Link
                href={`/article/${item.slug}`}
                className="hover:text-accent transition-colors"
              >
                {item.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 py-2 flex-grow">
            <p className="text-muted-foreground line-clamp-2">
              {item.excerpt}
            </p>
          </CardContent>
          <CardFooter className="p-0 pt-2 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {item.read_count > 1 
                ? `${getReadCountInBengali(item.read_count)} বার পড়েছেন` 
                : 'একবার পড়েছেন'}
            </span>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/article/${item.slug}`}>
                আবার পড়ুন
              </Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default ReadingHistory;