# Admin API Module

This folder contains all admin-related API functions organized for maintainability and performance.

## File Structure

### Core Files

1. **`admin-supabase-complete.ts`** - Main comprehensive admin API
   - Contains all 26 admin section APIs (articles, users, categories, etc.)
   - Used by: All primary admin pages
   - Exports: `adminSupabaseAPI` object with organized sections

2. **`admin-supabase-direct.ts`** - Specialized analytics and trending functions
   - Contains: Analytics, trending data, SEO functions, user stats
   - Used by: Dashboard analytics, reporting pages
   - Exports: `getTrendingAnalytics`, `getSEOAnalytics`, `getUserStats`, etc.

3. **`admin-api-direct.ts`** - Additional utilities and CRUD operations
   - Contains: Update/delete operations, breaking news functions
   - Used by: Content management operations
   - Exports: `updateArticle`, `deleteArticle`, `getBreakingNews`, etc.

4. **`index.ts`** - Centralized exports for clean imports
   - Provides organized access to all admin functions
   - Prevents import conflicts and naming collisions

## Usage

### Importing Admin Functions

```typescript
// Import main admin API
import { adminSupabaseAPI } from '@/lib/admin';

// Import specific functions
import { getTrendingAnalytics, getSEOAnalytics } from '@/lib/admin';

// Use the APIs
const articles = await adminSupabaseAPI.articles.getAll();
const trending = await getTrendingAnalytics('24h');
```

### Admin Pages Using This Module

All 26 admin pages import from this module:
- Articles Admin
- Users Admin  
- Categories Admin
- Breaking News Admin
- Social Media Admin
- Weather Admin
- E-Papers Admin
- Analytics Admin
- SEO Management
- And 17 more admin sections...

## Architecture Benefits

- **Modular Design**: Three focused files instead of one large file
- **Performance**: Code splitting and reduced bundle size
- **Maintainability**: Easy to find and update specific functions
- **Type Safety**: Centralized TypeScript definitions
- **Clean Imports**: Single import source for all admin functionality

## Authentication

All functions use Supabase service role key for admin operations that bypass RLS policies.