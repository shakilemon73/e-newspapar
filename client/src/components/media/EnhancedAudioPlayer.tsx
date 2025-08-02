import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Repeat,
  Shuffle,
  Download,
  Share2,
  Loader2,
  Headphones,
  Music
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface EnhancedAudioPlayerProps {
  audioUrl: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  duration?: string;
  autoPlay?: boolean;
  showPlaylist?: boolean;
  compact?: boolean;
  className?: string;
}

export function EnhancedAudioPlayer({ 
  audioUrl, 
  title, 
  excerpt,
  imageUrl, 
  duration, 
  autoPlay = false,
  showPlaylist = false,
  compact = false,
  className = '' 
}: EnhancedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Update buffered amount
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const bufferedPercentage = (bufferedEnd / audio.duration) * 100;
        setBuffered(bufferedPercentage);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      setError('অডিও ফাইল লোড করতে সমস্যা হয়েছে');
      setLoading(false);
    };

    const handleCanPlay = () => {
      setLoading(false);
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [isRepeat]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        setError('অডিও চালাতে সমস্যা হয়েছে');
      });
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const seekTime = (value[0] / 100) * audioDuration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = value[0] / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  };

  const changePlaybackRate = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '০:০০';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${toBengaliNumber(minutes)}:${toBengaliNumber(seconds).padStart(2, '০')}`;
  };

  const toBengaliNumber = (num: number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
  };

  const getProgress = (): number => {
    if (audioDuration === 0) return 0;
    return (currentTime / audioDuration) * 100;
  };

  // Compact player for small spaces
  if (compact) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/30 rounded-lg overflow-hidden relative">
                {imageUrl ? (
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-accent" />
                  </div>
                )}
                
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-1">{title}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <Button
                  onClick={togglePlayPause}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={loading || !!error}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <div className="flex-1">
                  <Slider
                    value={[getProgress()]}
                    onValueChange={handleSeek}
                    max={100}
                    step={0.1}
                    className="w-full [&>*]:h-1"
                    disabled={loading || !!error}
                  />
                </div>
                
                <span className="text-xs text-muted-foreground min-w-max">
                  {formatTime(currentTime)} / {formatTime(audioDuration)}
                </span>
              </div>
            </div>
          </div>
          
          <audio ref={audioRef} autoPlay={autoPlay} preload="metadata">
            <source src={audioUrl} type="audio/mpeg" />
            <source src={audioUrl} type="audio/wav" />
            <source src={audioUrl} type="audio/ogg" />
            আপনার ব্রাউজার অডিও সাপোর্ট করে না।
          </audio>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 dark:from-accent/10 dark:to-accent/20">
          <audio ref={audioRef} autoPlay={autoPlay} preload="metadata">
            <source src={audioUrl} type="audio/mpeg" />
            <source src={audioUrl} type="audio/wav" />
            <source src={audioUrl} type="audio/ogg" />
            আপনার ব্রাউজার অডিও সাপোর্ট করে না।
          </audio>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/30 rounded-xl overflow-hidden relative">
                  {imageUrl ? (
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Headphones className="w-10 h-10 text-accent" />
                    </div>
                  )}
                  
                  {loading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg line-clamp-2 mb-1">{title}</h3>
                {excerpt && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{excerpt}</p>
                )}
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    <Headphones className="w-3 h-3 mr-1" />
                    অডিও আর্টিকেল
                  </Badge>
                  {duration && (
                    <Badge variant="outline" className="text-xs">
                      {duration}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-center">
                <p className="text-sm">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  পুনরায় চেষ্টা করুন
                </Button>
              </div>
            )}

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="relative mb-2">
                {/* Buffered Progress */}
                <div 
                  className="absolute h-2 bg-accent/20 rounded-full"
                  style={{ width: `${buffered}%` }}
                />
                
                {/* Current Progress */}
                <Slider
                  value={[getProgress()]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full [&>*]:h-2"
                  disabled={loading || !!error}
                />
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(audioDuration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Button
                onClick={() => skip(-10)}
                size="sm"
                variant="ghost"
                disabled={loading || !!error}
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                onClick={togglePlayPause}
                size="lg"
                variant="default"
                className="h-12 w-12 rounded-full"
                disabled={loading || !!error}
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>

              <Button
                onClick={() => skip(10)}
                size="sm"
                variant="ghost"
                disabled={loading || !!error}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={toggleMute}
                  size="sm"
                  variant="ghost"
                  disabled={loading || !!error}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  className="w-20 [&>*]:h-1"
                  disabled={loading || !!error}
                />
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => setIsRepeat(!isRepeat)}
                  size="sm"
                  variant={isRepeat ? "default" : "ghost"}
                  disabled={loading || !!error}
                >
                  <Repeat className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={loading || !!error}
                    >
                      {playbackRate}×
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => changePlaybackRate(0.5)}>
                      ০.৫× গতি
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(0.75)}>
                      ০.৭৫× গতি
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(1)}>
                      স্বাভাবিক গতি
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(1.25)}>
                      ১.২৫× গতি
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changePlaybackRate(1.5)}>
                      ১.৫× গতি
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  variant="ghost"
                  disabled={loading || !!error}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title, url: audioUrl });
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}