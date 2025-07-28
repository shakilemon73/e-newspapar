import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Play, Clock, Eye, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from './VideoPlayer';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';

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
  category?: {
    name: string;
    slug: string;
  };
}

interface VideoGridProps {
  title?: string;
  categorySlug?: string;
  limit?: number;
  showPlayer?: boolean;
  className?: string;
}

export function VideoGrid({ 
  title = "ভিডিও কন্টেন্ট", 
  categorySlug, 
  limit = 6,
  showPlayer = false,
  className = '' 
}: VideoGridProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<VideoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        
        // Import Supabase client and fetch videos
        const { supabase } = await import('@/lib/supabase');
        
        let query = supabase
          .from('video_content')
          .select(`
            id, title, slug, description, thumbnail_url, video_url,
            duration, published_at, view_count,
            categories!inner(name, slug)
          `)
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        // Filter by category if specified
        if (categorySlug) {
          query = query.eq('categories.slug', categorySlug);
        }

        // Apply limit
        if (limit) {
          query = query.limit(limit + 1); // +1 for featured video
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw new Error('ভিডিও লোড করতে সমস্যা হয়েছে');
        }

        if (data && data.length > 0) {
          // Convert data to VideoItem format
          const videoItems: VideoItem[] = data.map(video => ({
            id: video.id,
            title: video.title,
            slug: video.slug,
            description: video.description || '',
            thumbnail_url: video.thumbnail_url || '/placeholder-video-thumbnail.jpg',
            video_url: video.video_url,
            duration: video.duration || '0:00',
            published_at: video.published_at,
            view_count: video.view_count || 0,
            category: video.categories
          }));

          // Set featured video (first one) and rest
          setFeaturedVideo(videoItems[0]);
          setVideos(videoItems.slice(1));
        } else {
          setVideos([]);
          setFeaturedVideo(null);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError(err instanceof Error ? err.message : 'ভিডিও লোড করতে সমস্যা হয়েছে');
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [categorySlug, limit]);

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M দর্শন`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K দর্শন`;
    }
    return `${count} দর্শন`;
  };

  const handleVideoSelect = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const VideoCard = ({ video, featured = false }: { video: VideoItem; featured?: boolean }) => (
    <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-lg ${featured ? 'md:col-span-2' : ''}`}>
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button
                onClick={() => showPlayer ? handleVideoSelect(video) : null}
                size="lg"
                variant="secondary"
                className="h-14 w-14 rounded-full bg-white/90 hover:bg-white"
                asChild={!showPlayer}
              >
                {showPlayer ? (
                  <Play className="h-6 w-6 text-accent ml-1" />
                ) : (
                  <Link href={`/video/${video.slug}`}>
                    <Play className="h-6 w-6 text-accent ml-1" />
                  </Link>
                )}
              </Button>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {video.duration}
            </div>

            {/* Category Badge */}
            {video.category && (
              <div className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">
                {video.category.name}
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className={`font-bold mb-2 line-clamp-2 ${featured ? 'text-xl' : 'text-lg'}`}>
              <Link 
                href={`/video/${video.slug}`} 
                className="hover:text-accent transition-colors"
              >
                {video.title}
              </Link>
            </h3>

            {featured && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {video.description}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {getRelativeTimeInBengali(video.published_at)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatViewCount(video.view_count)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!featuredVideo && videos.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">কোন ভিডিও পাওয়া যায়নি</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href="/videos" className="text-accent hover:underline">
          সব ভিডিও দেখুন →
        </Link>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && showPlayer && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="mb-4 flex justify-end">
              <Button
                onClick={() => setSelectedVideo(null)}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                ✕ বন্ধ করুন
              </Button>
            </div>
            <VideoPlayer
              videoUrl={selectedVideo.video_url}
              title={selectedVideo.title}
              thumbnail={selectedVideo.thumbnail_url}
              autoPlay={true}
            />
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredVideo && (
          <VideoCard video={featuredVideo} featured={true} />
        )}
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}