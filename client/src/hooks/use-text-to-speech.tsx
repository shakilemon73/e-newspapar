import { useState, useEffect, useCallback } from 'react';

interface TextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
  language?: string;
}

export function useTextToSpeech(defaultOptions?: TextToSpeechOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [options, setOptions] = useState<TextToSpeechOptions>(
    defaultOptions || {
      rate: 1,
      pitch: 1,
      volume: 1,
      voice: '',
      language: 'bn-BD' // Default to Bengali
    }
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.error('Browser does not support speech synthesis');
      return;
    }

    // Get initial list of voices
    const syncVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    syncVoices(); // Try initial sync
    window.speechSynthesis.onvoiceschanged = syncVoices; // Set up for async loading

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const bengaliVoices = voices.filter(
    voice => voice.lang.startsWith('bn') || voice.lang.includes('bengali')
  );

  // Set up speech
  const speak = useCallback(
    (text: string, newOptions?: TextToSpeechOptions) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.error('Browser does not support speech synthesis');
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create utterance object
      const speechUtterance = new SpeechSynthesisUtterance(text);
      setUtterance(speechUtterance);

      // Combine options
      const combinedOptions = { ...options, ...newOptions };
      
      // Apply options
      speechUtterance.rate = combinedOptions.rate || 1;
      speechUtterance.pitch = combinedOptions.pitch || 1;
      speechUtterance.volume = combinedOptions.volume || 1;
      speechUtterance.lang = combinedOptions.language || 'bn-BD';

      // Set voice if specified and available
      if (combinedOptions.voice) {
        const selectedVoice = voices.find(v => v.name === combinedOptions.voice);
        if (selectedVoice) {
          speechUtterance.voice = selectedVoice;
        }
      } else if (bengaliVoices.length > 0) {
        // Use the first Bengali voice if available
        speechUtterance.voice = bengaliVoices[0];
      }

      // Events
      speechUtterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      speechUtterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setUtterance(null);
      };

      speechUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsPaused(false);
        setUtterance(null);
      };

      window.speechSynthesis.speak(speechUtterance);
    },
    [options, voices, bengaliVoices]
  );

  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !isPlaying || isPaused) {
      return;
    }

    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isPlaying, isPaused]);

  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !isPlaying || !isPaused) {
      return;
    }

    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isPlaying, isPaused]);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setUtterance(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis && isPlaying) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  // Update utterance when options change
  useEffect(() => {
    if (utterance && isPlaying) {
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      if (options.voice) {
        const selectedVoice = voices.find(v => v.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
    }
  }, [options, utterance, isPlaying, voices]);

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    voices,
    bengaliVoices,
    options,
    setOptions,
  };
}