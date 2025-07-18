-- Create missing admin tables for Bengali News Website
-- This script creates tables that are currently using mock data

-- 1. Article Comments Table
CREATE TABLE IF NOT EXISTS article_comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL,
    user_id UUID,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- 2. Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'newsletter' CHECK (type IN ('newsletter', 'notification', 'welcome', 'reminder')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Email Subscribers Table
CREATE TABLE IF NOT EXISTS email_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'unsubscribed', 'bounced')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Performance Logs Table
CREATE TABLE IF NOT EXISTS performance_logs (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time INTEGER NOT NULL, -- in milliseconds
    status_code INTEGER NOT NULL,
    error_message TEXT,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Security Audit Logs Table
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id UUID,
    user_email VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Advertisement Table
CREATE TABLE IF NOT EXISTS advertisements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    click_url VARCHAR(500),
    position VARCHAR(50) NOT NULL CHECK (position IN ('header', 'sidebar', 'footer', 'content', 'popup')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    advertiser_id INTEGER,
    click_count INTEGER DEFAULT 0,
    impression_count INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Advertisers Table
CREATE TABLE IF NOT EXISTS advertisers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    website VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Mobile App Settings Table
CREATE TABLE IF NOT EXISTS mobile_app_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Push Notifications Table
CREATE TABLE IF NOT EXISTS push_notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    icon_url VARCHAR(500),
    click_url VARCHAR(500),
    target_users JSONB DEFAULT '{"type": "all"}'::jsonb,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Fix User Achievements Table (add missing column)
ALTER TABLE user_achievements 
ADD COLUMN IF NOT EXISTS earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_status ON article_comments(status);
CREATE INDEX IF NOT EXISTS idx_article_comments_created_at ON article_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(subscription_status);

CREATE INDEX IF NOT EXISTS idx_performance_logs_endpoint ON performance_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_performance_logs_created_at ON performance_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_advertisements_position ON advertisements(position);
CREATE INDEX IF NOT EXISTS idx_advertisements_status ON advertisements(status);

CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON push_notifications(status);
CREATE INDEX IF NOT EXISTS idx_push_notifications_scheduled_at ON push_notifications(scheduled_at);

-- Insert sample data for testing

-- Sample Email Templates
INSERT INTO email_templates (name, subject, content, type) VALUES
('নিউজলেটার টেমপ্লেট', 'প্রথম আলো সাপ্তাহিক নিউজলেটার', 'সপ্তাহের সেরা খবরগুলো দেখুন...', 'newsletter'),
('স্বাগতম ইমেইল', 'প্রথম আলোতে স্বাগতম', 'আমাদের প্ল্যাটফর্মে যোগ দেওয়ার জন্য ধন্যবাদ...', 'welcome'),
('ব্রেকিং নিউজ', 'জরুরি সংবাদ - {{title}}', 'এই মুহূর্তে ঘটে যাওয়া গুরুত্বপূর্ণ সংবাদ...', 'notification')
ON CONFLICT DO NOTHING;

-- Sample Email Subscribers
INSERT INTO email_subscribers (email, name, subscription_status) VALUES
('user1@example.com', 'রহিম উদ্দিন', 'active'),
('user2@example.com', 'ফাতেমা খাতুন', 'active'),
('user3@example.com', 'করিম আহমেদ', 'active')
ON CONFLICT DO NOTHING;

-- Sample Advertisers
INSERT INTO advertisers (name, email, company, website) VALUES
('বাংলা এজেন্সি', 'contact@banglaagency.com', 'বাংলা মার্কেটিং এজেন্সি', 'https://banglaagency.com'),
('ঢাকা কর্পোরেশন', 'info@dhakacorp.com', 'ঢাকা কর্পোরেশন', 'https://dhakacorp.com')
ON CONFLICT DO NOTHING;

-- Sample Mobile App Settings
INSERT INTO mobile_app_settings (setting_key, setting_value, description, data_type) VALUES
('app_version', '1.0.0', 'Current mobile app version', 'string'),
('push_notifications_enabled', 'true', 'Enable push notifications', 'boolean'),
('api_base_url', 'https://your-app.replit.app/api', 'API base URL for mobile app', 'string'),
('refresh_interval', '300', 'Content refresh interval in seconds', 'number')
ON CONFLICT DO NOTHING;

-- Update achievements table to fix the missing column error
UPDATE user_achievements 
SET earned_at = created_at 
WHERE earned_at IS NULL;

-- Enable Row Level Security
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for article_comments
CREATE POLICY "Users can view approved comments" ON article_comments
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own comments" ON article_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" ON article_comments
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for email_subscribers
CREATE POLICY "Users can manage their own subscription" ON email_subscribers
  FOR ALL USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Admins can manage all subscribers" ON email_subscribers
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for other admin tables
CREATE POLICY "Admins can manage email templates" ON email_templates
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view performance logs" ON performance_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view security audit logs" ON security_audit_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage advertisements" ON advertisements
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage advertisers" ON advertisers
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage mobile app settings" ON mobile_app_settings
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage push notifications" ON push_notifications
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Success message
SELECT 'All missing admin tables created successfully!' as status;