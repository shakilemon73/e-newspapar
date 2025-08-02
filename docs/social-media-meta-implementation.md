# Social Media Meta Tags Implementation Guide

## Overview
This document describes the implementation of social media meta tags for the Bengali news website to ensure proper sharing on Facebook, Twitter, LinkedIn, WhatsApp, and other platforms.

## Implementation Components

### 1. Vercel Edge Function
**File:** `api/article/[slug].js`
- **Purpose:** Serves HTML with meta tags to social media crawlers
- **Runtime:** Edge runtime for optimal performance
- **Features:**
  - Detects social media crawlers by User-Agent
  - Fetches article data from Supabase
  - Generates comprehensive meta tags
  - Redirects regular users to React app

### 2. Vercel Configuration
**File:** `vercel.json`
- **Routing:** Intercepts social media crawler requests
- **User-Agent Detection:** Routes crawlers to Edge function
- **Fallback:** Regular users get the React app

### 3. Default OG Image
**File:** `public/og-default.svg`
- **Dimensions:** 1200x630 (optimal for all platforms)
- **Design:** Bengali news branding with gradient background
- **Fallback:** Used when articles don't have featured images

### 4. React Meta Tags Integration
**File:** `client/src/lib/social-media-meta.ts`
- **Purpose:** Client-side meta tag generation
- **Features:** 
  - Open Graph tags (Facebook, WhatsApp, Telegram)
  - Twitter Card tags
  - Instagram meta tags
  - SEO optimization

## Supported Platforms

### Primary Platforms
- **Facebook:** Open Graph meta tags
- **Twitter/X:** Twitter Card tags  
- **LinkedIn:** Open Graph meta tags
- **WhatsApp:** Open Graph meta tags
- **Telegram:** Open Graph meta tags

### Secondary Platforms
- **Instagram:** Custom Instagram meta tags
- **Discord:** Open Graph tags
- **Slack:** Open Graph tags
- **Apple Messages:** Open Graph tags

## Meta Tags Generated

### Essential Tags
- `og:title` - Article title
- `og:description` - Article excerpt/description
- `og:image` - Featured image or default OG image
- `og:url` - Canonical article URL
- `og:type` - Set to "article"
- `og:site_name` - "Bengali News Time"

### Article-Specific Tags
- `article:author` - Author name
- `article:published_time` - Publication date
- `article:section` - Article category
- `article:tag` - Article tags

### Twitter Tags
- `twitter:card` - "summary_large_image"
- `twitter:title` - Article title
- `twitter:description` - Article description
- `twitter:image` - Featured image
- `twitter:site` - "@bengalinewstime"

## Testing Social Media Sharing

### Facebook Sharing Debugger
1. Visit: https://developers.facebook.com/tools/debug/
2. Enter article URL: `https://your-domain.com/article/article-slug`
3. Click "Debug" to see meta tags
4. Use "Scrape Again" to refresh cache

### Twitter Card Validator
1. Visit: https://cards-dev.twitter.com/validator
2. Enter article URL
3. Preview how the card will appear

### LinkedIn Post Inspector
1. Visit: https://www.linkedin.com/post-inspector/
2. Enter article URL
3. Check how the post will appear

## Environment Variables Required

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema Requirements

The `articles` table should include:
- `slug` (text) - URL-friendly identifier
- `title` (text) - Article title
- `description` (text) - Article excerpt
- `featured_image` (text) - Image URL
- `author_name` (text) - Author name
- `category` (text) - Article category
- `created_at` (timestamp) - Creation date
- `published_at` (timestamp) - Publication date
- `status` (text) - Publication status

## Performance Considerations

### Edge Function Benefits
- **Global Distribution:** Runs at edge locations worldwide
- **Fast Response:** No cold starts, instant response
- **SEO Friendly:** Search engines get proper meta tags
- **Cost Effective:** Only runs for social media crawlers

### Caching Strategy
- **CDN Caching:** 1 hour cache for meta tag responses
- **Browser Caching:** Meta tags cached by social platforms
- **Database Caching:** Supabase handles query optimization

## Troubleshooting

### Common Issues
1. **Meta tags not updating:** Clear social platform cache
2. **Image not displaying:** Check image URL accessibility
3. **Wrong title/description:** Verify database content
4. **Crawler not detected:** Check User-Agent patterns

### Debug Steps
1. Test Edge function directly: `/api/article/[slug]`
2. Check Vercel function logs
3. Verify Supabase data
4. Test with social media debuggers

## Future Enhancements

### Planned Features
- Dynamic OG image generation
- A/B testing for meta tags
- Analytics for social shares
- Multi-language meta tags
- Rich snippets for Google

### Monitoring
- Track social media referrals
- Monitor click-through rates
- Analyze sharing patterns
- Performance metrics collection

## Maintenance

### Regular Tasks
- Update social platform User-Agent patterns
- Refresh default OG image design
- Monitor meta tag performance
- Update platform-specific requirements

### Security Considerations
- Validate article slug input
- Sanitize meta tag content
- Rate limiting for Edge function
- Monitor for abuse patterns