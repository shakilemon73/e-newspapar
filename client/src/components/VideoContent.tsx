import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';
import { VideoContent as VideoContentType } from '@/../../shared/supabase-types';

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

export const VideoContent = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<VideoItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        
        // Fetch videos from Supabase API
        const response = await fetch('/api/videos?limit=5');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        
        const data: any[] = await response.json();
        
        if (data && data.length > 0) {
          // Convert to VideoItem format for component compatibility
          const videoItems: VideoItem[] = data.map(video => ({
            id: video.id,
            title: video.title,
            slug: video.slug,
            description: video.description || '',
            thumbnail_url: video.thumbnail_url || 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
            video_url: video.video_url,
            duration: video.duration || '0:00',
            published_at: video.published_at,
            view_count: video.view_count || 0
          }));
          
          // Set the first video as featured
          setFeaturedVideo(videoItems[0]);
          
          // Rest of the videos
          setVideos(videoItems.slice(1));
        }
        
        setError(null);
      } catch (err) {
        setError('ভিডিও লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching videos:', err);
      } finally {
        setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-border pb-2">ভিডিও</h3>
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 dark:bg-gray-700 h-64 md:h-96 rounded"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !featuredVideo || videos.length === 0) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-border pb-2">ভিডিও</h3>
        <p className="text-center py-8">{error || 'কোন ভিডিও পাওয়া যায়নি'}</p>
      </div>
    );
  }

  return (
    <div className="bg-card dark:bg-card rounded shadow-sm p-4">
      <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
        <h3 className="text-lg font-bold font-hind">ভিডিও</h3>
        <Link href="/videos" className="text-accent text-sm hover:underline">
          সব ভিডিও <i className="fas fa-angle-right ml-1"></i>
        </Link>
      </div>
      
      {/* Featured Video */}
      <div className="mb-6">
        <div className="relative pb-16:9 h-0 overflow-hidden rounded mb-3">
          <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src={featuredVideo.video_url}
            title={featuredVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <h4 className="font-bold text-lg mb-1 font-hind">
          <Link href={`/video/${featuredVideo.slug}`} className="hover:text-accent transition">
            {featuredVideo.title}
          </Link>
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {featuredVideo.description}
        </p>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center mr-3">
            <i className="far fa-clock mr-1"></i> {featuredVideo.duration}
          </span>
          <span className="flex items-center mr-3">
            <i className="far fa-eye mr-1"></i> {formatViewCount(featuredVideo.view_count || 0)} দেখা হয়েছে
          </span>
          <span>{getRelativeTimeInBengali(featuredVideo.published_at)}</span>
        </div>
      </div>
      
      {/* More Videos */}
      <h4 className="font-bold mb-3 font-hind border-b border-border pb-2">আরও ভিডিও</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="rounded overflow-hidden">
            <Link href={`/video/${video.slug}`} className="block">
              <div className="relative">
                <img 
                  src={video.thumbnail_url} 
                  alt={video.title} 
                  className="w-full h-32 object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
            </Link>
            <div className="p-2">
              <h5 className="font-medium text-sm mb-1 font-hind line-clamp-2">
                <Link href={`/video/${video.slug}`} className="hover:text-accent transition">
                  {video.title}
                </Link>
              </h5>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center mr-2">
                  <i className="far fa-eye mr-1"></i> {formatViewCount(video.view_count || 0)}
                </span>
                <span>{getRelativeTimeInBengali(video.published_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-6">
        <Link 
          href="/videos" 
          className="inline-block bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded text-sm transition"
        >
          সব ভিডিও দেখুন
        </Link>
      </div>
    </div>
  );
};

export default VideoContent;