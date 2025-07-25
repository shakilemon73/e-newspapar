-- AI Analysis Tables for Bengali News Website
-- Stores comprehensive AI processing results in Supabase

-- Table for article AI analysis results
CREATE TABLE IF NOT EXISTS article_ai_analysis (
  id BIGSERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  summary TEXT,
  sentiment_label TEXT CHECK (sentiment_label IN ('ইতিবাচক', 'নেতিবাচক', 'নিরপেক্ষ')),
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= 0 AND sentiment_score <= 1),
  sentiment_confidence INTEGER CHECK (sentiment_confidence >= 0 AND sentiment_confidence <= 100),
  auto_tags TEXT[],
  reading_time_minutes INTEGER,
  content_complexity TEXT CHECK (content_complexity IN ('সহজ', 'মাধ্যম', 'কঠিন')),
  extracted_topics TEXT[],
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model_version TEXT DEFAULT 'tensorflow-js-v1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate analysis
ALTER TABLE article_ai_analysis 
ADD CONSTRAINT unique_article_ai_analysis 
UNIQUE (article_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_article_ai_analysis_article_id ON article_ai_analysis(article_id);
CREATE INDEX IF NOT EXISTS idx_article_ai_analysis_processed_at ON article_ai_analysis(processed_at);
CREATE INDEX IF NOT EXISTS idx_article_ai_analysis_sentiment ON article_ai_analysis(sentiment_label);

-- Add AI processing columns to articles table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='ai_processed') THEN
    ALTER TABLE articles ADD COLUMN ai_processed BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='ai_processed_at') THEN
    ALTER TABLE articles ADD COLUMN ai_processed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Index for AI processing status
CREATE INDEX IF NOT EXISTS idx_articles_ai_processed ON articles(ai_processed);

-- Table for AI processing queue (for batch processing)
CREATE TABLE IF NOT EXISTS ai_processing_queue (
  id BIGSERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  processing_type TEXT NOT NULL DEFAULT 'full_analysis',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for queue processing
CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON ai_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_queue_priority ON ai_processing_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ai_queue_created_at ON ai_processing_queue(created_at);

-- Table for AI model performance metrics
CREATE TABLE IF NOT EXISTS ai_model_metrics (
  id BIGSERIAL PRIMARY KEY,
  model_name TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('summarization', 'sentiment_analysis', 'tag_generation', 'topic_extraction')),
  processing_time_ms INTEGER,
  input_length INTEGER,
  output_length INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance monitoring
CREATE INDEX IF NOT EXISTS idx_ai_metrics_model_operation ON ai_model_metrics(model_name, operation_type);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_created_at ON ai_model_metrics(created_at);

-- Table for user AI interaction preferences
CREATE TABLE IF NOT EXISTS user_ai_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
  auto_summarize BOOLEAN DEFAULT TRUE,
  preferred_summary_length TEXT DEFAULT 'medium' CHECK (preferred_summary_length IN ('short', 'medium', 'long')),
  show_sentiment_analysis BOOLEAN DEFAULT TRUE,
  show_reading_time BOOLEAN DEFAULT TRUE,
  show_complexity_level BOOLEAN DEFAULT TRUE,
  language_preference TEXT DEFAULT 'bengali' CHECK (language_preference IN ('bengali', 'english', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user preferences
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_user_id ON user_ai_preferences(user_id);

-- RLS Policies for AI tables

-- Article AI Analysis - Anyone can read, only authenticated users with proper role can modify
ALTER TABLE article_ai_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read article AI analysis" ON article_ai_analysis
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage article AI analysis" ON article_ai_analysis
  FOR ALL USING (auth.role() = 'service_role');

-- AI Processing Queue - Restricted access
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage AI queue" ON ai_processing_queue
  FOR ALL USING (auth.role() = 'service_role');

-- AI Model Metrics - Read-only for authenticated users
ALTER TABLE ai_model_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read AI metrics" ON ai_model_metrics
  FOR SELECT USING (true);

CREATE POLICY "Service role can insert AI metrics" ON ai_model_metrics
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- User AI Preferences - Users can manage their own preferences
ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their AI preferences" ON user_ai_preferences
  FOR ALL USING (auth.uid()::text = (SELECT user_id::text FROM user_profiles WHERE id = user_ai_preferences.user_id));

-- Function to trigger AI processing for new articles
CREATE OR REPLACE FUNCTION trigger_ai_processing()
RETURNS TRIGGER AS $$
BEGIN
  -- Add to AI processing queue when new article is created
  INSERT INTO ai_processing_queue (article_id, processing_type, priority)
  VALUES (NEW.id, 'full_analysis', 5);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-processing new articles
DROP TRIGGER IF EXISTS auto_ai_processing_trigger ON articles;
CREATE TRIGGER auto_ai_processing_trigger
  AFTER INSERT ON articles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ai_processing();

-- Function to clean old AI metrics (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_model_metrics 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE article_ai_analysis IS 'Stores comprehensive AI analysis results for Bengali news articles';
COMMENT ON TABLE ai_processing_queue IS 'Queue system for batch AI processing of articles';
COMMENT ON TABLE ai_model_metrics IS 'Performance metrics and monitoring for AI models';
COMMENT ON TABLE user_ai_preferences IS 'User preferences for AI-powered features';

COMMENT ON COLUMN article_ai_analysis.summary IS 'AI-generated Bengali summary of the article';
COMMENT ON COLUMN article_ai_analysis.sentiment_label IS 'Bengali sentiment classification: ইতিবাচক, নেতিবাচক, নিরপেক্ষ';
COMMENT ON COLUMN article_ai_analysis.auto_tags IS 'AI-generated tags in Bengali for content categorization';
COMMENT ON COLUMN article_ai_analysis.content_complexity IS 'AI-assessed reading difficulty: সহজ, মাধ্যম, কঠিন';