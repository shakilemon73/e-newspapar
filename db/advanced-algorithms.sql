-- Bengali News Website - Advanced Algorithms Implementation
-- This file contains all SQL for enhanced search, recommendations, analytics, and real-time features

-- =============================================
-- 1. USER PREFERENCES & BEHAVIOR TRACKING
-- =============================================

-- User preferences for personalized recommendations
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    interest_score FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id)
);

-- User interactions tracking
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'view', 'share', 'like', 'comment', 'save'
    interaction_duration INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- User search history
CREATE TABLE IF NOT EXISTS user_search_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_results_count INTEGER DEFAULT 0,
    clicked_article_id INTEGER REFERENCES articles(id) ON DELETE SET NULL,
    search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. ARTICLE ANALYTICS & PERFORMANCE TRACKING
-- =============================================

-- Enhanced article analytics
CREATE TABLE IF NOT EXISTS article_analytics (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    unique_view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    average_read_time FLOAT DEFAULT 0,
    engagement_score FLOAT DEFAULT 0,
    trending_score FLOAT DEFAULT 0,
    quality_score FLOAT DEFAULT 0,
    virality_score FLOAT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id)
);

-- Trending topics tracking
CREATE TABLE IF NOT EXISTS trending_topics (
    id SERIAL PRIMARY KEY,
    topic_name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    mention_count INTEGER DEFAULT 1,
    trending_score FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(topic_name, category_id)
);

-- Article similarity matrix for recommendations
CREATE TABLE IF NOT EXISTS article_similarity (
    id SERIAL PRIMARY KEY,
    article_id_1 INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    article_id_2 INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    similarity_score FLOAT DEFAULT 0,
    similarity_type VARCHAR(50) DEFAULT 'content', -- 'content', 'behavioral', 'category'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id_1, article_id_2, similarity_type)
);

-- =============================================
-- 3. REAL-TIME NOTIFICATIONS & ALERTS
-- =============================================

-- Breaking news alerts
CREATE TABLE IF NOT EXISTS breaking_news_alerts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    breaking_news BOOLEAN DEFAULT TRUE,
    category_updates BOOLEAN DEFAULT TRUE,
    personalized_recommendations BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =============================================
-- 4. ADVANCED SEARCH CAPABILITIES
-- =============================================

-- Full-text search configuration for Bengali
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Create Bengali text search configuration
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS bengali_search (COPY = english);

-- Create search indexes
CREATE INDEX IF NOT EXISTS articles_search_idx ON articles 
USING GIN(to_tsvector('bengali_search', title || ' ' || content));

CREATE INDEX IF NOT EXISTS articles_title_search_idx ON articles 
USING GIN(to_tsvector('bengali_search', title));

CREATE INDEX IF NOT EXISTS articles_content_search_idx ON articles 
USING GIN(to_tsvector('bengali_search', content));

-- Trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS articles_title_trgm_idx ON articles 
USING GIN(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS articles_content_trgm_idx ON articles 
USING GIN(content gin_trgm_ops);

-- =============================================
-- 5. PERFORMANCE OPTIMIZATION INDEXES
-- =============================================

-- User interactions indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);

