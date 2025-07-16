-- Advanced Algorithms SQL File for Bengali News Website
-- This file contains comprehensive database functions and tables for advanced features

-- ==============================================================================
-- ADVANCED TABLES FOR MACHINE LEARNING AND PERSONALIZATION
-- ==============================================================================

-- User Analytics and Behavior Tracking
CREATE TABLE IF NOT EXISTS user_analytics (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id VARCHAR(255),
    page_views INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    articles_read INTEGER DEFAULT 0,
    categories_viewed TEXT[], -- array of category slugs
    device_type VARCHAR(50),
    browser_info TEXT,
    location_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article Analytics and Performance Metrics
CREATE TABLE IF NOT EXISTS article_analytics (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL,
    view_count INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0.0,
    trending_score DECIMAL(5,2) DEFAULT 0.0,
    average_read_time INTEGER DEFAULT 0, -- in seconds
    bounce_rate DECIMAL(5,2) DEFAULT 0.0,
    social_shares INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- User Interactions for Personalization
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    article_id INTEGER NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'share', 'comment', 'save'
    interaction_value DECIMAL(3,2) DEFAULT 1.0, -- weight of interaction
    reading_duration INTEGER DEFAULT 0, -- in seconds
    scroll_depth DECIMAL(5,2) DEFAULT 0.0, -- percentage of article scrolled
    metadata JSONB, -- additional interaction data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- User Preferences and Interest Scoring
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

-- Search History and Analytics
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

-- Recommendation Engine Data
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

-- ==============================================================================
-- ADVANCED INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==============================================================================

-- User Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_session_id ON user_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);

-- Article Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_article_analytics_article_id ON article_analytics(article_id);
CREATE INDEX IF NOT EXISTS idx_article_analytics_view_count ON article_analytics(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_article_analytics_engagement_score ON article_analytics(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_article_analytics_trending_score ON article_analytics(trending_score DESC);

-- User Interactions Indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);

-- User Preferences Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category_id ON user_preferences(category_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_interest_score ON user_preferences(interest_score DESC);

-- Search History Indexes
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history USING gin(to_tsvector('bengali', search_query));
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);

-- Recommendation Cache Indexes
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user_id ON recommendation_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_score ON recommendation_cache(recommendation_score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_expires_at ON recommendation_cache(expires_at);

-- ==============================================================================
-- ADVANCED FUNCTIONS FOR PERSONALIZATION AND ANALYTICS
-- ==============================================================================

-- Function to calculate article engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(article_id_param INTEGER)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    engagement_score DECIMAL(5,2) := 0.0;
    view_weight DECIMAL(3,2) := 0.1;
    like_weight DECIMAL(3,2) := 0.3;
    share_weight DECIMAL(3,2) := 0.5;
    comment_weight DECIMAL(3,2) := 0.7;
    save_weight DECIMAL(3,2) := 0.4;
BEGIN
    SELECT 
        COALESCE(
            (COUNT(CASE WHEN interaction_type = 'view' THEN 1 END) * view_weight) +
            (COUNT(CASE WHEN interaction_type = 'like' THEN 1 END) * like_weight) +
            (COUNT(CASE WHEN interaction_type = 'share' THEN 1 END) * share_weight) +
            (COUNT(CASE WHEN interaction_type = 'comment' THEN 1 END) * comment_weight) +
            (COUNT(CASE WHEN interaction_type = 'save' THEN 1 END) * save_weight),
            0.0
        )
    INTO engagement_score
    FROM user_interactions
    WHERE article_id = article_id_param;
    
    RETURN engagement_score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate trending score based on recent activity
CREATE OR REPLACE FUNCTION calculate_trending_score(article_id_param INTEGER)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    trending_score DECIMAL(5,2) := 0.0;
    recent_views INTEGER := 0;
    recent_interactions INTEGER := 0;
    time_decay_factor DECIMAL(3,2) := 0.8;
BEGIN
    -- Get recent views (last 24 hours)
    SELECT COUNT(*)
    INTO recent_views
    FROM user_interactions
    WHERE article_id = article_id_param
    AND interaction_type = 'view'
    AND created_at >= NOW() - INTERVAL '24 hours';
    
    -- Get recent interactions (last 24 hours)
    SELECT COUNT(*)
    INTO recent_interactions
    FROM user_interactions
    WHERE article_id = article_id_param
    AND created_at >= NOW() - INTERVAL '24 hours';
    
    -- Calculate trending score with time decay
    trending_score := (recent_views * 0.3 + recent_interactions * 0.7) * time_decay_factor;
    
    RETURN trending_score;
END;
$$ LANGUAGE plpgsql;

-- Function to get personalized recommendations
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
    WITH user_category_preferences AS (
        SELECT 
            up.category_id,
            up.interest_score,
            c.name as category_name
        FROM user_preferences up
        JOIN categories c ON up.category_id = c.id
        WHERE up.user_id = user_id_param
        ORDER BY up.interest_score DESC
        LIMIT 5
    ),
    scored_articles AS (
        SELECT 
            a.id,
            a.title,
            a.excerpt,
            a.image_url,
            a.published_at,
            c.name as category_name,
            CASE 
                WHEN ucp.interest_score IS NOT NULL THEN 
                    (ucp.interest_score * 0.4) + 
                    (COALESCE(aa.engagement_score, 0) * 0.3) + 
                    (COALESCE(aa.trending_score, 0) * 0.3)
                ELSE 
                    (COALESCE(aa.engagement_score, 0) * 0.5) + 
                    (COALESCE(aa.trending_score, 0) * 0.5)
            END as rec_score,
            CASE 
                WHEN ucp.interest_score IS NOT NULL THEN 
                    'আপনার আগ্রহের বিষয়: ' || c.name
                ELSE 
                    'জনপ্রিয় সংবাদ'
            END as rec_reason
        FROM articles a
        JOIN categories c ON a.category_id = c.id
        LEFT JOIN user_category_preferences ucp ON c.id = ucp.category_id
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
        LIMIT limit_param
    )
    SELECT 
        sa.id,
        sa.title,
        sa.excerpt,
        sa.image_url,
        sa.published_at,
        sa.category_name,
        sa.rec_score,
        sa.rec_reason
    FROM scored_articles sa;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular articles by time range
CREATE OR REPLACE FUNCTION get_popular_articles_by_timerange(
    time_range VARCHAR(10) DEFAULT 'daily',
    limit_param INTEGER DEFAULT 10
)
RETURNS TABLE(
    article_id INTEGER,
    title TEXT,
    excerpt TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    category_name TEXT,
    view_count INTEGER,
    engagement_score DECIMAL(5,2)
) AS $$
DECLARE
    interval_duration INTERVAL;
BEGIN
    -- Set interval based on time range
    CASE time_range
        WHEN 'daily' THEN interval_duration := INTERVAL '1 day';
        WHEN 'weekly' THEN interval_duration := INTERVAL '7 days';
        WHEN 'monthly' THEN interval_duration := INTERVAL '30 days';
        ELSE interval_duration := INTERVAL '1 day';
    END CASE;
    
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.image_url,
        a.published_at,
        c.name as category_name,
        COUNT(ui.id)::INTEGER as view_count,
        COALESCE(aa.engagement_score, 0.0) as engagement_score
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    LEFT JOIN user_interactions ui ON a.id = ui.article_id 
        AND ui.interaction_type = 'view'
        AND ui.created_at >= NOW() - interval_duration
    LEFT JOIN article_analytics aa ON a.id = aa.article_id
    WHERE a.published_at >= NOW() - interval_duration
    GROUP BY a.id, a.title, a.excerpt, a.image_url, a.published_at, c.name, aa.engagement_score
    ORDER BY view_count DESC, engagement_score DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Function for advanced Bengali text search
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
            to_tsvector('bengali', a.title || ' ' || a.excerpt || ' ' || a.content),
            plainto_tsquery('bengali', search_query)
        ) as search_rank
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE to_tsvector('bengali', a.title || ' ' || a.excerpt || ' ' || a.content) @@ plainto_tsquery('bengali', search_query)
    AND (category_id_param IS NULL OR a.category_id = category_id_param)
    ORDER BY search_rank DESC, a.published_at DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Function to track user interaction and update analytics
CREATE OR REPLACE FUNCTION track_user_interaction(
    user_id_param UUID,
    article_id_param INTEGER,
    interaction_type_param VARCHAR(50),
    reading_duration_param INTEGER DEFAULT 0,
    scroll_depth_param DECIMAL(5,2) DEFAULT 0.0,
    metadata_param JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    -- Insert interaction record
    INSERT INTO user_interactions (
        user_id, article_id, interaction_type, reading_duration, scroll_depth, metadata
    ) VALUES (
        user_id_param, article_id_param, interaction_type_param, 
        reading_duration_param, scroll_depth_param, metadata_param
    );
    
    -- Update article analytics
    INSERT INTO article_analytics (article_id, view_count, unique_views, engagement_score, trending_score)
    VALUES (article_id_param, 1, 1, 0.0, 0.0)
    ON CONFLICT (article_id) DO UPDATE SET
        view_count = article_analytics.view_count + 1,
        unique_views = article_analytics.unique_views + 
            CASE WHEN NOT EXISTS (
                SELECT 1 FROM user_interactions ui 
                WHERE ui.user_id = user_id_param 
                AND ui.article_id = article_id_param 
                AND ui.interaction_type = 'view'
                AND ui.created_at < NOW() - INTERVAL '1 hour'
            ) THEN 1 ELSE 0 END,
        engagement_score = calculate_engagement_score(article_id_param),
        trending_score = calculate_trending_score(article_id_param),
        updated_at = NOW();
    
    -- Update user preferences
    INSERT INTO user_preferences (user_id, category_id, interest_score, interaction_count)
    SELECT 
        user_id_param,
        a.category_id,
        CASE interaction_type_param
            WHEN 'view' THEN 0.1
            WHEN 'like' THEN 0.3
            WHEN 'share' THEN 0.5
            WHEN 'comment' THEN 0.7
            WHEN 'save' THEN 0.4
            ELSE 0.1
        END,
        1
    FROM articles a
    WHERE a.id = article_id_param
    ON CONFLICT (user_id, category_id) DO UPDATE SET
        interest_score = user_preferences.interest_score + 
            CASE interaction_type_param
                WHEN 'view' THEN 0.1
                WHEN 'like' THEN 0.3
                WHEN 'share' THEN 0.5
                WHEN 'comment' THEN 0.7
                WHEN 'save' THEN 0.4
                ELSE 0.1
            END,
        interaction_count = user_preferences.interaction_count + 1,
        last_interaction = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired recommendation cache
CREATE OR REPLACE FUNCTION cleanup_recommendation_cache()
RETURNS VOID AS $$
BEGIN
    DELETE FROM recommendation_cache
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user analytics dashboard
CREATE OR REPLACE FUNCTION get_user_analytics_dashboard(user_id_param UUID)
RETURNS TABLE(
    total_articles_read INTEGER,
    total_time_spent INTEGER,
    favorite_categories TEXT[],
    reading_streak INTEGER,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT 
            COUNT(DISTINCT CASE WHEN ui.interaction_type = 'view' THEN ui.article_id END)::INTEGER as articles_read,
            SUM(ui.reading_duration)::INTEGER as time_spent,
            MAX(ui.created_at) as last_activity
        FROM user_interactions ui
        WHERE ui.user_id = user_id_param
    ),
    favorite_cats AS (
        SELECT 
            array_agg(c.name ORDER BY up.interest_score DESC) as fav_categories
        FROM user_preferences up
        JOIN categories c ON up.category_id = c.id
        WHERE up.user_id = user_id_param
        ORDER BY up.interest_score DESC
        LIMIT 5
    ),
    reading_streak AS (
        SELECT 
            COUNT(DISTINCT DATE(ui.created_at))::INTEGER as streak
        FROM user_interactions ui
        WHERE ui.user_id = user_id_param
        AND ui.interaction_type = 'view'
        AND ui.created_at >= NOW() - INTERVAL '30 days'
    )
    SELECT 
        us.articles_read,
        us.time_spent,
        fc.fav_categories,
        rs.streak,
        us.last_activity
    FROM user_stats us
    CROSS JOIN favorite_cats fc
    CROSS JOIN reading_streak rs;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================================================

-- Trigger to update article analytics when interactions change
CREATE OR REPLACE FUNCTION update_article_analytics_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE article_analytics SET
        engagement_score = calculate_engagement_score(NEW.article_id),
        trending_score = calculate_trending_score(NEW.article_id),
        updated_at = NOW()
    WHERE article_id = NEW.article_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_article_analytics
    AFTER INSERT ON user_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_article_analytics_trigger();

-- Trigger to cleanup expired recommendation cache daily
CREATE OR REPLACE FUNCTION schedule_cache_cleanup()
RETURNS TRIGGER AS $$
BEGIN
    -- This would typically be handled by a cron job or scheduled task
    -- For now, we'll clean up on each new recommendation insert
    PERFORM cleanup_recommendation_cache();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cache_cleanup
    AFTER INSERT ON recommendation_cache
    FOR EACH ROW
    EXECUTE FUNCTION schedule_cache_cleanup();

-- ==============================================================================
-- VIEWS FOR EASY DATA ACCESS
-- ==============================================================================

-- View for article statistics
CREATE OR REPLACE VIEW article_statistics AS
SELECT 
    a.id,
    a.title,
    a.slug,
    c.name as category_name,
    a.published_at,
    COALESCE(aa.view_count, 0) as view_count,
    COALESCE(aa.unique_views, 0) as unique_views,
    COALESCE(aa.engagement_score, 0.0) as engagement_score,
    COALESCE(aa.trending_score, 0.0) as trending_score,
    COALESCE(aa.average_read_time, 0) as average_read_time,
    COALESCE(aa.social_shares, 0) as social_shares
FROM articles a
JOIN categories c ON a.category_id = c.id
LEFT JOIN article_analytics aa ON a.id = aa.article_id;

-- View for user engagement summary
CREATE OR REPLACE VIEW user_engagement_summary AS
SELECT 
    ui.user_id,
    COUNT(DISTINCT ui.article_id) as articles_read,
    COUNT(DISTINCT DATE(ui.created_at)) as active_days,
    SUM(ui.reading_duration) as total_reading_time,
    AVG(ui.reading_duration) as avg_reading_time,
    MAX(ui.created_at) as last_activity,
    COUNT(CASE WHEN ui.interaction_type = 'like' THEN 1 END) as likes_given,
    COUNT(CASE WHEN ui.interaction_type = 'share' THEN 1 END) as shares_made,
    COUNT(CASE WHEN ui.interaction_type = 'save' THEN 1 END) as articles_saved
FROM user_interactions ui
GROUP BY ui.user_id;

-- View for trending articles
CREATE OR REPLACE VIEW trending_articles AS
SELECT 
    a.id,
    a.title,
    a.slug,
    a.excerpt,
    a.image_url,
    a.published_at,
    c.name as category_name,
    COALESCE(aa.trending_score, 0.0) as trending_score,
    COALESCE(aa.view_count, 0) as view_count,
    COALESCE(aa.engagement_score, 0.0) as engagement_score
FROM articles a
JOIN categories c ON a.category_id = c.id
LEFT JOIN article_analytics aa ON a.id = aa.article_id
WHERE a.published_at >= NOW() - INTERVAL '7 days'
ORDER BY aa.trending_score DESC NULLS LAST, aa.view_count DESC NULLS LAST;

-- ==============================================================================
-- INITIAL DATA SETUP
-- ==============================================================================

-- Initialize article analytics for existing articles
INSERT INTO article_analytics (article_id, view_count, unique_views, engagement_score, trending_score)
SELECT 
    id,
    view_count,
    view_count,
    0.0,
    0.0
FROM articles
WHERE id NOT IN (SELECT article_id FROM article_analytics);

-- Create sample search configurations
INSERT INTO search_history (user_id, search_query, search_results_count, search_metadata)
VALUES 
    (NULL, 'বাংলাদেশ', 10, '{"type": "popular_search"}'),
    (NULL, 'ক্রিকেট', 8, '{"type": "popular_search"}'),
    (NULL, 'রাজনীতি', 15, '{"type": "popular_search"}'),
    (NULL, 'অর্থনীতি', 12, '{"type": "popular_search"}'),
    (NULL, 'আন্তর্জাতিক', 9, '{"type": "popular_search"}')
ON CONFLICT DO NOTHING;

-- Create notification for successful setup
DO $$
BEGIN
    RAISE NOTICE 'Advanced algorithms database setup completed successfully!';
    RAISE NOTICE 'Created tables: user_analytics, article_analytics, user_interactions, user_preferences, search_history, recommendation_cache';
    RAISE NOTICE 'Created functions: calculate_engagement_score, calculate_trending_score, get_personalized_recommendations, get_popular_articles_by_timerange, advanced_bengali_search, track_user_interaction';
    RAISE NOTICE 'Created views: article_statistics, user_engagement_summary, trending_articles';
    RAISE NOTICE 'All indexes and triggers have been set up for optimal performance';
END $$;