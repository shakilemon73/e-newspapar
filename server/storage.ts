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
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .order('view_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
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
    // First get the category ID
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    
    if (categoryError) throw categoryError;
    if (!category) return [];
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('category_id', category.id)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
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
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getUserById(id: number) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUserRole(id: number, role: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};