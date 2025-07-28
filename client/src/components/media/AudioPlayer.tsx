import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  duration?: string;
  autoPlay?: boolean;
  showPlaylist?: boolean;
  className?: string;
}

export function AudioPlayer({ 
  audioUrl, 
  title, 
  excerpt,
  imageUrl, 
  duration, 
  autoPlay = false,
  showPlaylist = true,
  className = '' 
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
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

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = value[0];
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
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (audioDuration === 0) return 0;
    return (currentTime / audioDuration) * 100;
  };

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

          {/* Main Player Section */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Album Art / Image */}
              <div className="flex-shrink-0">
                <div className="w-full md:w-48 h-48 bg-gradient-to-br from-accent/20 to-accent/30 rounded-lg overflow-hidden relative group">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Volume2 className="h-16 w-16 text-accent/50" />
                    </div>
                  )}
                  
                  {/* Play/Pause Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      onClick={togglePlayPause}
                      size="lg"
                      variant="secondary"
                      className="h-16 w-16 rounded-full bg-white/90 hover:bg-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                      ) : isPlaying ? (
                        <Pause className="h-8 w-8 text-accent" />
                      ) : (
                        <Play className="h-8 w-8 text-accent ml-1" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Audio Info & Controls */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                  {excerpt && (
                    <p className="text-muted-foreground text-sm leading-relaxed">{excerpt}</p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="relative">
                    <Slider
                      value={[currentTime]}
                      onValueChange={handleSeek}
                      max={audioDuration || 100}
                      step={1}
                      className="w-full"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => setIsShuffle(!isShuffle)}
                    size="sm"
                    variant="ghost"
                    className={`${isShuffle ? 'text-accent' : 'text-muted-foreground'}`}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={() => skip(-15)}
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>

                  <Button
                    onClick={togglePlayPause}
                    size="lg"
                    className="h-14 w-14 rounded-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-1" />
                    )}
                  </Button>

                  <Button
                    onClick={() => skip(15)}
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>

                  <Button
                    onClick={() => setIsRepeat(!isRepeat)}
                    size="sm"
                    variant="ghost"
                    className={`${isRepeat ? 'text-accent' : 'text-muted-foreground'}`}
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>

                {/* Volume & Additional Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={toggleMute}
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <div className="w-24">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Playback Speed */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">গতি:</span>
                    <select
                      value={playbackRate}
                      onChange={(e) => changePlaybackRate(Number(e.target.value))}
                      className="bg-background border border-border rounded px-2 py-1 text-xs"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={0.75}>0.75x</option>
                      <option value={1}>স্বাভাবিক</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div 
            className="h-1 bg-accent transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}