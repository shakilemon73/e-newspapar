import { supabase } from './supabase';

async function createUserProfilesTable() {
  try {
    console.log('Creating/updating user_profiles table...');

    // First check if table exists
    const { data: existingData, error: existsError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (existsError && existsError.code === '42P01') {
      console.log('user_profiles table does not exist, creating it...');
      
      // Create the table using direct SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE user_profiles (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT,
            avatar_url TEXT,
            bio TEXT,
            location TEXT,
            phone TEXT,
            website TEXT,
            occupation TEXT,
            gender TEXT CHECK (gender IN ('male', 'female', 'other')),
            date_of_birth DATE,
            reading_preferences JSONB DEFAULT '{
              "language": "bn",
              "font_size": "medium",
              "dark_mode": false,
              "notifications": true,
              "email_digest": false,
              "auto_bookmark": false
            }'::jsonb,
            privacy_settings JSONB DEFAULT '{
              "profile_visible": true,
              "activity_visible": true,
              "reading_history_visible": false
            }'::jsonb,
            favorite_categories TEXT[] DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Create indexes
          CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
          CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

          -- Enable RLS
          ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

          -- Create policies
          CREATE POLICY "Users can view own profile" ON user_profiles
            FOR SELECT USING (auth.uid() = user_id);

          CREATE POLICY "Users can insert own profile" ON user_profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Users can update own profile" ON user_profiles
            FOR UPDATE USING (auth.uid() = user_id);
        `
      });

      if (createError) {
        console.error('Error creating user_profiles table:', createError);
        return;
      }

      console.log('✅ user_profiles table created successfully');
    } else if (existsError) {
      console.error('Error checking user_profiles table:', existsError);
      return;
    } else {
      console.log('✅ user_profiles table already exists');
    }

    // Get test user to create sample profile
    const { data: { users } } = await supabase.auth.admin.listUsers();
    if (users.length === 0) {
      console.log('No users found for sample profile creation');
      return;
    }

    const testUser = users[0];
    console.log(`Creating sample profile for: ${testUser.email}`);

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUser.id)
      .single();

    if (!existingProfile) {
      // Create sample profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: testUser.id,
          full_name: testUser.user_metadata?.full_name || 'ব্যবহারকারী',
          bio: 'আমি একজন নিয়মিত পাঠক এবং বাংলা সংবাদের প্রতি আগ্রহী।',
          location: 'ঢাকা, বাংলাদেশ',
          reading_preferences: {
            language: 'bn',
            font_size: 'medium',
            dark_mode: false,
            notifications: true,
            email_digest: true,
            auto_bookmark: false
          },
          privacy_settings: {
            profile_visible: true,
            activity_visible: true,
            reading_history_visible: false
          },
          favorite_categories: ['1', '2', '3'], // Sample category IDs
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating sample profile:', insertError);
      } else {
        console.log('✅ Sample user profile created successfully');
      }
    } else {
      console.log('✅ User profile already exists');
    }

    console.log('\n🎉 user_profiles table setup completed successfully!');

  } catch (error) {
    console.error('Error in createUserProfilesTable:', error);
  }
}

createUserProfilesTable();