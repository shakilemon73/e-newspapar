import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { getTags, getPopularTags } from '../lib/missing-tables-api';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Hash, TrendingUp } from 'lucide-react';

interface Tag {
  id: number;
  name: string;
  slug: string;
  usage_count: number;
  created_at: string;
}

interface EnhancedTagsDisplayProps {
  mode?: 'popular' | 'all';
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

const EnhancedTagsDisplay: React.FC<EnhancedTagsDisplayProps> = ({ 
  mode = 'popular',
  limit = 20,
  showTitle = true,
  className = ''
}) => {
  // Fetch tags based on mode
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags', mode, limit],
    queryFn: mode === 'popular' 
      ? () => getPopularTags(limit)
      : () => getTags(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          {showTitle && (
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              ট্যাগসমূহ
            </CardTitle>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tags.length) {
    return (
      <Card className={className}>
        <CardHeader>
          {showTitle && (
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              ট্যাগসমূহ
            </CardTitle>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            কোনো ট্যাগ পাওয়া যায়নি
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        {showTitle && (
          <CardTitle className="flex items-center gap-2">
            {mode === 'popular' ? (
              <>
                <TrendingUp className="h-5 w-5" />
                জনপ্রিয় ট্যাগ
              </>
            ) : (
              <>
                <Hash className="h-5 w-5" />
                সব ট্যাগ
              </>
            )}
          </CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link 
              key={tag.id} 
              href={`/tag/${tag.slug}`}
              className="inline-block"
            >
              <Badge 
                variant="outline" 
                className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {tag.name}
                {mode === 'popular' && (
                  <span className="ml-1 text-xs opacity-70">
                    ({tag.usage_count})
                  </span>
                )}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedTagsDisplay;