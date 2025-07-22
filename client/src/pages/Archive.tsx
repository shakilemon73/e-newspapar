import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Archive as ArchiveIcon, Search, Calendar, Eye, Filter, FileText } from 'lucide-react';
import { DateFormatter } from '@/components/DateFormatter';
import { Link } from 'wouter';
import supabase from '@/lib/supabase';

interface ArchiveArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  published_at: string;
  view_count: number;
}

interface ArchiveStats {
  total_articles: number;
  categories_count: number;
  date_range: {
    earliest: string;
    latest: string;
  };
}

export default function Archive() {
  const [articles, setArticles] = useState<ArchiveArticle[]>([]);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 20;

  const categories = [
    { id: 'all', name: 'সব ক্যাটেগরি' },
    { id: 'politics', name: 'রাজনীতি' },
    { id: 'economy', name: 'অর্থনীতি' },
    { id: 'international', name: 'আন্তর্জাতিক' },
    { id: 'sports', name: 'খেলা' },
    { id: 'entertainment', name: 'বিনোদন' },
    { id: 'technology', name: 'প্রযুক্তি' },
    { id: 'lifestyle', name: 'লাইফস্টাইল' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => 2025 - i);
  const months = [
    { value: 'all', label: 'সব মাস' },
    { value: '01', label: 'জানুয়ারি' },
    { value: '02', label: 'ফেব্রুয়ারি' },
    { value: '03', label: 'মার্চ' },
    { value: '04', label: 'এপ্রিল' },
    { value: '05', label: 'মে' },
    { value: '06', label: 'জুন' },
    { value: '07', label: 'জুলাই' },
    { value: '08', label: 'আগস্ট' },
    { value: '09', label: 'সেপ্টেম্বর' },
    { value: '10', label: 'অক্টোবর' },
    { value: '11', label: 'নভেম্বর' },
    { value: '12', label: 'ডিসেম্বর' }
  ];

  useEffect(() => {
    fetchArchiveData();
  }, [selectedCategory, selectedYear, selectedMonth, searchQuery, currentPage]);

  const fetchArchiveData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query for articles
      let query = supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          view_count,
          categories!inner (
            id,
            name,
            slug
          )
        `)
        .order('published_at', { ascending: false });

      // Apply filters
      if (selectedCategory !== 'all') {
        query = query.eq('categories.slug', selectedCategory);
      }

      if (selectedYear !== 'all') {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        query = query.gte('published_at', startDate).lte('published_at', endDate);
      }

      if (selectedMonth !== 'all' && selectedYear !== 'all') {
        const startDate = `${selectedYear}-${selectedMonth}-01`;
        const endDate = `${selectedYear}-${selectedMonth}-31`;
        query = query.gte('published_at', startDate).lte('published_at', endDate);
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }

      // Pagination
      const from = (currentPage - 1) * articlesPerPage;
      const to = from + articlesPerPage - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching archive:', error);
        // Use fallback data if table doesn't exist
        setArticles([
          {
            id: 1,
            title: 'বাংলাদেশের অর্থনৈতিক প্রবৃদ্ধি ২০২৪',
            slug: 'bangladesh-economic-growth-2024',
            excerpt: 'গত বছর বাংলাদেশের অর্থনৈতিক প্রবৃদ্ধি ৬.৫% রেকর্ড করেছে...',
            image_url: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=250&fit=crop',
            category: { id: 2, name: 'অর্থনীতি', slug: 'economy' },
            published_at: '2024-12-15T10:30:00Z',
            view_count: 15420
          },
          {
            id: 2,
            title: 'জাতীয় সংসদের নতুন আইন পাস',
            slug: 'national-parliament-new-law-passed',
            excerpt: 'জাতীয় সংসদে গুরুত্বপূর্ণ একটি আইন পাস হয়েছে...',
            image_url: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=250&fit=crop',
            category: { id: 1, name: 'রাজনীতি', slug: 'politics' },
            published_at: '2024-12-10T14:20:00Z',
            view_count: 8750
          }
        ]);
      } else {
        // Transform data to match interface
        const transformedArticles = data?.map(article => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          image_url: article.image_url,
          category: {
            id: article.categories.id,
            name: article.categories.name,
            slug: article.categories.slug
          },
          published_at: article.published_at,
          view_count: article.view_count || 0
        })) || [];
        
        setArticles(transformedArticles);
      }

      // Fetch archive statistics
      const { data: statsData, error: statsError } = await supabase
        .from('articles')
        .select('published_at, categories(id)')
        .order('published_at', { ascending: false });

      if (!statsError && statsData) {
        const totalArticles = statsData.length;
        const uniqueCategories = new Set(statsData.map(item => item.categories?.id)).size;
        const dates = statsData.map(item => item.published_at).filter(Boolean);
        
        setStats({
          total_articles: totalArticles,
          categories_count: uniqueCategories,
          date_range: {
            earliest: dates[dates.length - 1] || '2020-01-01',
            latest: dates[0] || new Date().toISOString()
          }
        });
      } else {
        setStats({
          total_articles: 2500,
          categories_count: 8,
          date_range: {
            earliest: '2020-01-01',
            latest: new Date().toISOString()
          }
        });
      }

    } catch (err) {
      console.error('Error fetching archive data:', err);
      setError('আর্কাইভ ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArchiveData();
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading && articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="h-40 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">
            <ArchiveIcon className="h-8 w-8 text-blue-500" />
            আর্কাইভ
          </h1>
          <p className="text-gray-600">পুরনো সংবাদ এবং প্রতিবেদন খুঁজুন</p>
        </div>

        {/* Archive Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total_articles.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">মোট নিবন্ধ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Filter className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.categories_count}</p>
                    <p className="text-sm text-gray-600">ক্যাটেগরি</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      <DateFormatter date={stats.date_range.earliest} />
                    </p>
                    <p className="text-xs text-gray-600">থেকে আজ পর্যন্ত</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-500" />
              অনুসন্ধান ও ফিল্টার
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">অনুসন্ধান</label>
                  <Input
                    type="text"
                    placeholder="শিরোনাম বা বিষয়বস্তু..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ক্যাটেগরি</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">বছর</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">সব বছর</option>
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">মাস</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={searching}>
                {searching ? 'খুঁজছি...' : 'অনুসন্ধান করুন'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/article/${article.slug}`}>
                <div className="aspect-video bg-gray-200">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full bg-gray-200 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
              </Link>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.category.name}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="h-3 w-3" />
                    <span>{formatViewCount(article.view_count)}</span>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  <Link href={`/article/${article.slug}`} className="hover:text-blue-600 transition-colors">
                    {article.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="text-xs text-gray-500">
                  <DateFormatter date={article.published_at} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            পূর্ববর্তী
          </Button>
          <span className="px-4 py-2 bg-gray-100 rounded">
            পৃষ্ঠা {currentPage}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={articles.length < articlesPerPage}
          >
            পরবর্তী
          </Button>
        </div>
      </div>
    </div>
  );
}