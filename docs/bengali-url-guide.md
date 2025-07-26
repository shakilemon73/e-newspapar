# Bengali URL Slug Utilities Guide

This guide explains how to use the enhanced Bengali URL slug utilities for handling Bengali text in URLs effectively.

## Core Functions

### 1. `generateBengaliSlug(title, options)`
Creates clean, URL-safe Bengali slugs from titles.

**Parameters:**
- `title` (string): The Bengali title to convert
- `options` (object, optional):
  - `maxLength` (number, default: 150): Maximum slug length
  - `includeEnglish` (boolean, default: true): Whether to allow English characters
  - `fallbackToId` (number): Article ID for fallback if slug is invalid

**Example:**
```typescript
const slug = generateBengaliSlug('বাংলাদেশে নতুন প্রযুক্তির উন্নতি');
// Result: 'বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি'

const shortSlug = generateBengaliSlug('খুব দীর্ঘ একটি শিরোনাম যা অনেক বড়', {
  maxLength: 20,
  fallbackToId: 123
});
// Result: 'খুব-দীর্ঘ-একটি-শিরোনাম' or 'article-123' if too short
```

### 2. `encodeBengaliSlug(slug, preserveDisplay)`
Encodes Bengali slugs for URL compatibility.

**Parameters:**
- `slug` (string): The slug to encode
- `preserveDisplay` (boolean, default: false): Whether to preserve readability

**Example:**
```typescript
const slug = 'বাংলাদেশে-নতুন-প্রযুক্তি';
const encoded = encodeBengaliSlug(slug);
// Result: '%E0%A6%AC%E0%A6%BE%E0%A6%82...'

const displayEncoded = encodeBengaliSlug(slug, true);
// Result: 'বাংলাদেশে-নতুন-প্রযুক্তি' (only special chars encoded)
```

### 3. `decodeBengaliSlug(encodedSlug)`
Safely decodes Bengali slugs from URLs.

**Example:**
```typescript
const encoded = '%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6';
const decoded = decodeBengaliSlug(encoded);
// Result: 'বাংলাদেশ'
```

### 4. `createFriendlyBengaliUrl(title, options)`
Creates user-friendly display URLs.

**Parameters:**
- `title` (string): Article title
- `options` (object, optional):
  - `baseUrl` (string): Base URL of the site
  - `articleId` (number): Article ID for fallback
  - `includeEnglish` (boolean, default: true): Allow English characters
  - `forSharing` (boolean, default: false): Optimize for sharing

**Example:**
```typescript
const url = createFriendlyBengaliUrl('ঢাকায় আজকের আবহাওয়া', {
  baseUrl: 'https://bengali-news.com',
  articleId: 456,
  forSharing: true
});
// Result: 'https://bengali-news.com/article/ঢাকায়-আজকের-আবহাওয়া'
```

## Advanced Functions

### 5. `generateSeoFriendlyUrl(title, category, articleId)`
Creates comprehensive URL structures for SEO optimization.

**Returns:**
- `displayUrl`: Clean URL for display
- `routeUrl`: Encoded URL for routing
- `shareUrl`: Optimized URL for sharing

**Example:**
```typescript
const urls = generateSeoFriendlyUrl(
  'বাংলাদেশে নতুন প্রযুক্তি', 
  'প্রযুক্তি', 
  789
);
console.log(urls);
// {
//   displayUrl: '/article/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তি',
//   routeUrl: '/article/%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%AF%E0%A7%81%E0%A6%95%E0%A7%8D%E0%A6%A4%E0%A6%BF/...',
//   shareUrl: '/article/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তি'
// }
```

### 6. `parseBengaliUrl(url)`
Extracts information from Bengali URLs.

**Example:**
```typescript
const parsed = parseBengaliUrl('/article/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তি');
console.log(parsed);
// {
//   slug: 'বাংলাদেশে-নতুন-প্রযুক্তি',
//   decodedSlug: 'বাংলাদেশে-নতুন-প্রযুক্তি',
//   category: 'প্রযুক্তি'
// }
```

### 7. `createBengaliBreadcrumbs(url, baseUrl)`
Generates breadcrumb navigation from URLs.

**Example:**
```typescript
const breadcrumbs = createBengaliBreadcrumbs(
  '/article/খেলা/ক্রিকেট-ম্যাচ-আজ',
  'https://bengali-news.com'
);
console.log(breadcrumbs);
// [
//   { title: 'হোম', url: 'https://bengali-news.com/', isActive: false },
//   { title: 'খেলা', url: 'https://bengali-news.com/category/খেলা', isActive: false },
//   { title: 'ক্রিকেট ম্যাচ আজ', url: '/article/খেলা/ক্রিকেট-ম্যাচ-আজ', isActive: true }
// ]
```

