import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Calendar, AlertCircle } from "lucide-react";
import { DateFormatter } from "@/components/DateFormatter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface VideoContent {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: string;
  view_count: number;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export default function VideoDetail() {
  const { slug } = useParams();
  const [video, setVideo] = useState<VideoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/videos/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("ভিডিও পাওয়া যায়নি");
            return;
          }
          throw new Error('Failed to fetch video');
        }
        
        const data = await response.json();
        setVideo(data);
      } catch (err) {
        setError("ভিডিও লোড করতে সমস্যা হয়েছে");
        console.error('Error fetching video:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchVideo();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64 md:h-96 mb-6"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
              <h2 className="text-2xl font-bold mb-2">ভিডিও পাওয়া যায়নি</h2>
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

  if (!video) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-0">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
              <video
                className="w-full h-full object-cover"
                controls
                poster={video.thumbnail_url}
                preload="metadata"
              >
                <source src={video.video_url} type="video/mp4" />
                আপনার ব্রাউজার ভিডিও সাপোর্ট করে না।
              </video>
            </div>

            {/* Video Info */}
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
              
              {/* Video Meta */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <DateFormatter date={video.published_at} />
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{video.view_count.toLocaleString()} বার দেখা হয়েছে</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{video.duration}</span>
                </div>
              </div>

              {/* Video Description */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Videos */}
        <div className="mt-8 text-center">
          <Link href="/#videos">
            <Button variant="outline">
              আরও ভিডিও দেখুন
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}