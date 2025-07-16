import { supabase } from './index';

/**
 * Set up all database tables for footer pages functionality
 * This replaces static mock data with actual Supabase tables
 */
export async function setupFooterPagesTables() {
  try {
    console.log('🚀 Setting up Footer Pages Tables...');

    // 1. Create team_members table for About page
    const teamMembersSQL = `
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
    `;
    
    const { error: teamError } = await supabase.rpc('exec_sql', { sql: teamMembersSQL });
    if (teamError) console.log('team_members table:', teamError.message);
    else console.log('✅ team_members table created');

    // 2. Create company_info table for About page
    const companyInfoSQL = `
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
    `;
    
    const { error: companyError } = await supabase.rpc('exec_sql', { sql: companyInfoSQL });
    if (companyError) console.log('company_info table:', companyError.message);
    else console.log('✅ company_info table created');

    // 3. Create contact_info table for Contact page
    const contactInfoSQL = `
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
    `;
    
    const { error: contactError } = await supabase.rpc('exec_sql', { sql: contactInfoSQL });
    if (contactError) console.log('contact_info table:', contactError.message);
    else console.log('✅ contact_info table created');

    // 4. Create contact_messages table
    const contactMessagesSQL = `
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
    `;
    
    const { error: messagesError } = await supabase.rpc('exec_sql', { sql: contactMessagesSQL });
    if (messagesError) console.log('contact_messages table:', messagesError.message);
    else console.log('✅ contact_messages table created');

    // 5. Create ad_packages table for Advertisement page
    const adPackagesSQL = `
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
    `;
    
    const { error: packagesError } = await supabase.rpc('exec_sql', { sql: adPackagesSQL });
    if (packagesError) console.log('ad_packages table:', packagesError.message);
    else console.log('✅ ad_packages table created');

    // 6. Create ad_rates table for Advertisement page
    const adRatesSQL = `
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
    `;
    
    const { error: ratesError } = await supabase.rpc('exec_sql', { sql: adRatesSQL });
    if (ratesError) console.log('ad_rates table:', ratesError.message);
    else console.log('✅ ad_rates table created');

    // 7. Create editorial_policies table
    const editorialPoliciesSQL = `
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
    `;
    
    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: editorialPoliciesSQL });
    if (policiesError) console.log('editorial_policies table:', policiesError.message);
    else console.log('✅ editorial_policies table created');

    // 8. Create editorial_guidelines table
    const editorialGuidelinesSQL = `
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
    `;
    
    const { error: guidelinesError } = await supabase.rpc('exec_sql', { sql: editorialGuidelinesSQL });
    if (guidelinesError) console.log('editorial_guidelines table:', guidelinesError.message);
    else console.log('✅ editorial_guidelines table created');

    // 9. Create privacy_policy_sections table
    const privacyPolicySQL = `
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
    `;
    
    const { error: privacyError } = await supabase.rpc('exec_sql', { sql: privacyPolicySQL });
    if (privacyError) console.log('privacy_policy_sections table:', privacyError.message);
    else console.log('✅ privacy_policy_sections table created');

    // 10. Create terms_of_service_sections table
    const termsOfServiceSQL = `
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
    `;
    
    const { error: termsError } = await supabase.rpc('exec_sql', { sql: termsOfServiceSQL });
    if (termsError) console.log('terms_of_service_sections table:', termsError.message);
    else console.log('✅ terms_of_service_sections table created');

    console.log('🎉 Footer Pages Tables Setup Complete!');
    return { success: true, message: 'All footer pages tables created successfully' };

  } catch (error) {
    console.error('❌ Error setting up footer pages tables:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Seed sample data for footer pages
 */
export async function seedFooterPagesData() {
  console.log('🌱 Seeding footer pages data...');

  // Seed team members
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

  for (const member of teamMembers) {
    await supabase.from('team_members').insert(member);
  }

  // Seed contact info
  const contactInfo = [
    {
      department: 'সম্পাদকীয় বিভাগ',
      phone: '০২-৮৩৪৮৮৬৭',
      email: 'editorial@prothomalo.com',
      address: '১৯/এ, মমতাজ প্যালেস, পুরানা পল্টন, ঢাকা-১০০০',
      working_hours: 'সকাল ৯টা - সন্ধ্যা ৬টা',
      is_primary: true
    }
  ];

  for (const info of contactInfo) {
    await supabase.from('contact_info').insert(info);
  }

  console.log('✅ Footer pages data seeded successfully');
}

// Run if called directly
if (require.main === module) {
  setupFooterPagesTables().then(result => {
    console.log('Setup result:', result);
    if (result.success) {
      seedFooterPagesData();
    }
  });
}