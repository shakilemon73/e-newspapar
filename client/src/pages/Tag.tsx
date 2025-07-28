import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { Calendar, Eye, Tag as TagIcon } from 'lucide-react';
import SEO from '@/components/SEO';
import { getArticlesByTag, getTags, type Article, type Tag } from '@/lib/supabase-api-direct';

export default function TagPage() {
  const [, params] = useRoute('/tag/:slug');
  const [articles, setArticles] = useState<Article[]>([]);
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const tagSlug = params?.slug;

  useEffect(() => {
    const fetchTagData = async () => {
      if (!tagSlug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch articles for this tag
        const tagArticles = await getArticlesByTag(tagSlug, 50);
        setArticles(tagArticles);
        
        // Find tag details
        const allTags = await getTags();
        const foundTag = allTags.find(t => t.slug === tagSlug);
        setTag(foundTag || null);
        
      } catch (err) {
        console.error('Error fetching tag data:', err);
        setError('ট্যাগের তথ্য লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchTagData();
  }, [tagSlug]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          {/* Articles Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <TagIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            ট্যাগ পাওয়া যায়নি
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <Link href="/">
            <Badge variant="outline" className="cursor-pointer">
              হোমপেজে ফিরে যান
            </Badge>
          </Link>
        </div>
      </div>
    );
  }

  const tagName = tag?.name || tagSlug || 'ট্যাগ';
  const tagDescription = tag?.description || `${tagName} সম্পর্কিত সকল সংবাদ`;

  return (
    <>
      <SEO
        title={`${tagName} - সংশ্লিষ্ট সংবাদ`}
        description={`${tagDescription}। ${articles.length} টি সংবাদ পাওয়া গেছে।`}
        keywords={`${tagName}, বাংলা সংবাদ, ট্যাগ, ${tagSlug}`}
        url={`/tag/${tagSlug}`}
        type="website"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <TagIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {tagName}
              </h1>
              {tag?.is_trending && (
                <Badge variant="default" className="bg-red-500">
                  ট্রেন্ডিং
                </Badge>
              )}
            </div>
            
            {tag?.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {tag.description}
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{articles.length} টি সংবাদ</span>
              {tag?.usage_count && (
                <span>মোট {tag.usage_count} বার ব্যবহৃত</span>
              )}
            </div>
          </div>

          {/* Articles Grid */}
          {articles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link key={article.id} href={`/article/${article.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                    <div className="relative">
                      <img
                        src={article.image_url || '/placeholder-300x176.svg'}
                        alt={article.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-300x176.svg';
                        }}
                      />
                      {article.is_featured && (
                        <Badge 
                          variant="default" 
                          className="absolute top-2 right-2 bg-red-500"
                        >
                          ফিচার্ড
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white">
                        {article.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.view_count || 0}</span>
                        </div>
                      </div>
                      
                      {article.category && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {article.category.name}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TagIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                কোনো সংবাদ পাওয়া যায়নি
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                এই ট্যাগের সাথে সম্পর্কিত কোনো সংবাদ পাওয়া যায়নি।
              </p>
              <Link href="/">
                <Badge variant="outline" className="cursor-pointer">
                  সর্বশেষ সংবাদ দেখুন
                </Badge>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}