# Fix Vercel Deployment Errors - Database Setup Instructions

## Problem
Your Vercel deployment is failing with these errors:
- 404 errors for missing database tables: `user_settings`, `reading_history`, `user_storage`
- 403/406 errors due to Row Level Security (RLS) policy issues
- Missing API endpoints causing JSON parsing errors

## Solution
Execute the SQL commands in `db/fix-vercel-errors.sql` in your Supabase database.

## Steps to Fix

### 1. Open Supabase SQL Editor
1. Go to [supabase.com](https://supabase.com)
2. Login to your project: `mrjukcqspvhketnfzmud`
3. Navigate to SQL Editor in the left sidebar

### 2. Execute the Fix SQL
1. Copy the entire content from `db/fix-vercel-errors.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute all commands

### 3. Verify Tables Created
After running the SQL, verify these tables exist:
- `user_settings` - User preferences and site settings
- `user_storage` - User data storage for offline functionality  
- `reading_history` - Track user reading history
- `weather` - Weather data with proper RLS policies

### 4. Test the Deployment
After executing the SQL:
1. Redeploy your Vercel application
2. Check the browser console - the 404/403 errors should be resolved
3. The site should load without database-related errors

## What the SQL Fix Does

✅ **Creates Missing Tables**: Adds `user_settings`, `user_storage`, `reading_history`
✅ **Fixes RLS Policies**: Proper Row Level Security for all tables including `weather`
✅ **Adds Indexes**: Performance optimization for database queries
✅ **Creates Helper Functions**: `upsert_user_setting`, `upsert_user_storage`, `track_reading_history`
✅ **Grants Permissions**: Allows anonymous and authenticated users proper access
✅ **Sample Data**: Prevents empty table errors with initial data

## Expected Result
After running this SQL, your Bengali news website should deploy successfully on Vercel without any database-related console errors.