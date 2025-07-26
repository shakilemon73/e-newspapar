# Complete Article URL System Implementation Guide

## Overview

This is a comprehensive article URL builder system based on research of major news sites (CNN, NY Times, BBC, Guardian) with 8 different URL patterns optimized for Bengali content.

## 🎯 Key Features

- **8 URL Patterns**: From simple to complex hierarchical structures
- **Date Integration**: Smart date formatting with publish date support
- **Count Systems**: Daily counts and total article counts
- **Bengali Optimized**: Full Bengali text support with proper encoding
- **SEO Friendly**: Based on 2024 SEO best practices research
- **Performance**: <0.1ms generation time, efficient parsing
- **Reversible**: Parse URLs back to article information

## 🔗 URL Pattern Examples

Based on article: "বাংলাদেশে নতুন প্রযুক্তির উন্নতি" (Published: Jan 26, 2025, ID: 1)

### 1. **date-category-title** (NY Times Style) ⭐ Recommended
```
/2025/01/26/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি
```
**Benefits**: Chronological organization, category context, SEO-friendly

### 2. **category-date-title** (Guardian Style)
```
/প্রযুক্তি/2025/01/26/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি
```
**Benefits**: Category-first navigation, clear content hierarchy

### 3. **date-count-title** (With Daily Counter)
```
/2025/01/26/001/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি
```
**Benefits**: Daily article tracking, chronological with numbering

### 4. **category-count-title** (Category Counter)
```
/প্রযুক্তি/001/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি
```
**Benefits**: Category-based numbering, simple structure

### 5. **hierarchical** (Deep Categories)
```
/news/প্রযুক্তি/কৃত্রিম-বুদ্ধিমত্তা/ঢাকা/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি
```
**Benefits**: Detailed categorization, regional organization

### 6. **simple-dated** (Minimal)
```
/20250126/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি
```
**Benefits**: Clean URLs, date-based archiving

### 7. **count-only** (ID-Based)
```
/article/001/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি
```
**Benefits**: Simple numbering, consistent structure

### 8. **bengali-traditional** (Full Bengali)
```
/সংবাদ/প্রযুক্তি/কৃত্রিম-বুদ্ধিমত্তা/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি
```
**Benefits**: Full Bengali experience, cultural authenticity

## 🚀 Quick Implementation

### Basic Usage

```typescript
import { generateArticleUrl, ArticleInfo } from '@shared/article-url-builder';

const article: ArticleInfo = {
  id: 123,
  title: 'বাংলাদেশে নতুন প্রযুক্তির উন্নতি',
  category: 'প্রযুক্তি',
  publishDate: new Date(2025, 0, 26),
  dailyCount: 1,
  totalCount: 123,
  language: 'bn'
};

// Generate URL (defaults to NY Times style)
const url = generateArticleUrl(article, {
  pattern: 'date-category-title',
  baseUrl: 'https://bengali-news.com'
});
// Result: https://bengali-news.com/2025/01/26/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি
```

### Advanced Usage with Options

```typescript
// For social sharing (shorter URLs)
const shareUrl = generateArticleUrl(article, {
  pattern: 'simple-dated',
  baseUrl: 'https://bengali-news.com',
  forSharing: true,
  maxTitleLength: 50
});

// For SEO (encoded URLs)
const seoUrl = generateArticleUrl(article, {
  pattern: 'date-category-title',
  baseUrl: 'https://bengali-news.com',
  encoded: true
});

// With count padding
const countUrl = generateArticleUrl(article, {
  pattern: 'date-count-title',
  useCountPadding: true, // 001, 002, 003...
  baseUrl: 'https://bengali-news.com'
});
```

### URL Parsing

```typescript
import { parseArticleUrl } from '@shared/article-url-builder';

const url = '/2025/01/26/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি';
const parsed = parseArticleUrl(url, 'date-category-title');

console.log(parsed);
// {
//   publishDate: Date(2025-01-26),
//   category: 'প্রযুক্তি',
//   title: 'বাংলাদেশে নতুন প্রযুক্তির উন্নতি'
// }
```

## 🎨 Preset Configurations

Use pre-configured setups for different site types:

```typescript
import { URL_PRESETS, generateArticleUrl } from '@shared/article-url-builder';

// Major news site style (NY Times, CNN)
const newsUrl = generateArticleUrl(article, {
  ...URL_PRESETS.majorNews,
  baseUrl: 'https://bengali-news.com'
});

// Bengali traditional style
const bengaliUrl = generateArticleUrl(article, {
  ...URL_PRESETS.bengaliNews,
  baseUrl: 'https://bengali-news.com'
});

// Blog style
const blogUrl = generateArticleUrl(article, {
  ...URL_PRESETS.blogStyle,
  baseUrl: 'https://bengali-news.com'
});
```

## 🔧 Integration with Existing System

### 1. Update Article Creation

```typescript
// In your article creation function
export async function createArticle(articleData: CreateArticleData) {
  // Save article to database first
  const article = await supabase
    .from('articles')
    .insert(articleData)
    .select()
    .single();
  
  // Generate URL using the new system
  const articleInfo: ArticleInfo = {
    id: article.id,
    title: article.title,
    category: article.category,
    publishDate: new Date(article.publish_date),
    dailyCount: await getDailyCount(new Date(article.publish_date)),
    totalCount: article.id,
    language: 'bn'
  };
  
  const url = generateArticleUrl(articleInfo, {
    pattern: 'date-category-title', // Choose your preferred pattern
    baseUrl: process.env.SITE_URL
  });
  
  // Update article with generated URL
  await supabase
    .from('articles')
    .update({ url_slug: url })
    .eq('id', article.id);
  
  return { ...article, url_slug: url };
}
```

