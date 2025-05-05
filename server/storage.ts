import { db } from '@db';
import { eq, desc, and, like, sql, asc, inArray } from 'drizzle-orm';
import {
  categories,
  articles,
  epapers,
  weather,
  breakingNews,
  users
} from '@shared/schema';

export const storage = {
  // Category operations
  async getAllCategories() {
    return await db.query.categories.findMany({
      orderBy: asc(categories.name)
    });
  },

  async getCategoryBySlug(slug: string) {
    return await db.query.categories.findFirst({
      where: eq(categories.slug, slug)
    });
  },

  async createCategory(data: typeof categories.$inferInsert) {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  },

  // Article operations
  async getAllArticles(limit = 10, offset = 0) {
    return await db.query.articles.findMany({
      orderBy: desc(articles.publishedAt),
      limit,
      offset,
      with: { category: true }
    });
  },

  async getFeaturedArticles(limit = 5) {
    return await db.query.articles.findMany({
      where: eq(articles.isFeatured, true),
      orderBy: desc(articles.publishedAt),
      limit,
      with: { category: true }
    });
  },

  async getLatestArticles(limit = 10) {
    return await db.query.articles.findMany({
      orderBy: desc(articles.publishedAt),
      limit,
      with: { category: true }
    });
  },

  async getPopularArticles(limit = 5) {
    return await db.query.articles.findMany({
      orderBy: desc(articles.viewCount),
      limit,
      with: { category: true }
    });
  },

  async getArticlesByCategory(categoryId: number, limit = 10, offset = 0) {
    return await db.query.articles.findMany({
      where: eq(articles.categoryId, categoryId),
      orderBy: desc(articles.publishedAt),
      limit,
      offset,
      with: { category: true }
    });
  },

  async getArticlesByCategorySlug(categorySlug: string, limit = 10, offset = 0) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug)
    });
    
    if (!category) return [];
    
    return await db.query.articles.findMany({
      where: eq(articles.categoryId, category.id),
      orderBy: desc(articles.publishedAt),
      limit,
      offset,
      with: { category: true }
    });
  },

  async getArticleBySlug(slug: string) {
    const article = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
      with: { category: true }
    });
    
    if (article) {
      // Increment view count
      await db.update(articles)
        .set({ viewCount: sql`${articles.viewCount} + 1` })
        .where(eq(articles.id, article.id));
    }
    
    return article;
  },
  
  async getArticleById(id: number) {
    return await db.query.articles.findFirst({
      where: eq(articles.id, id),
      with: { category: true }
    });
  },

  async searchArticles(query: string, limit = 10, offset = 0) {
    return await db.query.articles.findMany({
      where: like(articles.title, `%${query}%`),
      orderBy: desc(articles.publishedAt),
      limit,
      offset,
      with: { category: true }
    });
  },

  async createArticle(data: typeof articles.$inferInsert) {
    const [article] = await db.insert(articles).values(data).returning();
    return article;
  },
  
  async updateArticle(id: number, data: Partial<typeof articles.$inferInsert>) {
    const [article] = await db.update(articles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return article;
  },
  
  async deleteArticle(id: number) {
    await db.delete(articles).where(eq(articles.id, id));
    return true;
  },

  // EPaper operations
  async getAllEPapers(limit = 10, offset = 0) {
    return await db.query.epapers.findMany({
      orderBy: desc(epapers.publishDate),
      limit,
      offset
    });
  },

  async getLatestEPaper() {
    return await db.query.epapers.findFirst({
      where: eq(epapers.isLatest, true)
    });
  },

  async createEPaper(data: typeof epapers.$inferInsert) {
    // If this is set as latest, unset any previous latest
    if (data.isLatest) {
      await db.update(epapers)
        .set({ isLatest: false })
        .where(eq(epapers.isLatest, true));
    }
    
    const [epaper] = await db.insert(epapers).values(data).returning();
    return epaper;
  },

  // Weather operations
  async getAllWeather() {
    return await db.query.weather.findMany({
      orderBy: asc(weather.city)
    });
  },

  async getWeatherByCity(city: string) {
    return await db.query.weather.findFirst({
      where: eq(weather.city, city)
    });
  },

  async updateWeather(city: string, data: Partial<typeof weather.$inferInsert>) {
    const existingWeather = await db.query.weather.findFirst({
      where: eq(weather.city, city)
    });
    
    if (existingWeather) {
      const [updated] = await db.update(weather)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(weather.id, existingWeather.id))
        .returning();
      return updated;
    } else {
      const [newWeather] = await db.insert(weather)
        .values({ city, ...data as any, updatedAt: new Date() })
        .returning();
      return newWeather;
    }
  },

  // Breaking News operations
  async getActiveBreakingNews() {
    return await db.query.breakingNews.findMany({
      where: eq(breakingNews.isActive, true),
      orderBy: desc(breakingNews.createdAt)
    });
  },

  async createBreakingNews(data: typeof breakingNews.$inferInsert) {
    const [news] = await db.insert(breakingNews).values(data).returning();
    return news;
  },

  // User operations
  async getUserByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.username, email)
    });
  },

  async getUserById(id: number) {
    return await db.query.users.findFirst({
      where: eq(users.id, id)
    });
  },

  async updateUserRole(id: number, role: string) {
    const [user] = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
};
