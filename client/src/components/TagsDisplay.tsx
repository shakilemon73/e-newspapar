import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getTags, getTrendingTags, type Tag } from '@/lib/supabase-api-direct';

interface TagsDisplayProps {
  variant?: 'all' | 'trending' | 'article';
  articleId?: number;
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export default function TagsDisplay({ 
  variant = 'trending', 
  articleId, 
  limit = 10, 
  showTitle = true,
  className = ''
}: TagsDisplayProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

        let fetchedTags: Tag[] = [];

        if (variant === 'trending') {
          fetchedTags = await getTrendingTags();
        } else if (variant === 'all') {
          fetchedTags = await getTags();
        } else if (variant === 'article' && articleId) {
          // Import getArticleTags dynamically to avoid circular dependency
          const { getArticleTags } = await import('@/lib/supabase-api-direct');
          fetchedTags = await getArticleTags(articleId);
        }

        if (limit) {
          fetchedTags = fetchedTags.slice(0, limit);
        }

        setTags(fetchedTags);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('ট্যাগ লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [variant, articleId, limit]);

  if (loading) {
    return (
      <div className={className}>
        {showTitle && (
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            {variant === 'trending' ? 'ট্রেন্ডিং ট্যাগ' : 'ট্যাগসমূহ'}
          </h3>
        )}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  const getTagVariant = (tag: Tag) => {
    // Check if is_trending exists and is true
    if (tag.hasOwnProperty('is_trending') && tag.is_trending) return 'default';
    if (tag.usage_count > 50) return 'secondary';
    return 'outline';
  };

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          {variant === 'trending' ? 'ট্রেন্ডিং ট্যাগ' : variant === 'article' ? 'সংশ্লিষ্ট ট্যাগ' : 'সকল ট্যাগ'}
        </h3>
      )}
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tag/${tag.slug}`}>
            <Badge 
              variant={getTagVariant(tag)}
              className="cursor-pointer hover:scale-105 transition-transform duration-200 px-3 py-1"
            >
              {tag.name}
              {tag.usage_count > 0 && (
                <span className="ml-1 text-xs opacity-70">
                  ({tag.usage_count})
                </span>
              )}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Trending Tags Widget for Sidebar
export function TrendingTagsWidget() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">ট্রেন্ডিং ট্যাগ</CardTitle>
      </CardHeader>
      <CardContent>
        <TagsDisplay 
          variant="trending" 
          limit={8} 
          showTitle={false}
          className="space-y-0"
        />
      </CardContent>
    </Card>
  );
}

// Article Tags Display
export function ArticleTagsDisplay({ articleId }: { articleId: number }) {
  return (
    <TagsDisplay 
      variant="article" 
      articleId={articleId}
      showTitle={false}
      className="mt-4"
    />
  );
}

// Named export for compatibility
export const TagsDisplayComponent = TagsDisplay;