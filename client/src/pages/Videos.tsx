import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Calendar, AlertCircle } from 'lucide-react';
import { DateFormatter } from '@/components/DateFormatter';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

interface VideoItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: string;
  published_at: string;
  view_count: number;
}

export default function Videos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { getVideoContent } = await import('../lib/supabase-api-direct');
        const data = await getVideoContent();
        setVideos(data);
      } catch (err) {
        setError("ভিডিও লোড করতে সমস্যা হয়েছে");
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

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
              <h2 className="text-2xl font-bold mb-2">ভিডিও লোড করতে সমস্যা</h2>
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
        title="ভিডিও সংবাদ - Bengali News"
        description="দেখুন সর্বশেষ ভিডিও সংবাদ ও গুরুত্বপূর্ণ ঘটনাগুলোর ভিডিও Bengali News-এ। Video news from Bangladesh."
        image="/og-video.svg"
        url="/videos"
        type="website"
        keywords="video news, ভিডিও সংবাদ, Bangladesh video news, bengali video"
        tags={["video", "news", "ভিডিও", "Bangladesh"]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">সব ভিডিও</h1>
            <p className="text-gray-600">সবচেয়ে গুরুত্বপূর্ণ ঘটনাগুলোর ভিডিও দেখুন</p>
          </div>

        {videos.length === 0 ? (
          <Card className="text-center">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-2">কোন ভিডিও পাওয়া যায়নি</h2>
              <p className="text-gray-600">এই মুহূর্তে কোন ভিডিও উপলব্ধ নেই।</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/video/${video.slug}`}>
                  <div className="relative">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    <Link href={`/video/${video.slug}`} className="hover:text-blue-600 transition-colors">
                      {video.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <DateFormatter date={video.published_at} />
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{formatViewCount(video.view_count || 0)} দেখা হয়েছে</span>
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