### 8. `generateAlternateUrls(title, articleId)`
Creates multiple URL format options for compatibility.

**Example:**
```typescript
const alternates = generateAlternateUrls('বাংলাদেশ vs ভারত', 101);
console.log(alternates);
// {
//   bengaliOnly: '/article/বাংলাদেশ-vs-ভারত',
//   mixed: '/article/বাংলাদেশ-vs-ভারত',
//   fallback: '/article/article-101',
//   encoded: '/article/%E0%A6%AC%E0%A6%BE%E0%A6%82...'
// }
```

## Utility Functions

### 9. `isValidBengaliSlug(slug)`
Validates Bengali slug format.

### 10. `normalizeBengaliText(text)`
Normalizes Bengali text for consistent processing.

## Best Practices

### 1. **URL Structure Strategy**
```typescript
// For navigation and display
const displayUrl = generateSeoFriendlyUrl(title, category, id).displayUrl;

// For actual routing
const routeUrl = generateSeoFriendlyUrl(title, category, id).routeUrl;

// For social sharing
const shareUrl = createFriendlyBengaliUrl(title, { forSharing: true });
```

### 2. **Error Handling**
```typescript
function safeSlugGeneration(title: string, articleId: number) {
  try {
    const slug = generateBengaliSlug(title, { 
      fallbackToId: articleId,
      maxLength: 100 
    });
    
    if (!isValidBengaliSlug(slug)) {
      return `article-${articleId}`;
    }
    
    return slug;
  } catch (error) {
    console.error('Slug generation failed:', error);
    return `article-${articleId}`;
  }
}
```

### 3. **SEO Optimization**
```typescript
// Use structured URLs with categories
const seoUrl = generateSeoFriendlyUrl(
  articleTitle,
  articleCategory,
  articleId
);

// Generate meta tags
const metaTags = {
  canonical: seoUrl.shareUrl,
  alternate: generateAlternateUrls(articleTitle, articleId)
};
```

### 4. **Browser Compatibility**
```typescript
// Check browser support for Unicode URLs
function getBestUrlFormat(title: string, articleId: number) {
  const userAgent = navigator.userAgent;
  const isOldBrowser = /MSIE|Trident/.test(userAgent);
  
  if (isOldBrowser) {
    return generateAlternateUrls(title, articleId).fallback;
  }
  
  return createFriendlyBengaliUrl(title, { articleId });
}
```

## Common Issues and Solutions

### Issue 1: URLs not displaying correctly in browsers
**Solution:** Use `preserveDisplay: true` in encoding functions:
```typescript
const displayUrl = encodeBengaliSlug(slug, true);
```

### Issue 2: Routing failures with Bengali characters
**Solution:** Use fully encoded URLs for routing:
```typescript
const routeUrl = encodeBengaliSlug(slug, false);
```

### Issue 3: Social media sharing problems
**Solution:** Generate specific sharing URLs:
```typescript
const shareUrl = createFriendlyBengaliUrl(title, { forSharing: true });
```

### Issue 4: Search engine indexing issues
**Solution:** Provide alternate URL formats:
```typescript
const alternates = generateAlternateUrls(title, articleId);
// Use alternates.fallback for search engines if needed
```

## Integration Examples

### With React Router
```typescript
import { generateSeoFriendlyUrl, parseBengaliUrl } from '@shared/slug-utils';

// In your route component
const ArticlePage = () => {
  const { slug } = useParams();
  const parsed = parseBengaliUrl(`/article/${slug}`);
  
  // Use parsed.decodedSlug to find the article
  const article = useQuery(['article', parsed?.decodedSlug]);
  
  return <ArticleContent article={article.data} />;
};
```

### With Next.js
```typescript
// pages/article/[...slug].tsx
export async function getServerSideProps({ params }) {
  const url = `/article/${params.slug.join('/')}`;
  const parsed = parseBengaliUrl(url);
  
  if (!parsed) {
    return { notFound: true };
  }
  
  const article = await fetchArticleBySlug(parsed.decodedSlug);
  
  return {
    props: { article }
  };
}
```

This enhanced Bengali URL slug system provides robust, SEO-friendly, and user-friendly URL handling for Bengali content while maintaining compatibility across different browsers and platforms.