-- Article analytics indexes
CREATE INDEX IF NOT EXISTS idx_article_analytics_trending_score ON article_analytics(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_article_analytics_engagement_score ON article_analytics(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_article_analytics_view_count ON article_analytics(view_count DESC);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category_id ON user_preferences(category_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_interest_score ON user_preferences(interest_score DESC);

-- Search history indexes
CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_timestamp ON user_search_history(search_timestamp DESC);

-- =============================================
-- 6. ADVANCED FUNCTIONS FOR RECOMMENDATIONS
-- =============================================

-- Function to calculate user interest in categories
CREATE OR REPLACE FUNCTION calculate_user_category_interest(p_user_id UUID)
RETURNS TABLE(category_id INTEGER, interest_score FLOAT) AS $$
BEGIN
    RETURN QUERY
    WITH user_activity AS (
        SELECT 
            a.category_id,
            COUNT(*) as interaction_count,
            AVG(ui.interaction_duration) as avg_duration,
            COUNT(DISTINCT ui.interaction_type) as interaction_variety
        FROM user_interactions ui
        JOIN articles a ON ui.article_id = a.id
        WHERE ui.user_id = p_user_id
        AND ui.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY a.category_id
    )
    SELECT 
        ua.category_id,
        (ua.interaction_count::float * 0.4 + 
         COALESCE(ua.avg_duration, 0) * 0.0001 + 
         ua.interaction_variety::float * 0.6) as interest_score
    FROM user_activity ua
    ORDER BY interest_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get personalized article recommendations
CREATE OR REPLACE FUNCTION get_personalized_recommendations(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    article_id INTEGER,
    title VARCHAR(500),
    excerpt TEXT,
    category_name VARCHAR(100),
    recommendation_score FLOAT,
    reason VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    WITH user_interests AS (
        SELECT category_id, interest_score
        FROM calculate_user_category_interest(p_user_id)
    ),
    recent_articles AS (
        SELECT a.id, a.title, a.excerpt, c.name as category_name, a.category_id, a.published_at
        FROM articles a
        JOIN categories c ON a.category_id = c.id
        WHERE a.published_at >= NOW() - INTERVAL '7 days'
        AND a.id NOT IN (
            SELECT article_id 
            FROM user_interactions 
            WHERE user_id = p_user_id
        )
    ),
    scored_articles AS (
        SELECT 
            ra.id,
            ra.title,
            ra.excerpt,
            ra.category_name,
            (COALESCE(ui.interest_score, 0.1) * 0.6 + 
             COALESCE(aa.engagement_score, 0) * 0.3 + 
             COALESCE(aa.trending_score, 0) * 0.1) as recommendation_score,
            'Category interest' as reason
        FROM recent_articles ra
        LEFT JOIN user_interests ui ON ra.category_id = ui.category_id
        LEFT JOIN article_analytics aa ON ra.id = aa.article_id
    )
    SELECT 
        sa.id,
        sa.title,
        sa.excerpt,
        sa.category_name,
        sa.recommendation_score,
        sa.reason
    FROM scored_articles sa
    ORDER BY sa.recommendation_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate trending articles
CREATE OR REPLACE FUNCTION calculate_trending_articles(p_hours INTEGER DEFAULT 24)
RETURNS TABLE(
    article_id INTEGER,
    title VARCHAR(500),
    trending_score FLOAT,
    view_count INTEGER,
    engagement_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_interactions AS (
        SELECT 
            ui.article_id,
            COUNT(*) as interaction_count,
            COUNT(DISTINCT ui.user_id) as unique_users,
            AVG(ui.interaction_duration) as avg_duration
        FROM user_interactions ui
        WHERE ui.created_at >= NOW() - INTERVAL '1 hour' * p_hours
        GROUP BY ui.article_id
    ),
    trending_calc AS (
        SELECT 
            ri.article_id,
            a.title,
            (ri.interaction_count::float * 0.3 + 
             ri.unique_users::float * 0.4 + 
             COALESCE(ri.avg_duration, 0) * 0.001 + 
             COALESCE(aa.engagement_score, 0) * 0.3) as trending_score,
            COALESCE(aa.view_count, 0) as view_count,
            COALESCE(aa.engagement_score, 0) as engagement_score
        FROM recent_interactions ri
        JOIN articles a ON ri.article_id = a.id
        LEFT JOIN article_analytics aa ON a.id = aa.article_id
    )
    SELECT 
        tc.article_id,
        tc.title,
        tc.trending_score,
        tc.view_count,
        tc.engagement_score
    FROM trending_calc tc
    ORDER BY tc.trending_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Function for advanced Bengali search
CREATE OR REPLACE FUNCTION advanced_bengali_search(
    p_query TEXT,
    p_category_id INTEGER DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    article_id INTEGER,
    title VARCHAR(500),
    excerpt TEXT,
    category_name VARCHAR(100),
    search_rank FLOAT,
    published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH search_results AS (
        SELECT 
            a.id,
            a.title,
            a.excerpt,
            c.name as category_name,
            a.published_at,
            (ts_rank(to_tsvector('bengali_search', a.title || ' ' || a.content), 
                    plainto_tsquery('bengali_search', p_query)) * 2.0 +
             similarity(a.title, p_query) * 1.5 +
             similarity(a.content, p_query) * 0.5) as search_rank
        FROM articles a
        JOIN categories c ON a.category_id = c.id
        WHERE (p_category_id IS NULL OR a.category_id = p_category_id)
        AND (
            to_tsvector('bengali_search', a.title || ' ' || a.content) @@ 
            plainto_tsquery('bengali_search', p_query)
            OR similarity(a.title, p_query) > 0.1
            OR similarity(a.content, p_query) > 0.05
        )
    )
    SELECT 
        sr.id,
        sr.title,
        sr.excerpt,
        sr.category_name,
        sr.search_rank,
        sr.published_at
    FROM search_results sr
    ORDER BY sr.search_rank DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. AUTOMATIC TRIGGERS FOR REAL-TIME UPDATES
-- =============================================

-- Function to update article analytics
CREATE OR REPLACE FUNCTION update_article_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO article_analytics (article_id, view_count, unique_view_count, last_updated)
    VALUES (NEW.article_id, 1, 1, NOW())
    ON CONFLICT (article_id) DO UPDATE SET
        view_count = article_analytics.view_count + 1,
        unique_view_count = article_analytics.unique_view_count + 
            CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user preferences based on interactions
CREATE OR REPLACE FUNCTION update_user_preferences()
RETURNS TRIGGER AS $$
DECLARE
    article_category_id INTEGER;
BEGIN
    -- Get the category of the article
    SELECT category_id INTO article_category_id
    FROM articles WHERE id = NEW.article_id;
    
    -- Update user preferences
    INSERT INTO user_preferences (user_id, category_id, interest_score)
    VALUES (NEW.user_id, article_category_id, 0.1)
    ON CONFLICT (user_id, category_id) DO UPDATE SET
        interest_score = user_preferences.interest_score + 0.1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE article_analytics SET
        engagement_score = (
            view_count * 1.0 +
            share_count * 3.0 +
            like_count * 2.0 +
            comment_count * 4.0 +
            (average_read_time / 60.0) * 0.5
        ) / GREATEST(EXTRACT(EPOCH FROM (NOW() - (SELECT published_at FROM articles WHERE id = NEW.article_id))) / 3600.0, 1.0),
        trending_score = (
            view_count * 0.3 +
            unique_view_count * 0.4 +
            share_count * 0.2 +
            like_count * 0.1
        ) * EXP(-EXTRACT(EPOCH FROM (NOW() - (SELECT published_at FROM articles WHERE id = NEW.article_id))) / 86400.0)
    WHERE article_id = NEW.article_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_article_analytics ON user_interactions;
CREATE TRIGGER trigger_update_article_analytics
    AFTER INSERT ON user_interactions
    FOR EACH ROW EXECUTE FUNCTION update_article_analytics();

DROP TRIGGER IF EXISTS trigger_update_user_preferences ON user_interactions;
CREATE TRIGGER trigger_update_user_preferences
    AFTER INSERT ON user_interactions
    FOR EACH ROW EXECUTE FUNCTION update_user_preferences();

DROP TRIGGER IF EXISTS trigger_calculate_engagement_score ON article_analytics;
CREATE TRIGGER trigger_calculate_engagement_score
    AFTER UPDATE ON article_analytics
    FOR EACH ROW EXECUTE FUNCTION calculate_engagement_score();

-- =============================================
-- 8. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- User interactions policies
CREATE POLICY "Users can view own interactions" ON user_interactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interactions" ON user_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Search history policies
CREATE POLICY "Users can view own search history" ON user_search_history
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own search history" ON user_search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notification preferences policies
CREATE POLICY "Users can view own notification preferences" ON user_notification_preferences
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification preferences" ON user_notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification preferences" ON user_notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 9. MATERIALIZED VIEWS FOR PERFORMANCE
-- =============================================

-- Popular articles view
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_articles_view AS
SELECT 
    a.id,
    a.title,
    a.excerpt,
    a.image_url,
    a.published_at,
    c.name as category_name,
    c.slug as category_slug,
    aa.view_count,
    aa.engagement_score,
    aa.trending_score
FROM articles a
JOIN categories c ON a.category_id = c.id
LEFT JOIN article_analytics aa ON a.id = aa.article_id
ORDER BY aa.engagement_score DESC NULLS LAST;

-- Trending articles view
CREATE MATERIALIZED VIEW IF NOT EXISTS trending_articles_view AS
SELECT 
    a.id,
    a.title,
    a.excerpt,
    a.image_url,
    a.published_at,
    c.name as category_name,
    c.slug as category_slug,
    aa.view_count,
    aa.engagement_score,
    aa.trending_score
FROM articles a
JOIN categories c ON a.category_id = c.id
LEFT JOIN article_analytics aa ON a.id = aa.article_id
WHERE a.published_at >= NOW() - INTERVAL '7 days'
ORDER BY aa.trending_score DESC NULLS LAST;

-- Create indexes on materialized views
CREATE INDEX IF NOT EXISTS idx_popular_articles_engagement ON popular_articles_view(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_articles_trending ON trending_articles_view(trending_score DESC);

-- =============================================
-- 10. REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- =============================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW popular_articles_view;
    REFRESH MATERIALIZED VIEW trending_articles_view;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to refresh views (you can set up pg_cron for this)
-- This would run every 5 minutes in production
-- SELECT cron.schedule('refresh-analytics', '*/5 * * * *', 'SELECT refresh_analytics_views();');

-- =============================================
-- 11. INITIAL DATA SETUP
-- =============================================

-- Insert default notification preferences for existing users
INSERT INTO user_notification_preferences (user_id, breaking_news, category_updates, personalized_recommendations)
SELECT 
    id,
    TRUE,
    TRUE,
    TRUE
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Initialize analytics for existing articles
INSERT INTO article_analytics (article_id, view_count, unique_view_count, engagement_score, trending_score)
SELECT 
    id,
    COALESCE(view_count, 0),
    COALESCE(view_count, 0),
    0.0,
    0.0
FROM articles
ON CONFLICT (article_id) DO NOTHING;

-- Refresh the materialized views
SELECT refresh_analytics_views();

COMMIT;