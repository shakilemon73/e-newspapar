// Type declarations for achievements-system.ts

export function checkAndAwardAchievements(userId: string, userStats: any): Promise<void>;
export function calculateUserStatsForAchievements(userId: string): Promise<any>;
export function getUserAchievements(userId: string): Promise<any[]>;
export function getAchievementProgress(userId: string, userStats: any): Promise<any>;