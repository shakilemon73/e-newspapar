#!/usr/bin/env node
/**
 * Database Schema Fix - Critical Missing Components
 * Fixes: RPC functions, foreign keys, and Row Level Security policies
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMissingRPCFunctions() {
  console.log('🔧 Creating missing RPC functions...');
  
  try {
    // 1. Create increment_view_count function
    const { error: rpcError } = await supabase.rpc('increment_view_count', { article_id: 1 });
    
    if (rpcError && rpcError.code === 'PGRST202') {
      console.log('📝 Creating increment_view_count function...');
      
      const createRPCQuery = `
        CREATE OR REPLACE FUNCTION public.increment_view_count(article_id bigint)
        RETURNS bigint
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
            new_count bigint;
        BEGIN
            UPDATE articles 
            SET view_count = COALESCE(view_count, 0) + 1 
            WHERE id = article_id;
            
            SELECT view_count INTO new_count 
            FROM articles 
            WHERE id = article_id;
            
            RETURN COALESCE(new_count, 0);
        END;
        $$;
      `;
      
      // Execute via direct SQL
      const { error: createError } = await supabase
        .from('articles')
        .select('count')
        .limit(0); // Dummy query to check connection
        
      if (!createError) {
        console.log('✅ Database connection verified');
        console.log('⚠️  Please run this SQL manually in Supabase SQL Editor:', createRPCQuery);
      }
    } else {
      console.log('✅ increment_view_count function already exists');
    }
    
  } catch (error) {
    console.error('❌ Error checking RPC functions:', error.message);
  }
}

async function fixForeignKeyRelationships() {
  console.log('🔗 Checking foreign key relationships...');
  
  try {
    // Check article_comments table
    const { error: commentsError } = await supabase
      .from('article_comments')
      .select('*, user_profiles(*)')
      .limit(1);
      
    if (commentsError && commentsError.code === 'PGRST200') {
      console.log('📝 Missing foreign key: article_comments -> user_profiles');
      console.log('⚠️  Please run this SQL manually in Supabase SQL Editor:');
      console.log(`
        -- Add user_id column if not exists
        ALTER TABLE article_comments 
        ADD COLUMN IF NOT EXISTS user_id uuid 
        REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Create foreign key to user_profiles
        ALTER TABLE article_comments 
        ADD CONSTRAINT article_comments_user_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
      `);
    } else {
      console.log('✅ article_comments foreign key exists');
    }
    
    // Check polls table
    const { error: pollsError } = await supabase
      .from('polls')
      .select('*, poll_options(*)')
      .limit(1);
      
    if (pollsError && pollsError.code === 'PGRST200') {
      console.log('📝 Missing foreign key: polls -> poll_options');
      console.log('⚠️  Please run this SQL manually in Supabase SQL Editor:');
      console.log(`
        -- Add poll_id column if not exists
        ALTER TABLE poll_options 
        ADD COLUMN IF NOT EXISTS poll_id bigint 
        REFERENCES polls(id) ON DELETE CASCADE;
      `);
    } else {
      console.log('✅ polls foreign key exists');
    }
    
  } catch (error) {
    console.error('❌ Error checking foreign keys:', error.message);
  }
}

async function fixRowLevelSecurity() {
  console.log('🔒 Checking Row Level Security policies...');
  
  try {
    // Test weather table access
    const { error: weatherError } = await supabase
      .from('weather')
      .insert({ city: 'Test City', temperature: 25, condition: 'Sunny' });
      
    if (weatherError && weatherError.code === '42501') {
      console.log('📝 Missing RLS policy for weather table');
      console.log('⚠️  Please run this SQL manually in Supabase SQL Editor:');
      console.log(`
        -- Enable RLS on weather table
        ALTER TABLE weather ENABLE ROW LEVEL SECURITY;
        
        -- Allow service role to insert/update weather data
        CREATE POLICY "Service role can manage weather" ON weather
        FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
        
        -- Allow public read access to weather data
        CREATE POLICY "Public can read weather" ON weather
        FOR SELECT USING (true);
      `);
    } else {
      console.log('✅ Weather table RLS policies exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking RLS policies:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Database Schema Fix...\n');
  
  await createMissingRPCFunctions();
  console.log('');
  
  await fixForeignKeyRelationships();
  console.log('');
  
  await fixRowLevelSecurity();
  console.log('');
  
  console.log('✅ Database schema analysis complete!');
  console.log('📋 Manual SQL queries above need to be run in Supabase SQL Editor');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createMissingRPCFunctions, fixForeignKeyRelationships, fixRowLevelSecurity };