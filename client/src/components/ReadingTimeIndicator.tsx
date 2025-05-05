import { Clock } from 'lucide-react';

interface ReadingTimeIndicatorProps {
  content: string;
}

export const ReadingTimeIndicator = ({ content }: ReadingTimeIndicatorProps) => {
  // Calculate reading time based on content length
  // Average reading speed is about 200-250 words per minute
  // We'll use 225 words per minute as a baseline
  const calculateReadingTime = (text: string): number => {
    const wordCount = text.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 225);
    return readingTimeMinutes < 1 ? 1 : readingTimeMinutes;
  };

  const readingTime = calculateReadingTime(content);

  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Clock className="h-4 w-4 mr-1" />
      <span>{readingTime} মিনিট পড়া</span>
    </div>
  );
};

export default ReadingTimeIndicator;