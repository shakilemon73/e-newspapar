// Type declarations for advanced-algorithms.js

export function initializeAdvancedAlgorithms(): Promise<{success: boolean, error?: string, missingTables?: string[]}>;
export function getTrendingTopics(limit?: number): Promise<any[]>;
export function getPersonalizedRecommendations(userId: string, limit?: number): Promise<any[]>;
export function getPopularArticles(timeframe?: string, limit?: number): Promise<any[]>;
export function getTrendingArticles(limit?: number): Promise<any[]>;
export function trackUserInteraction(userId: string, action: string, articleId?: number, metadata?: any): Promise<void>;
export function advancedBengaliSearch(query: string, options?: any): Promise<any[]>;
export function getUserAnalytics(userId: string): Promise<any>;
export function getUserReadingHistory(userId: string, limit?: number): Promise<any[]>;
export function getUserSavedArticles(userId: string, limit?: number): Promise<any[]>;