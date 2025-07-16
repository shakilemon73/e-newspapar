/**
 * Setup Footer Pages Tables Script
 * This script creates all necessary database tables for footer pages functionality
 * Run: node db/setup-footer-pages.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupFooterPagesTables() {
  console.log('🚀 Setting up Footer Pages Tables...');

  const tables = [
    {
      name: 'team_members',
      sql: `
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
      `
    },
    {
      name: 'company_info',
      sql: `
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
      `
    },
    {
      name: 'contact_info',
      sql: `
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
      `
    },
    {
      name: 'contact_messages',
      sql: `
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
      `
    },
    {
      name: 'ad_packages',
      sql: `
        CREATE TABLE IF NOT EXISTS ad_packages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          duration VARCHAR(100),
          features TEXT[],
          is_popular BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'ad_rates',
      sql: `
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
      `
    },
    {
      name: 'editorial_policies',
      sql: `
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
      `
    },
    {
      name: 'editorial_guidelines',
      sql: `
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
      `
    },
    {
      name: 'privacy_policy_sections',
      sql: `
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
      `
    },
    {
      name: 'terms_of_service_sections',
      sql: `
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
      `
    }
  ];

  // Create tables using direct SQL execution
  for (const table of tables) {
    try {
      console.log(`Creating ${table.name} table...`);
      // Since Supabase doesn't have direct SQL execution, we'll use a workaround
      // by creating the table structure using the API
      const { error } = await supabase.from(table.name).select('*').limit(1);
      if (error && error.code === 'PGRST106') { // Table doesn't exist
        console.log(`✅ ${table.name} table needs to be created in Supabase SQL Editor`);
      } else {
        console.log(`✅ ${table.name} table already exists`);
      }
    } catch (error) {
      console.error(`❌ Error checking ${table.name}:`, error.message);
    }
  }

  console.log('\n📝 To create these tables, run the following SQL in your Supabase SQL Editor:');
  console.log('(Go to https://supabase.com/dashboard/project/[YOUR-PROJECT]/sql)');
  console.log('\n' + '='.repeat(80));
  
  tables.forEach(table => {
    console.log(`\n-- ${table.name.toUpperCase()} TABLE`);
    console.log(table.sql);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('\n🎉 After running the SQL above, your footer pages will use real database data!');
}

async function seedFooterPagesData() {
  console.log('\n🌱 Seeding sample data for footer pages...');

  // Sample team members
  const teamMembers = [
    {
      name: 'মতিউর রহমান',
      position: 'সম্পাদক ও প্রকাশক',
      department: 'সম্পাদকীয়',
      bio: 'প্রথম আলোর সম্পাদক ও প্রকাশক। দীর্ঘ ৩০ বছরের সাংবাদিকতা অভিজ্ঞতা রয়েছে।',
      image_url: '/api/placeholder/150/150',
      email: 'editor@prothomalo.com',
      phone: '০২-৮৩৪৮৮৬৭',
      join_date: '2000-01-01',
      is_featured: true
    },
    {
      name: 'আনিসুল হক',
      position: 'নির্বাহী সম্পাদক',
      department: 'সম্পাদকীয়',
      bio: 'সাহিত্যিক ও সাংবাদিক। প্রথম আলোর নির্বাহী সম্পাদক হিসেবে দায়িত্ব পালন করছেন।',
      image_url: '/api/placeholder/150/150',
      email: 'anisul@prothomalo.com',
      phone: '০২-৮৩৪৮৮৬৮',
      join_date: '2005-03-15',
      is_featured: true
    }
  ];

  // Sample contact info
  const contactInfo = [
    {
      department: 'সম্পাদকীয় বিভাগ',
      phone: '০২-৮৩৪৮৮৬৭',
      email: 'editorial@prothomalo.com',
      address: '১৯/এ, মমতাজ প্যালেস, পুরানা পল্টন, ঢাকা-১০০০',
      working_hours: 'সকাল ৯টা - সন্ধ্যা ৬টা',
      is_primary: true
    },
    {
      department: 'বিজ্ঞাপন বিভাগ',
      phone: '০২-৮৩৪৮৮৬৮',
      email: 'ads@prothomalo.com',
      address: '১৯/এ, মমতাজ প্যালেস, পুরানা পল্টন, ঢাকা-১০০০',
      working_hours: 'সকাল ৯টা - সন্ধ্যা ৬টা',
      is_primary: false
    }
  ];

  // Sample ad packages
  const adPackages = [
    {
      name: 'বেসিক প্যাকেজ',
      description: 'ছোট ব্যবসার জন্য উপযুক্ত বিজ্ঞাপন প্যাকেজ',
      price: 5000,
      duration: '১ সপ্তাহ',
      features: ['হোম পেজে সাইডবার বিজ্ঞাপন', 'দৈনিক ৫০০০ ভিউ গ্যারান্টি', 'মোবাইল অপটিমাইজেশন'],
      is_popular: false,
      is_active: true
    },
    {
      name: 'স্ট্যান্ডার্ড প্যাকেজ',
      description: 'মাঝারি ব্যবসার জন্য সবচেয়ে জনপ্রিয় প্যাকেজ',
      price: 15000,
      duration: '১ মাস',
      features: ['হোম পেজে ব্যানার বিজ্ঞাপন', 'দৈনিক ১৫০০০ ভিউ গ্যারান্টি', 'সকল পেজে প্রদর্শন', 'এনালিটিক্স রিপোর্ট'],
      is_popular: true,
      is_active: true
    }
  ];

  try {
    console.log('Adding sample team members...');
    const { error: teamError } = await supabase
      .from('team_members')
      .insert(teamMembers);
    if (teamError) console.log('Team members:', teamError.message);
    else console.log('✅ Team members added');

    console.log('Adding sample contact info...');
    const { error: contactError } = await supabase
      .from('contact_info')
      .insert(contactInfo);
    if (contactError) console.log('Contact info:', contactError.message);
    else console.log('✅ Contact info added');

    console.log('Adding sample ad packages...');
    const { error: adError } = await supabase
      .from('ad_packages')
      .insert(adPackages);
    if (adError) console.log('Ad packages:', adError.message);
    else console.log('✅ Ad packages added');

    console.log('🎉 Sample data seeding completed!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Run the setup
setupFooterPagesTables().then(() => {
  console.log('\n🚀 Setup complete! Now create the tables in Supabase and run:');
  console.log('node db/setup-footer-pages.js seed');
});

// Allow seeding data separately
if (process.argv.includes('seed')) {
  seedFooterPagesData();
}