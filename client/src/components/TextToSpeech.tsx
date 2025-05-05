import { useState, useEffect } from 'react';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { Play, Pause, Square, Volume2, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TextToSpeechProps {
  text: string;
  title?: string;
}

export function TextToSpeech({ text, title }: TextToSpeechProps) {
  const cleanText = title ? `${title}. ${text}` : text;
  const {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    options,
    setOptions,
    bengaliVoices,
  } = useTextToSpeech();

  // Parse the HTML content to extract plain text
  const extractTextFromHtml = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const plainText = extractTextFromHtml(cleanText);

  const handlePlayPause = () => {
    if (!isPlaying) {
      speak(plainText);
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleRateChange = (value: number[]) => {
    setOptions({ ...options, rate: value[0] });
  };

  const handlePitchChange = (value: number[]) => {
    setOptions({ ...options, pitch: value[0] });
  };

  const handleVolumeChange = (value: number[]) => {
    setOptions({ ...options, volume: value[0] });
  };

  return (
    <div className="flex items-center justify-start gap-2 bg-muted/50 dark:bg-muted/20 rounded-lg p-2 mb-4">
      <div className="flex items-center">
        <button
          onClick={handlePlayPause}
          className="btn-hover-effect w-10 h-10 flex items-center justify-center rounded-full bg-accent hover:bg-accent/90 text-white"
          title={isPlaying && !isPaused ? 'বিরতি দিন' : (isPaused ? 'চালু করুন' : 'আর্টিকেল শুনুন')}
        >
          {isPlaying && !isPaused ? <Pause size={18} /> : <Play size={18} />}
        </button>
        
        {isPlaying && (
          <button
            onClick={handleStop}
            className="ml-2 btn-hover-effect w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 hover:opacity-90"
            title="বন্ধ করুন"
          >
            <Square size={18} />
          </button>
        )}
      </div>

      <div className="ml-2 flex-1 max-w-[200px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded-md hover:bg-muted flex items-center gap-1 text-sm"
              title="সেটিংস"
            >
              <Volume2 size={18} />
              <span className="hidden sm:inline">অডিও সেটিংস</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px] p-4">
            <DropdownMenuLabel>অডিও সেটিংস</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">গতি</label>
                  <span className="text-xs">{options.rate?.toFixed(1)}</span>
                </div>
                <Slider
                  value={[options.rate || 1]}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onValueChange={handleRateChange}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">পিচ</label>
                  <span className="text-xs">{options.pitch?.toFixed(1)}</span>
                </div>
                <Slider
                  value={[options.pitch || 1]}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onValueChange={handlePitchChange}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">ভলিউম</label>
                  <span className="text-xs">{options.volume?.toFixed(1)}</span>
                </div>
                <Slider
                  value={[options.volume || 1]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                />
              </div>

              {bengaliVoices.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                  <p>ব্যবহৃত ভয়েস: {bengaliVoices[0]?.name || 'বাংলা ভয়েস'}</p>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isPlaying && (
        <div className="grow flex items-center text-sm">
          <div className="relative h-1 w-full bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-accent animate-pulse-linear" 
                 style={{ width: `${isPaused ? '30%' : '100%'}` }}></div>
          </div>
          <span className="ml-2 text-xs">{isPaused ? 'বিরতি' : 'চলছে...'}</span>
        </div>
      )}
    </div>
  );
}