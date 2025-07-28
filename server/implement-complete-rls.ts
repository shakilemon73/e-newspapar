import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function executeSQL(sql: string, description: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('query', { query: sql });
    if (error) {
      console.log(`❌ ${description}: ${error.message}`);
      return false;
    } else {
      console.log(`✅ ${description}: Success`);
      return true;
    }
  } catch (e: any) {
    console.log(`❌ ${description}: ${e.message}`);
    return false;
  }
}

async function implementCompleteRLS() {
  console.log('🔒 IMPLEMENTING COMPLETE RLS SECURITY SYSTEM');
  console.log('===========================================\n');

  let totalOperations = 0;
  let successfulOperations = 0;

  // 1. CREATE MISSING user_storage TABLE
  console.log('1️⃣ CREATING MISSING TABLES:');
  console.log('===========================');
  
  const createUserStorage = `
    CREATE TABLE IF NOT EXISTS user_storage (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      storage_key TEXT NOT NULL,
      storage_value JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, storage_key)
    );
  `;
  
  totalOperations++;
  if (await executeSQL(createUserStorage, 'Create user_storage table')) {
    successfulOperations++;
  }

  // 2. ENABLE RLS ON ALL TABLES
  console.log('\n2️⃣ ENABLING ROW LEVEL SECURITY:');
  console.log('===============================');
  
  const allTables = [
    'articles', 'categories', 'breaking_news', 'video_content', 'audio_articles',
    'epapers', 'weather', 'user_profiles', 'user_settings', 'article_ai_analysis',
    'user_likes', 'user_bookmarks', 'user_interactions', 'page_views', 'trending_topics',
    'polls', 'tags', 'article_tags', 'media_files', 'newsletters', 'surveys',
    'reviews', 'ratings', 'logs', 'error_logs', 'audit_logs', 'system_settings',
    'admin_actions', 'interaction_logs', 'click_tracking', 'engagement_metrics',
    'user_reading_history', 'article_analytics', 'documents', 'user_roles',
    'user_sessions', 'user_permissions', 'user_shares', 'user_storage'
  ];

  for (const table of allTables) {
    totalOperations++;
    if (await executeSQL(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`, `Enable RLS on ${table}`)) {
      successfulOperations++;
    }
  }

  // 3. DROP EXISTING PERMISSIVE POLICIES
  console.log('\n3️⃣ REMOVING INSECURE POLICIES:');
  console.log('==============================');
  
  const dropPolicies = [
    'DROP POLICY IF EXISTS "Enable read access for anon" ON user_profiles;',
    'DROP POLICY IF EXISTS "Allow anonymous access" ON user_profiles;',
    'DROP POLICY IF EXISTS "Enable read access for anon" ON user_settings;',
    'DROP POLICY IF EXISTS "Allow anonymous access" ON user_settings;',
    'DROP POLICY IF EXISTS "Enable read access for anon" ON admin_actions;',
    'DROP POLICY IF EXISTS "Allow anonymous access" ON admin_actions;',
    'DROP POLICY IF EXISTS "Enable read access for anon" ON user_reading_history;',
    'DROP POLICY IF EXISTS "Allow anonymous access" ON user_reading_history;',
    'DROP POLICY IF EXISTS "Enable read access for anon" ON user_interactions;',
    'DROP POLICY IF EXISTS "Allow anonymous access" ON user_interactions;'
  ];

  for (const policy of dropPolicies) {
    totalOperations++;
    if (await executeSQL(policy, 'Drop insecure policy')) {
      successfulOperations++;
    }
  }

  // 4. CREATE COMPREHENSIVE SECURITY POLICIES
  console.log('\n4️⃣ CREATING SECURITY POLICIES:');
  console.log('==============================');

  const securityPolicies = [
    // PUBLIC CONTENT TABLES
    {
      table: 'articles',
      policies: [
        'CREATE POLICY "Public read published articles" ON articles FOR SELECT TO anon USING (is_published = true);',
        'CREATE POLICY "Authenticated read all articles" ON articles FOR SELECT TO authenticated USING (true);',
        'CREATE POLICY "Admin manage articles" ON articles FOR ALL TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'categories',
      policies: [
        'CREATE POLICY "Public read categories" ON categories FOR SELECT TO anon USING (true);',
        'CREATE POLICY "Admin manage categories" ON categories FOR ALL TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'breaking_news',
      policies: [
        'CREATE POLICY "Public read active breaking news" ON breaking_news FOR SELECT TO anon USING (is_active = true);',
        'CREATE POLICY "Admin manage breaking news" ON breaking_news FOR ALL TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'video_content',
      policies: [
        'CREATE POLICY "Public read published videos" ON video_content FOR SELECT TO anon USING (is_published = true);',
        'CREATE POLICY "Admin manage videos" ON video_content FOR ALL TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'audio_articles',
      policies: [
        'CREATE POLICY "Public read published audio" ON audio_articles FOR SELECT TO anon USING (is_published = true);',
        'CREATE POLICY "Admin manage audio" ON audio_articles FOR ALL TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'epapers',
      policies: [
        'CREATE POLICY "Public read published epapers" ON epapers FOR SELECT TO anon USING (is_published = true);',
        'CREATE POLICY "Admin manage epapers" ON epapers FOR ALL TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'weather',
      policies: [
        'CREATE POLICY "Public read weather" ON weather FOR SELECT TO anon USING (true);',
        'CREATE POLICY "Service update weather" ON weather FOR ALL TO service_role USING (true);'
      ]
    },
    {
      table: 'system_settings',
      policies: [
        'CREATE POLICY "Public read settings" ON system_settings FOR SELECT TO anon USING (true);',
        'CREATE POLICY "Admin manage settings" ON system_settings FOR ALL TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },

    // USER PERSONAL DATA
    {
      table: 'user_profiles',
      policies: [
        'CREATE POLICY "Users view own profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);',
        'CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);',
        'CREATE POLICY "Users create own profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);',
        'CREATE POLICY "Admin view all profiles" ON user_profiles FOR SELECT TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'user_settings',
      policies: [
        'CREATE POLICY "Users manage own settings" ON user_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);',
        'CREATE POLICY "Admin view all settings" ON user_settings FOR SELECT TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'user_storage',
      policies: [
        'CREATE POLICY "Users manage own storage" ON user_storage FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);',
        'CREATE POLICY "Admin view all storage" ON user_storage FOR SELECT TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'user_reading_history',
      policies: [
        'CREATE POLICY "Users manage own reading history" ON user_reading_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);',
        'CREATE POLICY "Admin analytics access" ON user_reading_history FOR SELECT TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'user_likes',
      policies: [
        'CREATE POLICY "Users manage own likes" ON user_likes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);',
        'CREATE POLICY "Public read like counts" ON user_likes FOR SELECT TO anon USING (true);'
      ]
    },
    {
      table: 'user_bookmarks',
      policies: [
        'CREATE POLICY "Users manage own bookmarks" ON user_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);'
      ]
    },
    {
      table: 'user_interactions',
      policies: [
        'CREATE POLICY "Users manage own interactions" ON user_interactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);',
        'CREATE POLICY "Admin analytics access interactions" ON user_interactions FOR SELECT TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'user_shares',
      policies: [
        'CREATE POLICY "Users manage own shares" ON user_shares FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);'
      ]
    },

    // ADMIN ONLY TABLES
    {
      table: 'admin_actions',
      policies: [
        'CREATE POLICY "Admin only access" ON admin_actions FOR ALL TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'audit_logs',
      policies: [
        'CREATE POLICY "Admin read audit logs" ON audit_logs FOR SELECT TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');',
        'CREATE POLICY "Service create audit logs" ON audit_logs FOR INSERT TO service_role WITH CHECK (true);'
      ]
    },
    {
      table: 'error_logs',
      policies: [
        'CREATE POLICY "Admin read error logs" ON error_logs FOR SELECT TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'logs',
      policies: [
        'CREATE POLICY "Admin read system logs" ON logs FOR SELECT TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },

    // ANALYTICS & TRACKING
    {
      table: 'page_views',
      policies: [
        'CREATE POLICY "Anonymous track page views" ON page_views FOR INSERT TO anon WITH CHECK (true);',
        'CREATE POLICY "Admin analytics access page views" ON page_views FOR ALL TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'click_tracking',
      policies: [
        'CREATE POLICY "Anonymous track clicks" ON click_tracking FOR INSERT TO anon WITH CHECK (true);',
        'CREATE POLICY "Admin analytics access clicks" ON click_tracking FOR ALL TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    },
    {
      table: 'article_analytics',
      policies: [
        'CREATE POLICY "Public read article stats" ON article_analytics FOR SELECT TO anon USING (true);',
        'CREATE POLICY "Service update analytics" ON article_analytics FOR ALL TO service_role USING (true);',
        'CREATE POLICY "Admin manage analytics" ON article_analytics FOR ALL TO authenticated USING (auth.jwt() ->> \'role\' = \'admin\');'
      ]
    }
  ];

  // Execute all security policies
  for (const tablePolicy of securityPolicies) {
    console.log(`🔒 Securing ${tablePolicy.table}:`);
    for (const policy of tablePolicy.policies) {
      totalOperations++;
      if (await executeSQL(policy, `  Policy for ${tablePolicy.table}`)) {
        successfulOperations++;
      }
    }
  }

  // 5. CREATE INDEXES FOR PERFORMANCE
  console.log('\n5️⃣ CREATING PERFORMANCE INDEXES:');
  console.log('=================================');
  
  const performanceIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_user_storage_user_id ON user_storage(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_user_reading_history_user_id ON user_reading_history(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);',
    'CREATE INDEX IF NOT EXISTS idx_weather_city ON weather(city);'
  ];

  for (const index of performanceIndexes) {
    totalOperations++;
    if (await executeSQL(index, 'Create performance index')) {
      successfulOperations++;
    }
  }

  // 6. VERIFY SECURITY IMPLEMENTATION
  console.log('\n6️⃣ VERIFYING SECURITY IMPLEMENTATION:');
  console.log('====================================');
  
  // Test anonymous access patterns
  const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const securityTests = [
    { table: 'articles', expectAccess: true, description: 'Public articles access' },
    { table: 'user_profiles', expectAccess: false, description: 'User profiles security' },
    { table: 'admin_actions', expectAccess: false, description: 'Admin actions security' },
    { table: 'user_storage', expectAccess: false, description: 'User storage security' },
    { table: 'weather', expectAccess: true, description: 'Public weather access' }
  ];

  let securityScore = 0;
  const totalTests = securityTests.length;

  for (const test of securityTests) {
    try {
      const { data, error } = await anonClient
        .from(test.table)
        .select('*')
        .limit(1);

      if (test.expectAccess) {
        if (!error) {
          console.log(`✅ ${test.description}: Access OK (${data?.length || 0} rows)`);
          securityScore++;
        } else {
          console.log(`❌ ${test.description}: Unexpected block - ${error.message}`);
        }
      } else {
        if (error && error.code === '42501') {
          console.log(`✅ ${test.description}: Properly secured`);
          securityScore++;
        } else if (!error) {
          console.log(`❌ ${test.description}: SECURITY BREACH - Access allowed`);
        } else {
          console.log(`⚠️  ${test.description}: ${error.message}`);
        }
      }
    } catch (e: any) {
      console.log(`❌ ${test.description}: ${e.message}`);
    }
  }

  // Final assessment
  console.log('\n🎯 IMPLEMENTATION SUMMARY:');
  console.log('=========================');
  
  const successRate = Math.round((successfulOperations / totalOperations) * 100);
  const securityRate = Math.round((securityScore / totalTests) * 100);

  console.log(`Database Operations: ${successfulOperations}/${totalOperations} (${successRate}%)`);
  console.log(`Security Tests: ${securityScore}/${totalTests} (${securityRate}%)`);

  if (successRate >= 90 && securityRate >= 90) {
    console.log('🔒 EXCELLENT: World-class security system implemented');
    console.log('✅ READY FOR PRODUCTION DEPLOYMENT');
  } else if (successRate >= 75 || securityRate >= 75) {
    console.log('✅ GOOD: Most security policies implemented');
    console.log('⚠️  Some manual verification recommended');
  } else {
    console.log('❌ ISSUES: Security implementation needs attention');
    console.log('🔧 Manual intervention required');
  }

  return { successRate, securityRate, successfulOperations, totalOperations };
}

// Execute comprehensive RLS implementation
implementCompleteRLS().then((results) => {
  console.log('\n🚀 RLS IMPLEMENTATION COMPLETED');
  console.log(`Overall Success: ${results.successfulOperations}/${results.totalOperations} operations`);
  
  if (results.successRate >= 90 && results.securityRate >= 90) {
    console.log('🎉 World-class security system ready for Vercel deployment!');
  } else {
    console.log('🔧 Some security policies may need manual adjustment');
  }
  
  process.exit(0);
}).catch((error) => {
  console.error('❌ RLS implementation failed:', error);
  process.exit(1);
});