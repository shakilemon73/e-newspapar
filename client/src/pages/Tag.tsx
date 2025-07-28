import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag as TagIcon, TrendingUp, Calendar, Eye } from 'lucide-react';
import { getArticlesByTag, getTags } from '@/lib/supabase-api-direct';
import { formatDate } from '@/components/DateFormatter';

interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  usage_count: number;
  is_trending: boolean;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string;
  view_count: number;
  published_at: string;
  is_featured: boolean;
  category_id: number;
  categories?: { id: number; name: string; slug: string };
}

export default function TagPage() {
  const [match, params] = useRoute('/tag/:slug');
  const [tag, setTag] = useState<Tag | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!match || !params.slug) return;

    const fetchTagData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get tag details
        const tags = await getTags();
        const currentTag = tags.find(t => t.slug === params.slug);
        
        if (!currentTag) {
          setError('ট্যাগ খুঁজে পাওয়া যায়নি');
          return;
        }

        setTag(currentTag);

        // Get articles for this tag
        const tagArticles = await getArticlesByTag(params.slug);
        setArticles(tagArticles);

      } catch (err) {
        console.error('Error fetching tag data:', err);
        setError('ট্যাগ এর তথ্য লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchTagData();
  }, [match, params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !tag) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <TagIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">ট্যাগ খুঁজে পাওয়া যায়নি</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'আপনি যে ট্যাগ খুঁজছেন তা আর উপলব্ধ নেই।'}
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              ফিরে যান
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tag Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ফিরে যান
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: tag.color || '#3B82F6' }}
                >
                  <TagIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">{tag.name}</CardTitle>
                  <CardDescription className="text-lg">
                    {tag.description || `${tag.name} সম্পর্কিত সংবাদ`}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {tag.is_trending && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    ট্রেন্ডিং
                  </Badge>
                )}
                <Badge variant="outline">
                  {tag.usage_count} টি সংবাদ
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Articles Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {tag.name} সম্পর্কিত সংবাদ ({articles.length})
          </h2>
        </div>

        {articles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <TagIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">কোন সংবাদ পাওয়া যায়নি</h3>
              <p className="text-muted-foreground">
                এই ট্যাগ এর সাথে সম্পর্কিত কোন সংবাদ এখনও প্রকাশিত হয়নি।
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <TagIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {article.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-red-600">
                      ফিচার্ড
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    <a 
                      href={`/article/${article.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {article.title}
                    </a>
                  </h3>
                  
                  {article.excerpt && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(article.published_at)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{article.view_count || 0}</span>
                    </div>
                  </div>
                  
                  {article.categories && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {article.categories.name}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}