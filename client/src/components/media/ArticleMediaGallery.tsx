import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  ChevronLeft, 
  ChevronRight,
  Grid3X3,
  Image as ImageIcon,
  Video as VideoIcon,
  ZoomIn,
  Download,
  Share2,
  Eye
} from 'lucide-react';
// Import video player component

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  duration?: string;
  size?: string;
}

interface ArticleMediaGalleryProps {
  mediaItems: MediaItem[];
  title?: string;
  className?: string;
}

export const ArticleMediaGallery: React.FC<ArticleMediaGalleryProps> = ({ 
  mediaItems, 
  title = "মিডিয়া গ্যালারি",
  className = ""
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredMedia = mediaItems.filter(item => 
    filterType === 'all' || item.type === filterType
  );

  const openMedia = (media: MediaItem, index: number) => {
    setSelectedMedia(media);
    setCurrentIndex(index);
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % filteredMedia.length
      : (currentIndex - 1 + filteredMedia.length) % filteredMedia.length;
    
    setCurrentIndex(newIndex);
    setSelectedMedia(filteredMedia[newIndex]);
  };

  const handleShare = (media: MediaItem) => {
    if (navigator.share) {
      navigator.share({
        title: media.title || 'মিডিয়া শেয়ার',
        text: media.description || '',
        url: media.url
      });
    } else {
      navigator.clipboard.writeText(media.url);
    }
  };

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredMedia.map((media, index) => (
        <Card 
          key={media.id} 
          className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
          onClick={() => openMedia(media, index)}
        >
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
            {media.type === 'image' ? (
              <img
                src={media.url}
                alt={media.title || 'Image'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={media.thumbnail || media.url}
                  alt={media.title || 'Video'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-white/90 dark:bg-black/90 rounded-full p-3">
                    <Play className="w-6 h-6 text-gray-800 dark:text-white" />
                  </div>
                </div>
                {media.duration && (
                  <Badge className="absolute bottom-2 right-2 bg-black/75 text-white">
                    {media.duration}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Media Type Badge */}
            <Badge 
              className={`absolute top-2 left-2 ${
                media.type === 'video' 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {media.type === 'video' ? (
                <><VideoIcon className="w-3 h-3 mr-1" />ভিডিও</>
              ) : (
                <><ImageIcon className="w-3 h-3 mr-1" />ছবি</>
              )}
            </Badge>

            {/* Hover Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(media);
                }}
              >
                <Share2 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(true);
                  openMedia(media, index);
                }}
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Media Info */}
          <CardContent className="p-3">
            <h4 className="font-medium text-sm line-clamp-2 mb-1">
              {media.title || `${media.type === 'video' ? 'ভিডিও' : 'ছবি'} #${index + 1}`}
            </h4>
            {media.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {media.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Carousel View Component
  const CarouselView = () => (
    <div className="relative">
      <div className="flex overflow-x-auto gap-4 pb-4">
        {filteredMedia.map((media, index) => (
          <div 
            key={media.id}
            className="flex-shrink-0 w-64 cursor-pointer"
            onClick={() => openMedia(media, index)}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.title || 'Image'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={media.thumbnail || media.url}
                      alt={media.title || 'Video'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                <Badge 
                  className={`absolute top-2 left-2 ${
                    media.type === 'video' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                >
                  {media.type === 'video' ? 'ভিডিও' : 'ছবি'}
                </Badge>
              </div>
              <CardContent className="p-2">
                <p className="text-sm font-medium line-clamp-1">
                  {media.title || `${media.type === 'video' ? 'ভিডিও' : 'ছবি'} #${index + 1}`}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

  if (!mediaItems.length) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {mediaItems.length}টি মিডিয়া আইটেম
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Buttons */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={filterType === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="rounded-none"
            >
              সব
            </Button>
            <Button
              variant={filterType === 'image' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('image')}
              className="rounded-none"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              ছবি
            </Button>
            <Button
              variant={filterType === 'video' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('video')}
              className="rounded-none"
            >
              <VideoIcon className="w-4 h-4 mr-1" />
              ভিডিও
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'carousel' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('carousel')}
              className="rounded-none"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Media Display */}
      {viewMode === 'grid' ? <GridView /> : <CarouselView />}

      {/* Media Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selectedMedia?.type === 'video' ? (
                  <VideoIcon className="w-5 h-5" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
                {selectedMedia?.title || `${selectedMedia?.type === 'video' ? 'ভিডিও' : 'ছবি'} ${currentIndex + 1}`}
              </DialogTitle>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMedia('prev')}
                  disabled={filteredMedia.length <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {filteredMedia.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMedia('next')}
                  disabled={filteredMedia.length <= 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex items-center justify-center p-4 bg-black/5 dark:bg-black/20">
            {selectedMedia?.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title || 'Image'}
                className="max-w-full max-h-full object-contain"
              />
            ) : selectedMedia?.type === 'video' ? (
              <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
                <video
                  src={selectedMedia.url}
                  poster={selectedMedia.thumbnail}
                  controls
                  className="max-w-full max-h-full"
                  title={selectedMedia.title}
                >
                  আপনার ব্রাউজার ভিডিও প্লেব্যাক সাপোর্ট করে না।
                </video>
              </div>
            ) : null}
          </div>

          {selectedMedia?.description && (
            <div className="p-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedMedia.description}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticleMediaGallery;