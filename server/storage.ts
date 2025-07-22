import { supabase } from '@db';

export const storage = {
  // Category operations
  async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getCategoryBySlug(slug: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createCategory(data: any) {
    const { data: category, error } = await supabase
      .from('categories')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return category;
  },

  // Article operations
  async getAllArticles(limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  },

  async getFeaturedArticles(limit = 5) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getLatestArticles(limit = 10) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getPopularArticles(limit = 5) {
    // Get articles ordered by view_count (most read first)
    // Only return articles with non-null view counts that actually exist
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .not('view_count', 'is', null)
      .gte('view_count', 1)
      .order('view_count', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching popular articles:', error);
      throw error;
    }
    
    // If no articles with view counts exist, initialize some with view counts
    if (!data || data.length === 0) {
      console.log('[Storage] No articles with view counts found, initializing some...');
      
      // Get the first few articles and give them initial view counts
      const { data: allArticles, error: allError } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (allError) {
        console.error('Error fetching articles for initialization:', allError);
        return [];
      }
      
      if (allArticles && allArticles.length > 0) {
        // Give the articles some initial view counts (1-10 views)
        for (let i = 0; i < allArticles.length; i++) {
          const initialViews = Math.floor(Math.random() * 10) + 1;
          await supabase
            .from('articles')
            .update({ view_count: initialViews })
            .eq('id', allArticles[i].id);
          allArticles[i].view_count = initialViews;
        }
        
        // Sort by view count and return
        allArticles.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        return allArticles;
      }
    }
    
    return data || [];
  },

  async getArticlesByCategory(categoryId: number, limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('category_id', categoryId)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  },

  async getArticlesByCategorySlug(categorySlug: string, limit = 10, offset = 0) {
    try {
      console.log(`[Storage] Fetching articles for category: ${categorySlug}, limit: ${limit}, offset: ${offset}`);
      
      // First get the category ID
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', categorySlug)
        .single();
      
      if (categoryError) {
        console.error(`[Storage] Category lookup error for slug '${categorySlug}':`, categoryError);
        if (categoryError.code === 'PGRST116') {
          console.log(`[Storage] Category '${categorySlug}' not found`);
          return [];
        }
        throw categoryError;
      }
      
      if (!category) {
        console.log(`[Storage] No category found for slug: ${categorySlug}`);
        return [];
      }
      
      console.log(`[Storage] Found category:`, category);
      
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', category.id)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error(`[Storage] Articles fetch error for category ${category.id}:`, error);
        throw error;
      }
      
      console.log(`[Storage] Found ${data?.length || 0} articles for category '${categorySlug}'`);
      return data || [];
    } catch (error) {
      console.error(`[Storage] getArticlesByCategorySlug failed for '${categorySlug}':`, error);
      throw error;
    }
  },

  async getArticleBySlug(slug: string) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      // Increment view count
      await supabase
        .from('articles')
        .update({ view_count: data.view_count + 1 })
        .eq('id', data.id);
    }
    
    return data;
  },
  
  async getArticleById(id: number) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async searchArticles(query: string, limit = 10, offset = 0) {
    console.log('Searching for:', query);
    
    try {
      // Create common English to Bengali word mappings for better search
      const searchTerms = [query.toLowerCase()];
      const commonMappings: { [key: string]: string } = {
        'bangladesh': 'বাংলাদেশ',
        'cricket': 'ক্রিকেট',
        'politics': 'রাজনীতি',
        'economy': 'অর্থনীতি',
        'international': 'আন্তর্জাতিক',
        'sports': 'খেলা',
        'entertainment': 'বিনোদন',
        'technology': 'প্রযুক্তি',
        'health': 'স্বাস্থ্য',
        'education': 'শিক্ষা',
        'lifestyle': 'লাইফস্টাইল',
        'food': 'খাদ্য',
        'weather': 'আবহাওয়া',
        'news': 'সংবাদ',
        'government': 'সরকার',
        'minister': 'মন্ত্রী',
        'president': 'রাষ্ট্রপতি',
        'prime': 'প্রধান',
        'dhaka': 'ঢাকা',
        'chittagong': 'চট্টগ্রাম',
        'sylhet': 'সিলেট',
        'rajshahi': 'রাজশাহী',
        'khulna': 'খুলনা',
        'barisal': 'বরিশাল',
        'rangpur': 'রংপুর',
        'mymensingh': 'ময়মনসিংহ'
      };

      // Add Bengali equivalent if found
      if (commonMappings[query.toLowerCase()]) {
        searchTerms.push(commonMappings[query.toLowerCase()]);
      }

      // Search in both title and content with OR condition for all terms
      const { data: results, error } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(*)
        `)
        .or(
          searchTerms.map(term => 
            `title.ilike.%${term}%,content.ilike.%${term}%,excerpt.ilike.%${term}%`
          ).join(',')
        )
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      console.log('Search results:', results?.length || 0);
      
      if (error) {
        console.error('Search error:', error);
        return [];
      }
      
      return results || [];
    } catch (err) {
      console.error('Search function error:', err);
      throw err;
    }
  },

  async createArticle(data: any) {
    const { data: article, error } = await supabase
      .from('articles')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return article;
  },
  
  async updateArticle(id: number, data: any) {
    const { data: article, error } = await supabase
      .from('articles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return article;
  },

  async deleteArticle(id: number) {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // E-paper operations
  async getAllEPapers(limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('epapers')
      .select('*')
      .order('publish_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  },

  async getLatestEPaper() {
    const { data, error } = await supabase
      .from('epapers')
      .select('*')
      .order('publish_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createEPaper(data: any) {
    const { data: epaper, error } = await supabase
      .from('epapers')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return epaper;
  },

  // Weather operations
  async getAllWeather() {
    const { data, error } = await supabase
      .from('weather')
      .select('*')
      .order('city');
    
    if (error) throw error;
    return data || [];
  },

  async getWeatherByCity(city: string) {
    const { data, error } = await supabase
      .from('weather')
      .select('*')
      .eq('city', city)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateWeather(city: string, data: any) {
    const { data: weather, error } = await supabase
      .from('weather')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('city', city)
      .select()
      .single();
    
    if (error) throw error;
    return weather;
  },

  async createWeather(data: any) {
    const { data: weather, error } = await supabase
      .from('weather')
      .insert({ ...data, updated_at: new Date().toISOString() })
      .select()
      .single();
    
    if (error) throw error;
    return weather;
  },

  async upsertWeather(city: string, data: any) {
    try {
      // First try to update
      const existing = await this.getWeatherByCity(city);
      
      if (existing) {
        console.log(`[Storage] Updating existing weather for ${city}`);
        return await this.updateWeather(city, data);
      } else {
        console.log(`[Storage] Creating new weather entry for ${city}`);
        return await this.createWeather({ ...data, city });
      }
    } catch (error) {
      console.error(`[Storage] Error upserting weather for ${city}:`, error);
      throw error;
    }
  },

  // Breaking news operations
  async getActiveBreakingNews() {
    const { data, error } = await supabase
      .from('breaking_news')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createBreakingNews(data: any) {
    const { data: breakingNews, error } = await supabase
      .from('breaking_news')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return breakingNews;
  },

  // User operations
  async getUserByEmail(email: string) {
    // For Supabase auth, we get user from auth.users, not a custom users table
    const { data, error } = await supabase.auth.admin.getUserByEmail(email);
    
    if (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
    
    return data.user;
  },

  async getUserById(id: string) {
    // For Supabase auth, get user by ID from auth.users
    const { data, error } = await supabase.auth.admin.getUserById(id);
    
    if (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
    
    return data.user;
  },



  // Video Content operations
  async getVideoContent(limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('video_content')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  },

  async getVideoBySlug(slug: string) {
    const { data, error } = await supabase
      .from('video_content')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createVideoContent(data: any) {
    const { data: video, error } = await supabase
      .from('video_content')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return video;
  },

  async updateVideoContent(id: number, data: any) {
    const { data: video, error } = await supabase
      .from('video_content')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return video;
  },

  async deleteVideoContent(id: number) {
    const { error } = await supabase
      .from('video_content')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Audio Articles operations
  async getAudioArticles(limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('audio_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  },

  async getAudioArticleBySlug(slug: string) {
    const { data, error } = await supabase
      .from('audio_articles')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createAudioArticle(data: any) {
    const { data: audio, error } = await supabase
      .from('audio_articles')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return audio;
  },

  async updateAudioArticle(id: number, data: any) {
    const { data: audio, error } = await supabase
      .from('audio_articles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return audio;
  },

  async deleteAudioArticle(id: number) {
    const { error } = await supabase
      .from('audio_articles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Social Media Posts operations
  async getSocialMediaPosts(limit = 10, platforms?: string[]) {
    try {
      let query = supabase
        .from('social_media_posts')
        .select('*');
      
      if (platforms && platforms.length > 0) {
        query = query.in('platform', platforms);
      }
      
      const { data, error } = await query
        .order('published_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        // If table doesn't exist, return mock data
        if (error.code === '42P01') {
          console.log('Social media posts table not found, returning mock data');
          const mockData = [
            {
              id: 1,
              platform: 'facebook',
              content: 'সর্বশেষ খবর: বাংলাদেশে নতুন উন্নয়ন প্রকল্প শুরু',
              embed_code: '<div class="social-post-placeholder">Facebook embed placeholder</div>',
              published_at: new Date().toISOString()
            },
            {
              id: 2,
              platform: 'twitter',
              content: 'ব্রেকিং: আজকের গুরুত্বপূর্ণ সংবাদ',
              embed_code: '<div class="social-post-placeholder">Twitter embed placeholder</div>',
              published_at: new Date().toISOString()
            },
            {
              id: 3,
              platform: 'instagram',
              content: 'আজকের বিশেষ মুহূর্তের ছবি',
              embed_code: '<div class="social-post-placeholder">Instagram embed placeholder</div>',
              published_at: new Date().toISOString()
            }
          ];

          if (platforms && platforms.length > 0) {
            return mockData.filter(post => platforms.includes(post.platform));
          }

          return mockData.slice(0, limit);
        }
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching social media posts:', error);
      return [];
    }
  },

  async createSocialMediaPost(data: any) {
    const { data: post, error } = await supabase
      .from('social_media_posts')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return post;
  },

  async updateSocialMediaPost(id: number, data: any) {
    const { data: post, error } = await supabase
      .from('social_media_posts')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return post;
  },

  async deleteSocialMediaPost(id: number) {
    const { error } = await supabase
      .from('social_media_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Admin-specific operations
  
  // Category management
  async updateCategory(id: number, data: any) {
    const { data: category, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return category;
  },

  async deleteCategory(id: number) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // E-Paper management
  async updateEPaper(id: number, data: any) {
    const { data: epaper, error } = await supabase
      .from('epapers')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return epaper;
  },

  async deleteEPaper(id: number) {
    const { error } = await supabase
      .from('epapers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async setLatestEPaper(id: number) {
    // First, set all epapers to not latest
    await supabase
      .from('epapers')
      .update({ is_latest: false });
    
    // Then set the specified one as latest
    const { error } = await supabase
      .from('epapers')
      .update({ is_latest: true })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Breaking News management
  async updateBreakingNews(id: number, data: any) {
    const { data: news, error } = await supabase
      .from('breaking_news')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return news;
  },

  async deleteBreakingNews(id: number) {
    const { error } = await supabase
      .from('breaking_news')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Weather management
  async createWeather(data: any) {
    const { data: weather, error } = await supabase
      .from('weather')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return weather;
  },

  // User management
  async getAllUsers() {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    return data.users;
  },

  async updateUserRole(id: string, role: string) {
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { role }
    });
    
    if (error) throw error;
    return data.user;
  },

  async deleteUser(id: string) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    
    if (error) throw error;
  },

  async getUserStats() {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.user_metadata?.role === 'admin').length;
    const activeUsers = users.filter(u => {
      const lastSignIn = new Date(u.last_sign_in_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastSignIn > thirtyDaysAgo;
    }).length;
    const newUsers = users.filter(u => {
      const createdAt = new Date(u.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdAt > sevenDaysAgo;
    }).length;
    
    return { totalUsers, adminUsers, activeUsers, newUsers };
  },

  // Dashboard stats
  async getDashboardStats() {
    const [articles, users, epapers, breakingNews] = await Promise.all([
      this.getAllArticles(),
      this.getAllUsers(),
      this.getAllEPapers(),
      this.getActiveBreakingNews()
    ]);
    
    return {
      totalArticles: articles.length,
      totalUsers: users.length,
      totalEpapers: epapers.length,
      activeBreakingNews: breakingNews.length,
      totalViews: articles.reduce((sum, a) => sum + (a.view_count || 0), 0)
    };
  },

  async getArticleStats() {
    const articles = await this.getAllArticles();
    
    const totalArticles = articles.length;
    const featuredArticles = articles.filter(a => a.is_featured).length;
    const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0);
    const publishedToday = articles.filter(a => {
      const publishDate = new Date(a.published_at);
      const today = new Date();
      return publishDate.toDateString() === today.toDateString();
    }).length;
    
    return { totalArticles, featuredArticles, totalViews, publishedToday };
  },

  async getRecentActivity() {
    // Get recent articles, breaking news, and epapers
    const [articles, breakingNews, epapers] = await Promise.all([
      supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('breaking_news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('epapers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);
    
    const activities = [];
    
    // Add articles
    articles.data?.forEach(article => {
      activities.push({
        id: `article-${article.id}`,
        action: 'Article published',
        title: article.title,
        time: this.formatRelativeTime(article.created_at),
        created_at: article.created_at
      });
    });
    
    // Add breaking news
    breakingNews.data?.forEach(news => {
      activities.push({
        id: `breaking-${news.id}`,
        action: 'Breaking news added',
        title: news.content.substring(0, 50) + '...',
        time: this.formatRelativeTime(news.created_at),
        created_at: news.created_at
      });
    });
    
    // Add epapers
    epapers.data?.forEach(epaper => {
      activities.push({
        id: `epaper-${epaper.id}`,
        action: 'E-paper uploaded',
        title: epaper.title,
        time: this.formatRelativeTime(epaper.created_at),
        created_at: epaper.created_at
      });
    });
    
    // Sort by creation time and return top 10
    return activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  },

  // Helper method for time formatting
  formatRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      return `${diffInMinutes} মিনিট আগে`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ঘন্টা আগে`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} দিন আগে`;
    }
  }
};