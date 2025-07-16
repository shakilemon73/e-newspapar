import { supabase } from './supabase';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
}

interface UserStats {
  articles_read: number;
  articles_saved: number;
  reading_streak: number;
  categories_explored: number;
  total_interactions: number;
}

/**
 * Check and award achievements for a user
 */
export async function checkAndAwardAchievements(userId: string, userStats: UserStats) {
  try {
    // Get all available achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*');

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return { newAchievements: [], totalAchievements: 0 };
    }

    // Get user's current achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (userAchievementsError) {
      console.error('Error fetching user achievements:', userAchievementsError);
      return { newAchievements: [], totalAchievements: 0 };
    }

    const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id);
    const newAchievements: Achievement[] = [];

    // Check each achievement
    for (const achievement of achievements) {
      // Skip if user already has this achievement
      if (earnedAchievementIds.includes(achievement.id)) {
        continue;
      }

      // Check if user meets the requirement
      let earned = false;
      switch (achievement.requirement_type) {
        case 'articles_read':
          earned = userStats.articles_read >= achievement.requirement_value;
          break;
        case 'articles_saved':
          earned = userStats.articles_saved >= achievement.requirement_value;
          break;
        case 'reading_streak':
          earned = userStats.reading_streak >= achievement.requirement_value;
          break;
        case 'categories_explored':
          earned = userStats.categories_explored >= achievement.requirement_value;
          break;
        case 'total_interactions':
          earned = userStats.total_interactions >= achievement.requirement_value;
          break;
      }

      if (earned) {
        // Award the achievement
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: new Date().toISOString()
          });

        if (!insertError) {
          newAchievements.push(achievement);
        }
      }
    }

    return { 
      newAchievements, 
      totalAchievements: earnedAchievementIds.length + newAchievements.length 
    };

  } catch (error) {
    console.error('Error in achievement system:', error);
    return { newAchievements: [], totalAchievements: 0 };
  }
}

/**
 * Get user's achievements with details
 */
export async function getUserAchievements(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements:achievement_id (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return [];
  }
}

/**
 * Get achievement progress for a user
 */
export async function getAchievementProgress(userId: string, userStats: UserStats) {
  try {
    // Get all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*');

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return [];
    }

    // Get user's current achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (userAchievementsError) {
      console.error('Error fetching user achievements:', userAchievementsError);
      return [];
    }

    const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id);

    // Calculate progress for each achievement
    const progress = achievements.map(achievement => {
      const isEarned = earnedAchievementIds.includes(achievement.id);
      
      let currentValue = 0;
      switch (achievement.requirement_type) {
        case 'articles_read':
          currentValue = userStats.articles_read;
          break;
        case 'articles_saved':
          currentValue = userStats.articles_saved;
          break;
        case 'reading_streak':
          currentValue = userStats.reading_streak;
          break;
        case 'categories_explored':
          currentValue = userStats.categories_explored;
          break;
        case 'total_interactions':
          currentValue = userStats.total_interactions;
          break;
      }

      const progressPercentage = isEarned ? 100 : Math.min((currentValue / achievement.requirement_value) * 100, 100);

      return {
        ...achievement,
        isEarned,
        currentValue,
        progressPercentage,
        requirement: achievement.requirement_value
      };
    });

    return progress;
  } catch (error) {
    console.error('Error getting achievement progress:', error);
    return [];
  }
}

/**
 * Calculate user statistics for achievements
 */
export async function calculateUserStatsForAchievements(userId: string): Promise<UserStats> {
  try {
    // Get reading history count
    const { data: readingHistory, error: readingError } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', userId);

    // Get saved articles count
    const { data: savedArticles, error: savedError } = await supabase
      .from('saved_articles')
      .select('*')
      .eq('user_id', userId);

    // Get user interactions count
    const { data: interactions, error: interactionsError } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId);

    // Calculate reading streak (simplified version)
    const today = new Date();
    let streak = 0;
    if (readingHistory && readingHistory.length > 0) {
      const sortedHistory = readingHistory.sort((a, b) => 
        new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime()
      );
      
      for (let i = 0; i < sortedHistory.length; i++) {
        const readDate = new Date(sortedHistory[i].last_read_at);
        const diffDays = Math.floor((today.getTime() - readDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === i) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Calculate categories explored (count unique categories from reading history)
    const categoriesExplored = new Set();
    if (readingHistory) {
      for (const item of readingHistory) {
        // You'd need to join with articles table to get category info
        // For now, we'll estimate based on article variety
        categoriesExplored.add(item.article_id % 10); // Simplified
      }
    }

    return {
      articles_read: readingHistory?.length || 0,
      articles_saved: savedArticles?.length || 0,
      reading_streak: streak,
      categories_explored: categoriesExplored.size,
      total_interactions: interactions?.length || 0
    };

  } catch (error) {
    console.error('Error calculating user stats:', error);
    return {
      articles_read: 0,
      articles_saved: 0,
      reading_streak: 0,
      categories_explored: 0,
      total_interactions: 0
    };
  }
}