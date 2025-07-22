import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TagData {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

interface TagsDisplayProps {
  articleId: number;
  maxTags?: number;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function TagsDisplay({ 
  articleId, 
  maxTags = 5,
  size = 'default',
  className = ''
}: TagsDisplayProps) {
  const [tags, setTags] = useState<TagData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTags();
  }, [articleId]);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const { getArticleTags } = await import('../lib/supabase-api-direct');
      const data = await getArticleTags(articleId);
      setTags(data.slice(0, maxTags));
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Tag className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="h-5 w-16 bg-muted animate-pulse rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <Tag className="h-4 w-4 text-muted-foreground" />
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className={`${sizeClasses[size]} transition-colors hover:bg-primary/20`}
          style={{
            backgroundColor: tag.color ? `${tag.color}20` : undefined,
            borderColor: tag.color || undefined
          }}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}