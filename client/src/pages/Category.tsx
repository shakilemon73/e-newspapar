import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { 
  Grid, 
  List, 
  Filter, 
  Search, 
  ArrowRight,
  Clock,
  User,
  Eye,
  Bookmark,
  Share2,
  ChevronDown,
  SortDesc,
  Calendar,
  Tag,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';
import { generateCategoryMetaTags, getMetaTagsForHelmet } from '@/lib/social-media-meta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image_url?: string;
  imageUrl?: string;
  published_at?: string;
  publishedAt?: string;
  view_count?: number;
  category?: Category;
  categories?: Category;
}

const Category = () => {
  const [, params] = useRoute('/category/:slug');
  const categorySlug = params?.slug || '';

  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const limit = 12;

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        
        const { getCategoryBySlug, getCategories, getArticles, getPopularArticles } = await import('../lib/supabase-api-direct');
        
        // Fetch all categories for navigation
        const categoriesData = await getCategories();
        setAllCategories(categoriesData);
        
        // Fetch category details
        const categoryData = await getCategoryBySlug(categorySlug);
        if (!categoryData) {
          setError('এই বিভাগটি খুঁজে পাওয়া যায়নি');
          return;
        }
        setCategory(categoryData);
        
        // Fetch articles based on sort preference
        let articlesData;
        if (sortBy === 'popular') {
          articlesData = await getPopularArticles(limit);
          // Filter by category client-side for now
          articlesData = articlesData.filter((article: any) => 
            article.categories?.slug === categorySlug
          );
        } else {
          articlesData = await getArticles({ 
            category: categorySlug, 
            limit: limit, 
            offset: 0 
          });
        }
        setArticles(articlesData as any);
        setHasMore(articlesData.length === limit);
        setPage(1);
        setError(null);
      } catch (err) {
        setError('বিভাগের খবর লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching category:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
    // Reset to the top of the page when category changes
    window.scrollTo(0, 0);
  }, [categorySlug, sortBy]);

  const loadMoreArticles = async () => {
    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const offset = page * limit;
      
      const { getArticles, getPopularArticles } = await import('../lib/supabase-api-direct');
      
      let newArticles;
      if (sortBy === 'popular') {
        newArticles = await getPopularArticles(limit);
        // Filter by category client-side for now
        newArticles = newArticles.filter((article: any) => 
          article.categories?.slug === categorySlug
        );
      } else {
        newArticles = await getArticles({ 
          category: categorySlug, 
          limit: limit, 
          offset: offset 
        });
      }
      
      if (newArticles.length > 0) {
        setArticles([...articles, ...newArticles as any]);
        setPage(nextPage);
        setHasMore(newArticles.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter articles based on search query
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Category navigation component
  const CategoryNavigation = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-hind">
          <Tag className="w-5 h-5 mr-2 text-primary" />
          সকল বিভাগ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="flex space-x-2 pb-2">
            {allCategories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`}>
                <Badge 
                  variant={cat.slug === categorySlug ? "default" : "outline"} 
                  className="category-nav-chip whitespace-nowrap cursor-pointer px-3 py-1"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // Enhanced article card for grid view
  const ArticleCardGrid = ({ article }: { article: Article }) => (
    <Card className="article-card-grid group overflow-hidden h-full flex flex-col">
      <Link href={`/article/${article.slug}`}>
        <div className="relative overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 text-primary-foreground">
              {category?.name}
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <Link href={`/article/${article.slug}`}>
          <h3 className="font-bold text-lg mb-2 font-hind line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3" />
            <span>{getRelativeTimeInBengali(article.publishedAt)}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="h-auto p-1">
              <Bookmark className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-auto p-1">
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Enhanced article card for list view
  const ArticleCardList = ({ article }: { article: Article }) => (
    <Card className="article-card-list group">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Link href={`/article/${article.slug}`} className="flex-shrink-0">
            <div className="relative w-32 h-20 overflow-hidden rounded-md">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <Link href={`/article/${article.slug}`}>
                <h3 className="font-semibold text-lg font-hind line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
              </Link>
              <Badge variant="outline" className="ml-2 flex-shrink-0">
                {category?.name}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{getRelativeTimeInBengali(article.publishedAt)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-auto p-1">
                  <Bookmark className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-auto p-1">
                  <Share2 className="w-3 h-3" />
                </Button>
                <Link href={`/article/${article.slug}`}>
                  <Button variant="ghost" size="sm" className="h-auto p-1 text-primary">
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!category && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          
          {/* Navigation skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="flex space-x-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded-full w-20 animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Articles skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-muted animate-pulse"></div>
                <CardContent className="p-4 space-y-2">
                  <div className="h-6 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-1/4 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <Search className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-4 font-hind">
              {error || 'বিভাগ খুঁজে পাওয়া যায়নি'}
            </h2>
            <p className="text-muted-foreground mb-6">
              দুঃখিত, আপনি যে বিভাগটি খুঁজছেন তা পাওয়া যায়নি।
            </p>
            <Link href="/">
              <Button>
                <ArrowRight className="w-4 h-4 mr-2" />
                হোমপেজে ফিরে যান
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate comprehensive social media meta tags for category page
  const socialMetaTags = generateCategoryMetaTags({
    name: category.name,
    slug: category.slug,
    description: category.description
  });
  const { metaElements, linkElements } = getMetaTagsForHelmet(socialMetaTags);

  return (
    <>
      <Helmet>
        <title>{socialMetaTags.title}</title>
        {metaElements.map((meta, index) => 
          meta.property ? (
            <meta key={index} property={meta.property} content={meta.content} />
          ) : (
            <meta key={index} name={meta.name} content={meta.content} />
          )
        )}
        {linkElements.map((link, index) => (
          <link key={index} rel={link.rel} href={link.href} />
        ))}
      </Helmet>

      <div className="category-page">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="category-header text-center py-8 mb-8">
            <h1 className="category-title-animated text-4xl md:text-5xl font-bold mb-4 font-hind bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {category.description}
              </p>
            )}
          </div>

          {/* Category Navigation */}
          <CategoryNavigation />

          {/* Controls Section */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search and Filter */}
                <div className="flex gap-2 flex-1 w-full sm:w-auto">
                  <div className="search-input-enhanced relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      placeholder="খবর খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <SortDesc className="w-4 h-4 mr-2" />
                        {sortBy === 'latest' ? 'সর্বশেষ' : sortBy === 'popular' ? 'জনপ্রিয়' : 'ট্রেন্ডিং'}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortBy('latest')}>
                        <Calendar className="w-4 h-4 mr-2" />
                        সর্বশেষ
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('popular')}>
                        <Eye className="w-4 h-4 mr-2" />
                        জনপ্রিয়
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('trending')}>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        ট্রেন্ডিং
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="view-toggle-button"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="view-toggle-button"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Info */}
          {searchQuery && (
            <div className="mb-4 text-sm text-muted-foreground">
              <Search className="w-4 h-4 inline mr-2" />
              "{searchQuery}" এর জন্য {filteredArticles.length}টি ফলাফল পাওয়া গেছে
            </div>
          )}

          {/* Articles Section */}
          {filteredArticles.length === 0 && !isLoading ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="empty-state-icon w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-hind">
                  {searchQuery ? 'কোনো ফলাফল পাওয়া যায়নি' : 'এই বিভাগে এখনো কোন সংবাদ প্রকাশিত হয়নি'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? 'অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন বা ফিল্টার পরিবর্তন করুন।'
                    : 'শীঘ্রই এই বিভাগে নতুন সংবাদ প্রকাশিত হবে।'
                  }
                </p>
                {searchQuery && (
                  <Button onClick={() => setSearchQuery('')} variant="outline">
                    সার্চ ক্লিয়ার করুন
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Articles Grid/List */}
              <div className={
                viewMode === 'grid' 
                  ? "article-grid-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {filteredArticles.map((article) => 
                  viewMode === 'grid' ? (
                    <ArticleCardGrid key={article.id} article={article} />
                  ) : (
                    <ArticleCardList key={article.id} article={article} />
                  )
                )}
              </div>
              
              {/* Load More Button */}
              {hasMore && !searchQuery && (
                <div className="mt-12 text-center">
                  <Button 
                    onClick={loadMoreArticles}
                    disabled={isLoading}
                    size="lg"
                    className="load-more-button px-8"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        লোড হচ্ছে...
                      </>
                    ) : (
                      <>
                        আরও সংবাদ দেখুন
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Category;
