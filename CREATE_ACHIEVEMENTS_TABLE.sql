-- Create achievements table for Bengali News Website
-- Run this SQL in your Supabase SQL Editor

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL,
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample achievements in Bengali
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('প্রথম পাঠক', 'আপনার প্রথম নিবন্ধ পড়েছেন', 'BookOpen', 'articles_read', 1),
('নিয়মিত পাঠক', '১০টি নিবন্ধ পড়েছেন', 'Trophy', 'articles_read', 10),
('প্রাণবন্ত পাঠক', '৫০টি নিবন্ধ পড়েছেন', 'Award', 'articles_read', 50),
('গ্রন্থকীট', '১০০টি নিবন্ধ পড়েছেন', 'Star', 'articles_read', 100),
('সংগ্রাহক', '৫টি নিবন্ধ সংরক্ষণ করেছেন', 'Heart', 'articles_saved', 5),
('সংরক্ষণকারী', '২০টি নিবন্ধ সংরক্ষণ করেছেন', 'Archive', 'articles_saved', 20),
('সাত দিনের স্ট্রিক', '৭ দিন একনাগাড়ে পড়েছেন', 'Zap', 'reading_streak', 7),
('মাসিক পাঠক', '৩০ দিন একনাগাড়ে পড়েছেন', 'Calendar', 'reading_streak', 30),
('বিভাগ অন্বেষণকারী', '৫টি ভিন্ন বিভাগ থেকে পড়েছেন', 'Target', 'categories_explored', 5),
('সক্রিয় ব্যবহারকারী', '১০০টি ইন্টারঅ্যাকশন সম্পন্ন করেছেন', 'Activity', 'total_interactions', 100);

-- Enable Row Level Security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (everyone can see available achievements)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_achievements_requirement_type ON achievements(requirement_type);

-- Verify table creation
SELECT COUNT(*) as total_achievements FROM achievements;