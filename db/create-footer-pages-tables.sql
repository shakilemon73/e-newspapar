-- ===================================================================
-- CREATE FOOTER PAGES TABLES FOR SUPABASE
-- This script creates all necessary tables for footer pages functionality
-- Run this in your Supabase SQL Editor
-- ===================================================================

-- 1. TEAM MEMBERS TABLE (for About page)
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  bio TEXT,
  image_url VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(50),
  join_date DATE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. COMPANY INFO TABLE (for About page)
CREATE TABLE IF NOT EXISTS company_info (
  id SERIAL PRIMARY KEY,
  section VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CONTACT INFO TABLE (for Contact page)
CREATE TABLE IF NOT EXISTS contact_info (
  id SERIAL PRIMARY KEY,
  department VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  working_hours VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CONTACT MESSAGES TABLE (for Contact form submissions)
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  department VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AD PACKAGES TABLE (for Advertisement page)
CREATE TABLE IF NOT EXISTS ad_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration VARCHAR(100),
  features TEXT[], -- Array of features
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AD RATES TABLE (for Advertisement page)
CREATE TABLE IF NOT EXISTS ad_rates (
  id SERIAL PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  size VARCHAR(100),
  rate_per_day DECIMAL(10,2),
  rate_per_week DECIMAL(10,2),
  rate_per_month DECIMAL(10,2),
  discount_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. EDITORIAL POLICIES TABLE (for Editorial Policy page)
CREATE TABLE IF NOT EXISTS editorial_policies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. EDITORIAL GUIDELINES TABLE (for Editorial Policy page)
CREATE TABLE IF NOT EXISTS editorial_guidelines (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PRIVACY POLICY SECTIONS TABLE (for Privacy Policy page)
CREATE TABLE IF NOT EXISTS privacy_policy_sections (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  section_type VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TERMS OF SERVICE SECTIONS TABLE (for Terms of Service page)
CREATE TABLE IF NOT EXISTS terms_of_service_sections (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  section_type VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ===================================================================

-- Indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_featured ON team_members(is_featured);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);

-- Indexes for company_info
CREATE INDEX IF NOT EXISTS idx_company_info_section ON company_info(section);
CREATE INDEX IF NOT EXISTS idx_company_info_active ON company_info(is_active);
CREATE INDEX IF NOT EXISTS idx_company_info_order ON company_info(display_order);

-- Indexes for contact_info
CREATE INDEX IF NOT EXISTS idx_contact_info_primary ON contact_info(is_primary);
CREATE INDEX IF NOT EXISTS idx_contact_info_department ON contact_info(department);

-- Indexes for contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at);

-- Indexes for ad_packages
CREATE INDEX IF NOT EXISTS idx_ad_packages_active ON ad_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_packages_popular ON ad_packages(is_popular);

-- Indexes for ad_rates
CREATE INDEX IF NOT EXISTS idx_ad_rates_active ON ad_rates(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_rates_category ON ad_rates(category);

-- Indexes for editorial_policies
CREATE INDEX IF NOT EXISTS idx_editorial_policies_active ON editorial_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_editorial_policies_priority ON editorial_policies(priority);

-- Indexes for editorial_guidelines
CREATE INDEX IF NOT EXISTS idx_editorial_guidelines_active ON editorial_guidelines(is_active);
CREATE INDEX IF NOT EXISTS idx_editorial_guidelines_mandatory ON editorial_guidelines(is_mandatory);

-- Indexes for privacy_policy_sections
CREATE INDEX IF NOT EXISTS idx_privacy_policy_active ON privacy_policy_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_privacy_policy_order ON privacy_policy_sections(display_order);

-- Indexes for terms_of_service_sections
CREATE INDEX IF NOT EXISTS idx_terms_service_active ON terms_of_service_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_terms_service_order ON terms_of_service_sections(display_order);

-- ===================================================================
-- SUCCESS MESSAGE
-- ===================================================================
SELECT 'Footer Pages Tables Created Successfully! 🎉' AS message;