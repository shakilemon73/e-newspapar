import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Volume2, Calendar, AlertCircle } from 'lucide-react';
import { DateFormatter } from '@/components/DateFormatter';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

interface AudioArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  audio_url: string;
  duration: string;
  published_at: string;
}

export default function AudioArticles() {
  const [articles, setArticles] = useState<AudioArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use direct Supabase call instead of Express API
        const { getAudioArticles } = await import('../lib/supabase-api-direct');
        const data = await getAudioArticles();
        setArticles(data);
      } catch (err) {
        setError("অডিও আর্টিকেল লোড করতে সমস্যা হয়েছে");
        console.error('Error fetching audio articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioArticles();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">অডিও আর্টিকেল লোড করতে সমস্যা</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link href="/">
                <Button>হোম পেজে ফিরে যান</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="অডিও আর্টিকেল - Bengali News"
        description="শুনুন Bengali News-এর অডিও আর্টিকেল। গুরুত্বপূর্ণ সংবাদ শুনুন যেকোনো সময়, যেকোনো জায়গায়।"
        image="/og-image.svg"
        url="/audio-articles"
        type="website"
        keywords="audio articles, অডিও আর্টিকেল, podcast, পডকাস্ট, listen news, শোনার সংবাদ"
        tags={["audio", "অডিও", "podcast", "news", "সংবাদ"]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">সব অডিও আর্টিকেল</h1>
            <p className="text-gray-600">গুরুত্বপূর্ণ সংবাদ শুনুন যেকোনো সময়</p>
          </div>

        {articles.length === 0 ? (
          <Card className="text-center">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-2">কোন অডিও আর্টিকেল পাওয়া যায়নি</h2>
              <p className="text-gray-600">এই মুহূর্তে কোন অডিও আর্টিকেল উপলব্ধ নেই।</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/audio/${article.slug}`}>
                  <div className="relative">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <Volume2 className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {article.duration}
                    </div>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    <Link href={`/audio/${article.slug}`} className="hover:text-blue-600 transition-colors">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <DateFormatter date={article.published_at} />
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{article.duration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
}