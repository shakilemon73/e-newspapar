import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface AudioArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  audioUrl: string;
  duration: string;
  publishedAt: string;
}

export const AudioArticles = () => {
  const [articles, setArticles] = useState<AudioArticle[]>([]);
  const [currentArticle, setCurrentArticle] = useState<AudioArticle | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.75);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    const fetchAudioArticles = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would be an API call
        // For demonstration, we'll create some sample data
        const sampleArticles: AudioArticle[] = [
          {
            id: 1,
            title: 'বাংলাদেশের জনপ্রিয় কিছু লোকগল্প',
            slug: 'popular-bangladeshi-folk-tales',
            excerpt: 'বাংলাদেশের বিভিন্ন অঞ্চলের জনপ্রিয় লোকগল্প সম্পর্কে জানুন।',
            imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY0MzM5MDY4OQ&ixlib=rb-1.2.1&q=80&w=300',
            audioUrl: '/assets/audio/sample1.mp3',
            duration: '12:45',
            publishedAt: new Date().toISOString()
          },
          {
            id: 2,
            title: 'বাংলাদেশের অজানা ইতিহাস: স্বাধীনতা যুদ্ধের অজানা গল্প',
            slug: 'unknown-stories-liberation-war',
            excerpt: 'এই অডিও আর্টিকেলে স্বাধীনতা যুদ্ধের কিছু অজানা গল্প নিয়ে আলোচনা করা হয়েছে।',
            imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY0MzM5MDcwMA&ixlib=rb-1.2.1&q=80&w=300',
            audioUrl: '/assets/audio/sample2.mp3',
            duration: '15:20',
            publishedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          },
          {
            id: 3,
            title: 'বাংলা সাহিত্যের সেরা উপন্যাসঃ একটি পর্যালোচনা',
            slug: 'best-bengali-literature-review',
            excerpt: 'বাংলা সাহিত্যের সেরা কিছু উপন্যাস এবং তাদের লেখকদের সম্পর্কে আলোচনা।',
            imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY0MzM5MDcxMA&ixlib=rb-1.2.1&q=80&w=300',
            audioUrl: '/assets/audio/sample3.mp3',
            duration: '18:10',
            publishedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
          },
          {
            id: 4,
            title: 'জলবায়ু পরিবর্তন এবং বাংলাদেশের ভবিষ্যৎ',
            slug: 'climate-change-and-bangladesh-future',
            excerpt: 'জলবায়ু পরিবর্তনের ফলে বাংলাদেশের ওপর যে প্রভাব পড়বে তা নিয়ে বিস্তারিত আলোচনা।',
            imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY0MzM5MDcyMA&ixlib=rb-1.2.1&q=80&w=300',
            audioUrl: '/assets/audio/sample4.mp3',
            duration: '21:05',
            publishedAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
          }
        ];
        
        setArticles(sampleArticles);
        setCurrentArticle(sampleArticles[0]);
        setError(null);
      } catch (err) {
        setError('অডিও আর্টিকেল লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching audio articles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudioArticles();
  }, []);

  useEffect(() => {
    // Update the audio element when the current article changes
    if (audioRef.current && currentArticle) {
      audioRef.current.pause();
      audioRef.current.src = currentArticle.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play()
          .catch(error => {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
          });
      }
    }
  }, [currentArticle]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play()
          .catch(error => {
            console.error('Error playing audio:', error);
          });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const playArticle = (article: AudioArticle) => {
    setCurrentArticle(article);
    setIsPlaying(true);
  };

  const playNextArticle = () => {
    if (currentArticle && articles.length > 0) {
      const currentIndex = articles.findIndex(article => article.id === currentArticle.id);
      const nextIndex = (currentIndex + 1) % articles.length;
      setCurrentArticle(articles[nextIndex]);
    }
  };

  const playPreviousArticle = () => {
    if (currentArticle && articles.length > 0) {
      const currentIndex = articles.findIndex(article => article.id === currentArticle.id);
      const prevIndex = (currentIndex - 1 + articles.length) % articles.length;
      setCurrentArticle(articles[prevIndex]);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-border pb-2">অডিও আর্টিকেল</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentArticle || articles.length === 0) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-border pb-2">অডিও আর্টিকেল</h3>
        <p className="text-center py-8">{error || 'কোন অডিও আর্টিকেল পাওয়া যায়নি'}</p>
      </div>
    );
  }

  return (
    <div className="bg-card dark:bg-card rounded shadow-sm p-4">
      <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
        <h3 className="text-lg font-bold font-hind">অডিও আর্টিকেল</h3>
        <Link href="/audio-articles" className="text-accent text-sm hover:underline">
          সব অডিও <i className="fas fa-angle-right ml-1"></i>
        </Link>
      </div>
      
      <div className="mb-6">
        {/* Current Playing Article */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-1/3">
            <img 
              src={currentArticle.imageUrl} 
              alt={currentArticle.title} 
              className="w-full h-auto rounded"
            />
          </div>
          <div className="w-full md:w-2/3">
            <h4 className="font-bold text-lg mb-2 font-hind">
              <Link href={`/audio/${currentArticle.slug}`} className="hover:text-accent transition">
                {currentArticle.title}
              </Link>
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {currentArticle.excerpt}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {getRelativeTimeInBengali(currentArticle.publishedAt)}
            </div>
          </div>
        </div>
        
        {/* Audio Player */}
        <div className="bg-muted/30 dark:bg-muted rounded-lg p-3 mt-3">
          <audio 
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={playNextArticle}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
          
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={playPreviousArticle}
                className="p-2 rounded-full hover:bg-muted/50 transition"
                aria-label="Previous article"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button
                onClick={togglePlayPause}
                className="p-3 bg-accent text-white rounded-full hover:bg-accent/90 transition"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              
              <button
                onClick={playNextArticle}
                className="p-2 rounded-full hover:bg-muted/50 transition"
                aria-label="Next article"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* More Audio Articles */}
      <h4 className="font-bold mb-3 font-hind border-b border-border pb-2">আরও অডিও আর্টিকেল</h4>
      <div className="space-y-3">
        {articles.filter(article => article.id !== currentArticle.id).map((article) => (
          <div key={article.id} className="flex gap-3 hover:bg-muted/30 p-2 rounded transition cursor-pointer" onClick={() => playArticle(article)}>
            <div className="flex-shrink-0">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-16 h-16 object-cover rounded"
              />
            </div>
            <div>
              <h5 className="font-medium mb-1 text-sm font-hind">{article.title}</h5>
              <div className="flex text-xs text-gray-500 dark:text-gray-400">
                <span className="mr-2">{article.duration}</span>
                <span>{getRelativeTimeInBengali(article.publishedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-6">
        <Link 
          href="/audio-articles" 
          className="inline-block bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded text-sm transition"
        >
          সব অডিও আর্টিকেল দেখুন
        </Link>
      </div>
    </div>
  );
};

export default AudioArticles;