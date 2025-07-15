import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Play, Pause, Volume2, AlertCircle } from "lucide-react";
import { DateFormatter } from "@/components/DateFormatter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface AudioArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  audio_url: string;
  duration: string;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export default function AudioDetail() {
  const { slug } = useParams();
  const [audio, setAudio] = useState<AudioArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/audio-articles/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("অডিও আর্টিকেল পাওয়া যায়নি");
            return;
          }
          throw new Error('Failed to fetch audio article');
        }
        
        const data = await response.json();
        setAudio(data);
      } catch (err) {
        setError("অডিও আর্টিকেল লোড করতে সমস্যা হয়েছে");
        console.error('Error fetching audio article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchAudio();
    }
  }, [slug]);

  const togglePlayPause = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64 mb-6"></div>
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
              <h2 className="text-2xl font-bold mb-2">অডিও আর্টিকেল পাওয়া যায়নি</h2>
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

  if (!audio) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-0">
            {/* Audio Cover Image */}
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
              <img
                src={audio.image_url}
                alt={audio.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <button
                  onClick={togglePlayPause}
                  className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-6 hover:bg-opacity-30 transition-all duration-300"
                >
                  {isPlaying ? (
                    <Pause className="h-12 w-12 text-white" />
                  ) : (
                    <Play className="h-12 w-12 text-white ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Audio Info */}
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{audio.title}</h1>
              
              {/* Audio Meta */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <DateFormatter date={audio.published_at} />
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{audio.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Volume2 className="h-4 w-4" />
                  <span>অডিও আর্টিকেল</span>
                </div>
              </div>

              {/* Audio Player */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <audio
                  ref={setAudioRef}
                  controls
                  className="w-full"
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src={audio.audio_url} type="audio/mpeg" />
                  আপনার ব্রাউজার অডিও সাপোর্ট করে না।
                </audio>
              </div>

              {/* Audio Description */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {audio.excerpt}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Audio Articles */}
        <div className="mt-8 text-center">
          <Link href="/#audio">
            <Button variant="outline">
              আরও অডিও আর্টিকেল শুনুন
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}