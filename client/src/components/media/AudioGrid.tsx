import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Play, Pause, Volume2, Clock, Calendar, Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from './AudioPlayer';
import { EnhancedAudioPlayer } from './EnhancedAudioPlayer';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';

interface AudioArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  audio_url: string;
  duration: string;
  published_at: string;
  category?: {
    name: string;
    slug: string;
  };
}

interface AudioGridProps {
  title?: string;
  categorySlug?: string;
  limit?: number;
  showPlayer?: boolean;
  layout?: 'grid' | 'list';
  className?: string;
}

export function AudioGrid({ 
  title = "অডিও আর্টিকেল", 
  categorySlug, 
  limit = 6,
  showPlayer = true,
  layout = 'grid',
  className = '' 
}: AudioGridProps) {
  const [articles, setArticles] = useState<AudioArticle[]>([]);
  const [currentArticle, setCurrentArticle] = useState<AudioArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<AudioArticle | null>(null);

  useEffect(() => {
    const fetchAudioArticles = async () => {
      try {
        setIsLoading(true);
        
        // Import API function to get audio articles (uses real articles from database)
        const { getAudioArticles } = await import('@/lib/supabase-api-direct');
        
        const data = await getAudioArticles();
        
        // Filter by category if specified
        let filteredData = data;
        if (categorySlug) {
          filteredData = data.filter(article => 
            article.category?.slug === categorySlug
          );
        }

        // Apply limit
        if (limit) {
          filteredData = filteredData.slice(0, limit);
        }

        setArticles(filteredData);
        setCurrentArticle(filteredData[0] || null);

        setError(null);
      } catch (err) {
        console.error('Error fetching audio articles:', err);
        setError(err instanceof Error ? err.message : 'অডিও আর্টিকেল লোড করতে সমস্যা হয়েছে');
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudioArticles();
  }, [categorySlug, limit]);

  const handleAudioSelect = (article: AudioArticle) => {
    setSelectedAudio(article);
    setCurrentArticle(article);
  };

  const AudioCard = ({ article, featured = false }: { article: AudioArticle; featured?: boolean }) => (
    <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-lg ${featured ? 'md:col-span-2' : ''}`}>
      <CardContent className="p-0">
        {layout === 'grid' ? (
          // Grid Layout
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-accent/20 to-accent/30 overflow-hidden relative">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Audio Indicator Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={() => showPlayer ? handleAudioSelect(article) : null}
                  size="lg"
                  variant="secondary"
                  className="h-16 w-16 rounded-full bg-white/90 hover:bg-white transition-all duration-300 group-hover:scale-110"
                  asChild={!showPlayer}
                >
                  {showPlayer ? (
                    <Play className="h-8 w-8 text-accent ml-1" />
                  ) : (
                    <Link href={`/audio/${article.slug}`}>
                      <Play className="h-8 w-8 text-accent ml-1" />
                    </Link>
                  )}
                </Button>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Headphones className="h-3 w-3" />
                {article.duration}
              </div>

              {/* Category Badge */}
              {article.category && (
                <div className="absolute top-3 left-3 bg-accent text-white text-xs px-2 py-1 rounded">
                  {article.category.name}
                </div>
              )}

              {/* Audio Wave Animation */}
              <div className="absolute bottom-3 left-3">
                <div className="flex items-end gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full animate-pulse"
                      style={{
                        height: `${8 + (i % 2) * 4}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className={`font-bold mb-2 line-clamp-2 ${featured ? 'text-xl' : 'text-lg'}`}>
                <Link 
                  href={`/audio/${article.slug}`} 
                  className="hover:text-accent transition-colors"
                >
                  {article.title}
                </Link>
              </h3>

              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {article.excerpt}
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {getRelativeTimeInBengali(article.published_at)}
              </div>
            </div>
          </div>
        ) : (
          // List Layout
          <div className="flex gap-4 p-4">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/30 rounded-lg overflow-hidden relative">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={() => showPlayer ? handleAudioSelect(article) : null}
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                    asChild={!showPlayer}
                  >
                    {showPlayer ? (
                      <Play className="h-4 w-4 text-accent ml-0.5" />
                    ) : (
                      <Link href={`/audio/${article.slug}`}>
                        <Play className="h-4 w-4 text-accent ml-0.5" />
                      </Link>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold mb-1 line-clamp-2">
                <Link 
                  href={`/audio/${article.slug}`} 
                  className="hover:text-accent transition-colors"
                >
                  {article.title}
                </Link>
              </h3>
              
              <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                {article.excerpt}
              </p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {getRelativeTimeInBengali(article.published_at)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${
                  layout === 'grid' ? 'aspect-square' : 'h-24'
                }`} />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Volume2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">কোন অডিও আর্টিকেল পাওয়া যায়নি</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href="/audio-articles" className="text-accent hover:underline">
          সব অডিও দেখুন →
        </Link>
      </div>

      {/* Featured Audio Player */}
      {selectedAudio && showPlayer && (
        <div className="mb-6">
          <EnhancedAudioPlayer
            audioUrl={selectedAudio.audio_url}
            title={selectedAudio.title}
            excerpt={selectedAudio.excerpt}
            imageUrl={selectedAudio.image_url}
            duration={selectedAudio.duration}
            autoPlay={true}
            className="max-w-4xl mx-auto"
          />
        </div>
      )}

      {/* Audio Grid/List */}
      <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {articles.map((article) => (
          <AudioCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}