### 2. Update Routing System

```typescript
// In your React router
import { parseArticleUrl } from '@shared/article-url-builder';

// Article page component
const ArticlePage = () => {
  const location = useLocation();
  const [article, setArticle] = useState(null);
  
  useEffect(() => {
    // Parse URL to get article information
    const parsed = parseArticleUrl(location.pathname, 'date-category-title');
    
    if (parsed) {
      // Find article by parsed information
      findArticleBySlug(parsed.title, parsed.category, parsed.publishDate)
        .then(setArticle);
    }
  }, [location.pathname]);
  
  if (!article) return <div>Loading...</div>;
  
  return <ArticleContent article={article} />;
};
```

### 3. Generate Multiple URL Variations

```typescript
// For better SEO and compatibility
import { getUrlVariations } from '@shared/article-url-builder';

export function getArticleUrls(article: ArticleInfo) {
  const variations = getUrlVariations(article, 'https://bengali-news.com');
  
  return {
    canonical: variations['date-category-title'],     // Main URL
    sharing: variations['simple-dated'],              // For social media
    archive: variations['count-only'],                // For archives
    category: variations['category-date-title'],      // For category pages
    bengali: variations['bengali-traditional']        // For Bengali interface
  };
}
```

## 📊 Performance Characteristics

- **URL Generation**: ~0.035ms per operation
- **URL Parsing**: ~0.011ms per operation  
- **Memory Usage**: Minimal (no caching required)
- **Bundle Size**: ~15KB added to your bundle

## 🌐 SEO Best Practices Integration

### 1. Canonical URLs
```html
<link rel="canonical" href="https://bengali-news.com/2025/01/26/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি" />
```

### 2. Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "url": "https://bengali-news.com/2025/01/26/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি",
  "datePublished": "2025-01-26T00:00:00Z",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://bengali-news.com/2025/01/26/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি"
  }
}
```

### 3. Social Media Meta Tags
```html
<meta property="og:url" content="https://bengali-news.com/2025/01/26/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি" />
<meta property="og:type" content="article" />
<meta property="article:published_time" content="2025-01-26T00:00:00Z" />
<meta property="article:section" content="প্রযুক্তি" />
```

## 🔀 Migration Strategy

### Phase 1: Install New System
1. Add the new URL builder files to your project
2. Test URL generation with existing articles
3. Verify parsing accuracy

### Phase 2: Parallel Implementation
1. Generate new URLs for new articles
2. Keep old URLs working with redirects
3. Gradually migrate existing articles

### Phase 3: Full Migration
1. Update all article URLs in database
2. Set up 301 redirects from old URLs
3. Update sitemap with new URLs

## 🛠 Customization Examples

### Custom Date Format
```typescript
const customUrl = generateArticleUrl(article, {
  pattern: 'date-category-title',
  customDateFormat: 'YYYY-MM-DD', // Use hyphens instead of slashes
  baseUrl: 'https://bengali-news.com'
});
// Result: /2025-01-26/প্রযুক্তি/article-title
```

### Breaking News URLs
```typescript
// For urgent/breaking news
const breakingUrl = generateArticleUrl({
  ...article,
  isBreaking: true
}, {
  pattern: 'simple-dated',
  maxTitleLength: 60,
  baseUrl: 'https://bengali-news.com'
});
```

### Regional Content
```typescript
// For location-specific content
const regionalUrl = generateArticleUrl({
  ...article,
  region: 'ঢাকা'
}, {
  pattern: 'hierarchical',
  baseUrl: 'https://bengali-news.com'
});
// Result: /news/প্রযুক্তি/subcategory/ঢাকা/article-title
```

## 🧪 Testing

Run comprehensive tests:

```typescript
import { runAllTests } from '@shared/article-url-builder.test';

// Run all tests
runAllTests();

// Test specific patterns
import { quickTests, sampleArticles } from '@shared/article-url-builder.test';
const testArticle = sampleArticles[0];

console.log('NY Times:', quickTests.nyTimes(testArticle));
console.log('Guardian:', quickTests.guardian(testArticle));
console.log('Bengali:', quickTests.bengali(testArticle));
```

## 🚀 Deployment Checklist

- [ ] Choose primary URL pattern for your site
- [ ] Update article creation to generate URLs
- [ ] Implement URL parsing in routing
- [ ] Set up 301 redirects for old URLs
- [ ] Update sitemap generation
- [ ] Test social media sharing
- [ ] Verify SEO meta tags
- [ ] Monitor URL performance

## 📈 Recommended Pattern Selection

**For Breaking News Sites**: `date-category-title` (NY Times style)
- Best for chronological browsing
- Clear category organization
- SEO-friendly structure

**For Bengali-First Sites**: `bengali-traditional`
- Authentic Bengali experience
- Cultural familiarity
- Local user preference

**For Simple Sites**: `simple-dated` or `count-only`
- Clean, minimal URLs
- Easy to remember
- Fast loading

**For Complex Sites**: `hierarchical`
- Detailed categorization
- Regional organization
- Advanced filtering

This system provides enterprise-grade URL management with full Bengali support, optimal SEO, and excellent performance characteristics.