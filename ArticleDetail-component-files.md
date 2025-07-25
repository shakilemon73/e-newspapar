# ArticleDetail Component File Dependencies

## Main Component File
- `client/src/pages/ArticleDetail.tsx` - Main ArticleDetail component

## React/External Dependencies
- React hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`
- Routing: `wouter` (`useRoute`, `Link`)
- Data fetching: `@tanstack/react-query` (`useQuery`)
- SEO: `react-helmet` (`Helmet`)

## Utility Functions
- `@/lib/utils/url-utils` - URL handling utilities
- `@/lib/utils/dates` - Bengali date formatting
- `@/lib/social-media-meta` - Meta tags generation

## Custom Components Used
### Core Components
- `@/components/ReadingTimeIndicator`
- `@/components/ArticleSummary`
- `@/components/TextToSpeech`
- `@/components/SavedArticleButton`
- `@/components/LikeButton`
- `@/components/ShareButton`
- `@/components/CommentsSection`
- `@/components/TagsDisplay`
- `@/components/BengaliVoiceHelper`
- `@/components/NewsletterSignup`
- `@/components/PollsSection`

### AI Components
- `@/components/AI/AIEnhancedArticleDetail`
- `@/components/AI/BackendAIIntegration`

## Hooks
- `@/hooks/use-supabase-auth` - Authentication
- `@/hooks/use-toast` - Toast notifications

## API & Database
- `@/lib/supabase` - Supabase client
- `@/lib/supabase-direct-api` - Direct API functions
- `@/lib/supabase-api-direct` - Direct API functions (alternative)

## UI Components (shadcn/ui)
- `@/components/ui/button`
- `@/components/ui/card` (Card, CardContent, CardHeader, CardTitle)
- `@/components/ui/badge`
- `@/components/ui/separator`
- `@/components/ui/progress`
- `@/components/ui/slider`
- `@/components/ui/switch`
- `@/components/ui/dropdown-menu` (DropdownMenu, DropdownMenuContent, etc.)
- `@/components/ui/dialog` (Dialog, DialogContent, DialogHeader, etc.)
- `@/components/ui/tabs` (Tabs, TabsContent, TabsList, TabsTrigger)
- `@/components/ui/avatar` (Avatar, AvatarFallback, AvatarImage)

## Icons (Lucide React)
Over 40 icons including:
- Bookmark, BookmarkCheck, Share2, Eye, Calendar, Tag, ArrowLeft
- Heart, MessageCircle, TrendingUp, ChevronRight, Copy, ExternalLink
- Clock, User, Volume2, VolumeX, Play, Pause, ZoomIn, ZoomOut
- Maximize2, ChevronUp, Settings, Type, Sun, Moon, RotateCcw
- Download, Facebook, Twitter, Send, Lightbulb, BookOpen
- Target, Coffee, Award, ThumbsUp, ThumbsDown, Flag, MoreHorizontal

## Related Component Files Found
- `client/src/components/EnhancedArticleDetail.tsx`
- `client/src/components/AI/AIEnhancedArticleDetail.tsx`
- `client/src/pages/SavedArticles.tsx`
- `client/src/pages/Category.tsx`

## Key Features Implemented
1. Article viewing with responsive design
2. User authentication integration
3. Save/unsave functionality
4. Social sharing capabilities
5. Reading progress tracking
6. Audio playback with Bengali text-to-speech
7. Advanced reading features (font size, dark mode, auto-scroll)
8. Comments and polls integration
9. AI-enhanced content analysis
10. SEO meta tags generation
11. Bengali language support
12. Real-time analytics tracking