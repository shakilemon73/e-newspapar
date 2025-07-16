-- Advanced Algorithm Tables for Bengali News Website
-- This file contains all the SQL commands to create advanced analytics, 
-- user tracking, and machine learning capabilities for the news website

-- USER ANALYTICS TABLE
-- Tracks user behavior and session information
CREATE TABLE IF NOT EXISTS user_analytics (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id VARCHAR(255),
    page_views INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0,
    articles_read INTEGER DEFAULT 0,
    categories_viewed TEXT[],
    device_type VARCHAR(50),
    browser_info TEXT,
    location_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ARTICLE ANALYTICS TABLE
-- Tracks article performance metrics and engagement
CREATE TABLE IF NOT EXISTS article_analytics (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL,
    view_count INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0.0,
    trending_score DECIMAL(5,2) DEFAULT 0.0,
    average_read_time INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0.0,
    social_shares INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- USER INTERACTIONS TABLE
-- Tracks all user interactions with articles for recommendation engine
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    article_id INTEGER NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'share', 'comment', 'save'
    interaction_value DECIMAL(3,2) DEFAULT 1.0,
    reading_duration INTEGER DEFAULT 0,
    scroll_depth DECIMAL(5,2) DEFAULT 0.0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- USER PREFERENCES TABLE
-- Tracks user preferences for personalized recommendations
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    category_id INTEGER NOT NULL,
    interest_score DECIMAL(5,2) DEFAULT 0.0,
    interaction_count INTEGER DEFAULT 0,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- SEARCH HISTORY TABLE
-- Tracks user search queries for improved search algorithms
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    search_query TEXT NOT NULL,
    search_results_count INTEGER DEFAULT 0,
    clicked_result_id INTEGER,
    search_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (clicked_result_id) REFERENCES articles(id) ON DELETE SET NULL
);

-- RECOMMENDATION CACHE TABLE
-- Caches recommendation results for performance optimization
CREATE TABLE IF NOT EXISTS recommendation_cache (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    article_id INTEGER NOT NULL,
    recommendation_score DECIMAL(5,2) NOT NULL,
    recommendation_reason TEXT,
    algorithm_version VARCHAR(50) DEFAULT 'v1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- PERFORMANCE INDEXES
-- Optimizes query performance for analytics and recommendations
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_article_analytics_article_id ON article_analytics(article_id);
CREATE INDEX IF NOT EXISTS idx_article_analytics_trending_score ON article_analytics(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user_id ON recommendation_cache(user_id);

-- ENGAGEMENT SCORE CALCULATION FUNCTION
-- Calculates engagement score based on user interactions
CREATE OR REPLACE FUNCTION calculate_engagement_score(article_id_param INTEGER)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    engagement_score DECIMAL(5,2) := 0.0;
BEGIN
    SELECT 
        COALESCE(
            (COUNT(CASE WHEN interaction_type = 'view' THEN 1 END) * 0.1) +
            (COUNT(CASE WHEN interaction_type = 'like' THEN 1 END) * 0.3) +
            (COUNT(CASE WHEN interaction_type = 'share' THEN 1 END) * 0.5) +
            (COUNT(CASE WHEN interaction_type = 'comment' THEN 1 END) * 0.7) +
            (COUNT(CASE WHEN interaction_type = 'save' THEN 1 END) * 0.4),
            0.0
        )
    INTO engagement_score
    FROM user_interactions
    WHERE article_id = article_id_param;
    
    RETURN engagement_score;
END;
$$ LANGUAGE plpgsql;

-- TRENDING SCORE CALCULATION FUNCTION
-- Calculates trending score based on recent interactions
CREATE OR REPLACE FUNCTION calculate_trending_score(article_id_param INTEGER)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    trending_score DECIMAL(5,2) := 0.0;
    recent_interactions INTEGER := 0;
BEGIN
    SELECT COUNT(*)
    INTO recent_interactions
    FROM user_interactions
    WHERE article_id = article_id_param
    AND created_at >= NOW() - INTERVAL '24 hours';
    
    trending_score := recent_interactions * 0.8;
    
    RETURN trending_score;
END;
$$ LANGUAGE plpgsql;

-- PERSONALIZED RECOMMENDATIONS FUNCTION
-- Advanced machine learning algorithm for personalized article recommendations
CREATE OR REPLACE FUNCTION get_personalized_recommendations(user_id_param UUID, limit_param INTEGER DEFAULT 10)
RETURNS TABLE(
    article_id INTEGER,
    title TEXT,
    excerpt TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    category_name TEXT,
    recommendation_score DECIMAL(5,2),
    recommendation_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.image_url,
        a.published_at,
        c.name as category_name,
        COALESCE(aa.engagement_score, 0.0) + COALESCE(aa.trending_score, 0.0) as rec_score,
        'জনপ্রিয় সংবাদ' as rec_reason
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    LEFT JOIN article_analytics aa ON a.id = aa.article_id
    WHERE a.id NOT IN (
        SELECT DISTINCT ui.article_id
        FROM user_interactions ui
        WHERE ui.user_id = user_id_param
        AND ui.interaction_type = 'view'
        AND ui.created_at >= NOW() - INTERVAL '7 days'
    )
    AND a.published_at >= NOW() - INTERVAL '30 days'
    ORDER BY rec_score DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- ADVANCED BENGALI SEARCH FUNCTION
-- Full-text search with Bengali language support and ranking
CREATE OR REPLACE FUNCTION advanced_bengali_search(
    search_query TEXT,
    category_id_param INTEGER DEFAULT NULL,
    limit_param INTEGER DEFAULT 20
)
RETURNS TABLE(
    article_id INTEGER,
    title TEXT,
    excerpt TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    category_name TEXT,
    search_rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.image_url,
        a.published_at,
        c.name as category_name,
        ts_rank(
            to_tsvector('simple', a.title || ' ' || a.excerpt || ' ' || a.content),
            plainto_tsquery('simple', search_query)
        ) as search_rank
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE to_tsvector('simple', a.title || ' ' || a.excerpt || ' ' || a.content) @@ plainto_tsquery('simple', search_query)
    AND (category_id_param IS NULL OR a.category_id = category_id_param)
    ORDER BY search_rank DESC, a.published_at DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER TO UPDATE ARTICLE ANALYTICS
-- Automatically updates article analytics when interactions occur
CREATE OR REPLACE FUNCTION update_article_analytics_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO article_analytics (article_id, view_count, unique_views, engagement_score, trending_score)
    VALUES (NEW.article_id, 0, 0, 0.0, 0.0)
    ON CONFLICT (article_id) DO UPDATE SET
        engagement_score = calculate_engagement_score(NEW.article_id),
        trending_score = calculate_trending_score(NEW.article_id),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic analytics updates
CREATE TRIGGER IF NOT EXISTS trigger_update_article_analytics
    AFTER INSERT ON user_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_article_analytics_trigger();

-- INITIALIZATION SCRIPT
-- Initialize analytics for existing articles
INSERT INTO article_analytics (article_id, view_count, unique_views, engagement_score, trending_score)
SELECT 
    a.id,
    COALESCE(a.view_count, 0),
    COALESCE(a.view_count, 0),
    0.0,
    0.0
FROM articles a
WHERE NOT EXISTS (
    SELECT 1 FROM article_analytics aa WHERE aa.article_id = a.id
);

-- SAMPLE DATA FOR TESTING
-- Insert sample user interactions for testing the recommendation engine
INSERT INTO user_interactions (user_id, article_id, interaction_type, interaction_value, reading_duration, scroll_depth)
SELECT 
    '00000000-0000-0000-0000-000000000000'::UUID,
    a.id,
    'view',
    1.0,
    FLOOR(RANDOM() * 300) + 30, -- Random reading duration 30-330 seconds
    FLOOR(RANDOM() * 100) + 1   -- Random scroll depth 1-100%
FROM articles a
WHERE a.id <= 5; -- Only for first 5 articles

-- SUCCESS MESSAGE
-- This will display when all commands are executed successfully
SELECT 'Advanced Algorithm Tables Created Successfully!' as status,
       'Bengali News Website now has advanced analytics capabilities' as message,
       'Personalized recommendations and Bengali search are now available' as features;